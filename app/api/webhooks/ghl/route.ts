import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { createTask, runNextTask } from '@/lib/kernel';
import { defaultRegistry } from '@/lib/kernel/workers';

// ============================================================================
// GHL Webhook Receiver
// ============================================================================
// POST /api/webhooks/ghl
//
// Receives webhook events from GoHighLevel and translates them into kernel
// tasks. The task is created and immediately processed inline (Vercel serverless).
//
// No PII is stored in the kernel. Only metadata:
//   - event_type (e.g. "ContactCreate", "CallStatusChanged")
//   - ghl_contact_id (GHL's ID, not name/email)
//   - location_id (GHL sub-account ID)
//   - timestamp
//
// GHL webhook docs: https://marketplace.gohighlevel.com/docs/
// ============================================================================

const WORKER_ID = 'ghl-webhook-worker';

/**
 * Validate the webhook request.
 * GHL sends a shared secret in the header for verification.
 */
function validateWebhook(request: Request): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[GHL Webhook] GHL_WEBHOOK_SECRET is required in production');
      return false;
    }

    console.warn('[GHL Webhook] No GHL_WEBHOOK_SECRET configured, skipping validation');
    return true;
  }

  const headerSecret = request.headers.get('x-ghl-webhook-secret');
  return headerSecret === secret;
}

/**
 * Look up client_id from GHL locationId.
 * Returns null if no matching client found.
 */
async function resolveClientId(locationId: string): Promise<string | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('clients')
    .select('client_id')
    .eq('ghl_location_id', locationId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.client_id;
}

export async function POST(request: Request) {
  // 1. Validate webhook
  if (!validateWebhook(request)) {
    return NextResponse.json(
      { error: 'Invalid webhook secret' },
      { status: 401 }
    );
  }

  // 2. Parse body
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // 3. Extract GHL event metadata
  const eventType = (body.type ?? body.event ?? body.eventType ?? 'unknown') as string;
  const locationId = (body.locationId ?? body.location_id ?? '') as string;
  const contactId = (body.contactId ?? body.contact_id ?? null) as string | null;
  const timestamp = (body.dateAdded ?? body.timestamp ?? new Date().toISOString()) as string;

  if (!locationId) {
    console.error('[GHL Webhook] Missing locationId in payload:', JSON.stringify(body).slice(0, 200));
    return NextResponse.json(
      { error: 'Missing locationId' },
      { status: 400 }
    );
  }

  // 4. Resolve client_id from GHL locationId
  const clientId = await resolveClientId(locationId);
  if (!clientId) {
    console.error('[GHL Webhook] No client found for locationId:', locationId);
    return NextResponse.json(
      { error: 'Unknown locationId' },
      { status: 404 }
    );
  }

  try {
    // 5. Create kernel task (NO PII — metadata only)
    const task = await createTask({
      client_id: clientId,
      task_type: 'ghl_event',
      payload: {
        event_type: eventType,
        ghl_contact_id: contactId,
        ghl_location_id: locationId,
        received_at: timestamp,
        source: 'ghl_webhook',
      },
    });

    // 6. Process inline (claim + execute + complete/fail)
    const result = await runNextTask(WORKER_ID, defaultRegistry, {
      clientId,
      taskType: 'ghl_event',
    });

    // 7. Always return 200 to GHL (so it doesn't retry on our policy denials)
    return NextResponse.json({
      received: true,
      task_id: task.task_id,
      processed: result?.success ?? false,
      duration_ms: result?.duration_ms ?? null,
      error: result ? result.error ?? null : 'claim_failed',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[GHL Webhook] Processing error:', errorMessage);

    return NextResponse.json({
      received: true,
      processed: false,
      error: 'internal_error',
    });
  }
}
