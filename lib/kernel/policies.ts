// ============================================================================
// @arugami/kernel - Policy Engine
// ============================================================================
// Action gates. Before a worker executes an action, it checks policies.
// Policies can allow, deny, or require approval.
// Every policy check emits a receipt for auditability.
// ============================================================================

import { getSupabaseServiceClient } from '../../utils/supabase';
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
import type { Policy, CreatePolicyInput, PolicyDecision, PolicyEffect } from './types';
import { createReceipt } from './receipts';

// ----------------------------------------------------------------------------
// Policy Evaluation
// ----------------------------------------------------------------------------

/**
 * Evaluate whether an action is allowed for a client.
 * Checks policies in order:
 *   1. Exact match (action + resource)
 *   2. Wildcard resource match (action + '*')
 *   3. Default deny (no matching policy)
 *
 * Returns the decision and the matching policy (if any).
 */
export async function evaluatePolicy(
  clientId: string,
  action: string,
  resource: string = '*'
): Promise<PolicyDecision> {
  const supabase = getSupabaseServiceClient();

  // Look for matching policies (exact resource first, then wildcard)
  const { data: policies, error } = await supabase
    .from('policies')
    .select('*')
    .eq('client_id', clientId)
    .eq('action', action)
    .eq('enabled', true)
    .in('resource', [resource, '*'])
    .order('resource', { ascending: false }); // Exact match before wildcard

  if (error) {
    throw new Error(`Failed to evaluate policy: ${error.message}`);
  }

  let decision: PolicyDecision;

  if (!policies || policies.length === 0) {
    // No policy found — default deny
    decision = {
      effect: 'deny',
      policy: null,
      reason: `No policy found for action "${action}" on resource "${resource}". Default: deny.`,
    };
  } else {
    // Use the most specific matching policy (exact resource > wildcard)
    const matchedPolicy = policies[0] as unknown as Policy;

    // Check conditions if present
    const conditionsMet = matchedPolicy.conditions
      ? evaluateConditions(matchedPolicy.conditions)
      : true;

    if (!conditionsMet) {
      decision = {
        effect: 'deny',
        policy: matchedPolicy,
        reason: `Policy "${matchedPolicy.description ?? matchedPolicy.policy_id}" conditions not met.`,
      };
    } else {
      decision = {
        effect: matchedPolicy.effect as PolicyEffect,
        policy: matchedPolicy,
        reason: `Policy "${matchedPolicy.description ?? matchedPolicy.policy_id}" matched: ${matchedPolicy.effect}.`,
      };
    }
  }

  // Emit receipt for the policy check
  await createReceipt({
    client_id: clientId,
    action: 'policy_checked',
    actor: 'system',
    payload: {
      checked_action: action,
      checked_resource: resource,
      decision: decision.effect,
      reason: decision.reason,
    },
    policy_id: decision.policy?.policy_id,
  });

  return decision;
}

/**
 * Quick check: is this action allowed? (convenience wrapper)
 */
export async function isAllowed(
  clientId: string,
  action: string,
  resource: string = '*'
): Promise<boolean> {
  const decision = await evaluatePolicy(clientId, action, resource);
  return decision.effect === 'allow';
}

/**
 * Quick check: does this action require approval?
 */
export async function requiresApproval(
  clientId: string,
  action: string,
  resource: string = '*'
): Promise<boolean> {
  const decision = await evaluatePolicy(clientId, action, resource);
  return decision.effect === 'require_approval';
}

// ----------------------------------------------------------------------------
// Condition Evaluation (simple v1)
// ----------------------------------------------------------------------------

/**
 * Evaluate policy conditions. V1 is simple — just checks if conditions exist.
 * Future versions will support time windows, rate limits, etc.
 *
 * Example conditions:
 *   { "time_window": "9am-9pm", "max_per_day": 10 }
 *
 * For now, if conditions exist and are non-empty, they pass.
 * This will be expanded in Phase 2.
 */
function evaluateConditions(conditions: Record<string, unknown>): boolean {
  // V1: conditions always pass if they exist
  // TODO: implement time_window, max_per_day, etc.
  return Object.keys(conditions).length >= 0;
}

// ----------------------------------------------------------------------------
// Policy Management
// ----------------------------------------------------------------------------

/**
 * Create a new policy for a client.
 */
export async function createPolicy(input: CreatePolicyInput): Promise<Policy> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('policies')
    .insert({
      client_id: input.client_id,
      action: input.action,
      resource: input.resource ?? '*',
      effect: input.effect,
      conditions: (input.conditions ?? null) as unknown as Json,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create policy: ${error.message}`);
  }

  const policy = data as unknown as Policy;

  // Emit receipt
  await createReceipt({
    client_id: input.client_id,
    action: 'policy_created',
    actor: 'system',
    payload: {
      policy_action: input.action,
      resource: input.resource ?? '*',
      effect: input.effect,
    },
    policy_id: policy.policy_id,
  });

  return policy;
}

/**
 * Update an existing policy.
 */
export async function updatePolicy(
  policyId: string,
  clientId: string,
  updates: Partial<Pick<Policy, 'effect' | 'conditions' | 'description' | 'enabled'>>
): Promise<Policy> {
  const supabase = getSupabaseServiceClient();

  const updateData: Record<string, unknown> = {};
  if (updates.effect !== undefined) updateData.effect = updates.effect;
  if (updates.conditions !== undefined) updateData.conditions = updates.conditions as unknown as Json;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.enabled !== undefined) updateData.enabled = updates.enabled;

  const { data, error } = await supabase
    .from('policies')
    .update(updateData)
    .eq('client_id', clientId)
    .eq('policy_id', policyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update policy: ${error.message}`);
  }

  const policy = data as unknown as Policy;

  // Emit receipt
  await createReceipt({
    client_id: policy.client_id,
    action: 'policy_updated',
    actor: 'system',
    payload: {
      policy_action: policy.action,
      changes: Object.keys(updateData),
    },
    policy_id: policy.policy_id,
  });

  return policy;
}

/**
 * Get all policies for a client.
 */
export async function getPolicies(
  clientId: string,
  options: { action?: string; enabledOnly?: boolean } = {}
): Promise<Policy[]> {
  const supabase = getSupabaseServiceClient();
  const { action, enabledOnly = true } = options;

  let query = supabase
    .from('policies')
    .select('*')
    .eq('client_id', clientId)
    .order('action', { ascending: true });

  if (action) {
    query = query.eq('action', action);
  }

  if (enabledOnly) {
    query = query.eq('enabled', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get policies: ${error.message}`);
  }

  return (data ?? []) as unknown as Policy[];
}

/**
 * Get a single policy by ID.
 */
export async function getPolicy(policyId: string, clientId: string): Promise<Policy | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('client_id', clientId)
    .eq('policy_id', policyId)
    .single();

  if (error && error.code === 'PGRST116') {
    return null;
  }

  if (error) {
    throw new Error(`Failed to get policy: ${error.message}`);
  }

  return data as unknown as Policy;
}
