// ============================================================================
// @arugami/kernel - Receipt Ledger
// ============================================================================
// Append-only, hash-chained audit log. Every mutation in the system produces
// a receipt. Receipts are immutable — no updates, no deletes.
//
// Hash chain: each receipt includes SHA-256(prev_hash + action + actor + payload + timestamp)
// This provides tamper evidence without requiring a blockchain.
// ============================================================================

import { createHash } from 'crypto';
import { getSupabaseServiceClient } from '../../utils/supabase';
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
import type { Receipt, CreateReceiptInput } from './types';

// ----------------------------------------------------------------------------
// Hash Functions
// ----------------------------------------------------------------------------

/**
 * Normalize a timestamp to a canonical form for hashing.
 * Supabase returns "+00:00" suffix, JS uses "Z" — both mean UTC.
 * We normalize to millisecond-precision ISO with "Z" suffix.
 */
function normalizeTimestamp(ts: string): string {
  return new Date(ts).toISOString();
}

/**
 * Sort object keys recursively for deterministic JSON serialization.
 * PostgreSQL JSONB does NOT preserve key order, so we must normalize
 * before hashing to ensure hash(insert-time) === hash(read-time).
 */
function sortKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sortKeys(item));
  }

  if (typeof obj === 'object') {
    const source = obj as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortKeys(source[key]);
    }
    return sorted;
  }

  return obj;
}

/**
 * Compute the SHA-256 hash for a receipt.
 * Deterministic: same inputs always produce same hash.
 */
export function computeReceiptHash(
  prevHash: string | null,
  action: string,
  actor: string,
  payload: Record<string, unknown>,
  timestamp: string
): string {
  const data = JSON.stringify(sortKeys({
    prev_hash: prevHash,
    action,
    actor,
    payload: sortKeys(payload),
    timestamp: normalizeTimestamp(timestamp),
  }));
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Verify a single receipt's hash is correct given its fields and prev_hash.
 */
export function verifyReceiptHash(receipt: Receipt): boolean {
  const expectedHash = computeReceiptHash(
    receipt.prev_hash,
    receipt.action,
    receipt.actor,
    receipt.payload,
    receipt.created_at
  );
  return receipt.hash === expectedHash;
}

// ----------------------------------------------------------------------------
// Receipt Operations
// ----------------------------------------------------------------------------

/**
 * Get the latest receipt for a client (to chain from).
 * Returns null if no receipts exist yet (first receipt).
 */
export async function getLatestReceipt(clientId: string): Promise<Receipt | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .order('receipt_id', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code === 'PGRST116') {
    // No rows found — this is the first receipt for this client
    return null;
  }

  if (error) {
    throw new Error(`Failed to get latest receipt: ${error.message}`);
  }

  return data as Receipt;
}

/**
 * Create a new receipt, automatically chaining from the previous one.
 * This is the ONLY way to write to the receipts table.
 *
 * Uses service_role client to bypass RLS (receipts are system-written).
 */
export async function createReceipt(input: CreateReceiptInput): Promise<Receipt> {
  const supabase = getSupabaseServiceClient();
  const payload = input.payload ?? {};
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const latest = await getLatestReceipt(input.client_id);
    const prevHash = latest?.hash ?? null;
    const timestamp = new Date().toISOString();
    const hash = computeReceiptHash(
      prevHash,
      input.action,
      input.actor,
      payload,
      timestamp
    );

    const { data, error } = await supabase.rpc('append_kernel_receipt', {
      p_client_id: input.client_id,
      p_hash: hash,
      p_prev_hash: prevHash,
      p_action: input.action,
      p_actor: input.actor,
      p_payload: payload as unknown as Json,
      p_task_id: input.task_id ?? null,
      p_policy_id: input.policy_id ?? null,
      p_created_at: timestamp,
    });

    if (!error) {
      const inserted = Array.isArray(data) ? data[0] : data;
      if (!inserted) {
        throw new Error('Failed to create receipt: append_kernel_receipt returned no row');
      }
      return inserted as Receipt;
    }

    if (error.message.includes('receipt_chain_head_mismatch') && attempt < maxAttempts) {
      continue;
    }

    throw new Error(`Failed to create receipt: ${error.message}`);
  }

  throw new Error('Failed to create receipt: exceeded retry attempts');
}

/**
 * Verify the integrity of a client's receipt chain.
 * Walks backwards from the latest receipt, checking each hash.
 * Returns { valid: true } or { valid: false, brokenAt: receipt_id }.
 */
export async function verifyChain(
  clientId: string,
  limit: number = 100
): Promise<{ valid: boolean; checked: number; brokenAt?: string }> {
  const supabase = getSupabaseServiceClient();

  const { data: receipts, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .order('receipt_id', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch receipts for verification: ${error.message}`);
  }

  if (!receipts || receipts.length === 0) {
    return { valid: true, checked: 0 };
  }

  // Verify each receipt's hash
  for (const receipt of receipts as Receipt[]) {
    if (!verifyReceiptHash(receipt)) {
      return { valid: false, checked: receipts.length, brokenAt: receipt.receipt_id };
    }
  }

  // Verify chain linkage (each receipt's prev_hash matches the next older receipt's hash)
  for (let i = 0; i < receipts.length - 1; i++) {
    const current = receipts[i] as Receipt;
    const previous = receipts[i + 1] as Receipt;
    if (current.prev_hash !== previous.hash) {
      return { valid: false, checked: receipts.length, brokenAt: current.receipt_id };
    }
  }

  return { valid: true, checked: receipts.length };
}

/**
 * Get receipts for a client, most recent first.
 */
export async function getReceipts(
  clientId: string,
  options: { limit?: number; action?: string; taskId?: string; since?: string } = {}
): Promise<Receipt[]> {
  const supabase = getSupabaseServiceClient();
  const { limit = 50, action, taskId, since } = options;

  let query = supabase
    .from('receipts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .order('receipt_id', { ascending: false })
    .limit(limit);

  if (action) {
    query = query.eq('action', action);
  }

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get receipts: ${error.message}`);
  }

  return (data ?? []) as Receipt[];
}
