import 'server-only';

/**
 * Kernel Data Helper — Server-side only
 *
 * Fetches kernel data (receipts, tasks, policies) and transforms it into
 * shapes compatible with existing dashboard components.
 *
 * NO PII is stored or returned. Activity titles use event types, not names.
 * Uses service_role client to bypass RLS on kernel tables.
 */

import { getReceipts, getTasks, countPendingTasks, verifyChain } from '@/lib/kernel';
import type { Receipt, Task } from '@/lib/kernel';
import { getSupabaseServiceClient } from '@/utils/supabase';
import type { GHLMetrics, GHLActivityItem } from './ghl/types';

// ----------------------------------------------------------------------------
// Activity Mapping: Receipt → GHLActivityItem
// ----------------------------------------------------------------------------

const ACTION_DISPLAY: Record<string, { type: GHLActivityItem['type']; label: string }> = {
  ghl_webhook: { type: 'lead_created', label: 'GHL Webhook Received' },
  task_created: { type: 'lead_created', label: 'Task Created' },
  task_claimed: { type: 'opportunity_updated', label: 'Task Claimed' },
  task_completed: { type: 'opportunity_created', label: 'Task Completed' },
  task_failed: { type: 'opportunity_updated', label: 'Task Failed' },
  task_cancelled: { type: 'opportunity_updated', label: 'Task Cancelled' },
  policy_checked: { type: 'opportunity_updated', label: 'Policy Evaluated' },
  policy_created: { type: 'opportunity_created', label: 'Policy Created' },
  policy_updated: { type: 'opportunity_updated', label: 'Policy Updated' },
  worker_executed: { type: 'opportunity_created', label: 'Worker Executed' },
  system_event: { type: 'opportunity_updated', label: 'System Event' },
};

/**
 * Derive a human-readable title from a receipt.
 * Uses event_type from payload when available (e.g., "ContactCreate", "AppointmentBooked").
 */
function receiptToTitle(receipt: Receipt): string {
  const eventType = receipt.payload?.event_type as string | undefined;
  const taskType = receipt.payload?.task_type as string | undefined;

  // GHL-specific events get friendly names
  if (eventType) {
    switch (eventType) {
      case 'ContactCreate': return 'New Lead Captured';
      case 'ContactUpdate': return 'Contact Updated';
      case 'AppointmentBooked': return 'Appointment Booked';
      case 'AppointmentRescheduled': return 'Appointment Rescheduled';
      case 'AppointmentCancelled': return 'Appointment Cancelled';
      case 'CallStatusChanged': return 'Call Status Changed';
      case 'OpportunityCreate': return 'New Opportunity';
      case 'OpportunityUpdate': return 'Opportunity Updated';
      case 'NoteCreate': return 'Note Added';
      case 'TaskCreate': return 'GHL Task Created';
      default: return eventType.replace(/([A-Z])/g, ' $1').trim();
    }
  }

  // Fall back to action display label
  const display = ACTION_DISPLAY[receipt.action];
  if (display) return display.label;

  // Last resort: humanize the action string
  return receipt.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Derive a subtitle from a receipt.
 */
function receiptToSubtitle(receipt: Receipt): string {
  const source = receipt.payload?.source as string | undefined;
  const eventType = receipt.payload?.event_type as string | undefined;
  const decision = receipt.payload?.decision as string | undefined;
  const error = receipt.payload?.error as string | undefined;
  const willRetry = receipt.payload?.will_retry as boolean | undefined;

  if (source === 'ghl_webhook' && eventType) {
    return `via GHL webhook · ${eventType}`;
  }
  if (decision) {
    return `Decision: ${decision}`;
  }
  if (error) {
    return willRetry ? `Error (will retry): ${error}` : `Error: ${error}`;
  }
  if (receipt.actor && receipt.actor !== 'system') {
    return `by ${receipt.actor}`;
  }
  return 'Kernel event';
}

/**
 * Map a receipt to a GHLActivityItem for the RecentActivity component.
 */
function receiptToActivity(receipt: Receipt): GHLActivityItem {
  const display = ACTION_DISPLAY[receipt.action] ?? { type: 'opportunity_updated' as const, label: receipt.action };

  // Override type for GHL contact events
  const eventType = receipt.payload?.event_type as string | undefined;
  let activityType = display.type;
  if (eventType === 'ContactCreate') activityType = 'lead_created';
  else if (eventType?.startsWith('Opportunity')) activityType = 'opportunity_created';
  else if (receipt.action === 'task_completed') activityType = 'opportunity_created';

  return {
    id: receipt.receipt_id,
    type: activityType,
    timestamp: new Date(receipt.created_at),
    title: receiptToTitle(receipt),
    subtitle: receiptToSubtitle(receipt),
    metadata: {
      source: receipt.payload?.source as string | undefined,
    },
  };
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

async function countTasksByEventType(clientId: string, eventType: string): Promise<number> {
  const supabase = getSupabaseServiceClient();
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('task_type', 'ghl_event')
    .eq('payload->>event_type', eventType);

  if (error) {
    console.error(`[Kernel Data] Error counting ${eventType} tasks:`, error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Get kernel-derived metrics shaped like GHLMetrics.
 * Counts events from the kernel task queue.
 */
export async function getKernelMetrics(clientId: string): Promise<GHLMetrics> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch recent GHL event tasks (up to 500 for counting)
  const [allGhlTasks, pendingCount, contactsTotal] = await Promise.all([
    getTasks(clientId, { taskType: 'ghl_event', limit: 500 }),
    countPendingTasks(clientId),
    countTasksByEventType(clientId, 'ContactCreate'),
  ]);

  // Count ContactCreate events
  const contactTasks = allGhlTasks.filter(
    (t: Task) => (t.payload?.event_type as string) === 'ContactCreate'
  );
  const contactsThisWeek = contactTasks.filter(
    (t: Task) => new Date(t.created_at) >= sevenDaysAgo
  ).length;

  // Count opportunity-related events
  const opportunityEvents = ['OpportunityCreate', 'OpportunityUpdate', 'AppointmentBooked'];
  const opportunityTasks = allGhlTasks.filter(
    (t: Task) => opportunityEvents.includes(t.payload?.event_type as string)
  );
  const opportunitiesThisWeek = opportunityTasks.filter(
    (t: Task) => new Date(t.created_at) >= sevenDaysAgo
  ).length;

  return {
    contactsThisWeek,
    contactsTotal,
    opportunitiesThisWeek,
    openOpportunities: pendingCount,
    totalPipelineValue: 0, // Kernel does not track monetary values
  };
}

/**
 * Get recent kernel activity as GHLActivityItem[].
 * Filters to user-visible actions (skips noisy internal receipts).
 */
export async function getKernelActivity(
  clientId: string,
  limit: number = 10
): Promise<GHLActivityItem[]> {
  // Fetch more receipts than needed, then filter to interesting ones
  const receipts = await getReceipts(clientId, { limit: limit * 3 });

  // Filter to user-visible actions (skip policy_checked noise)
  const visibleActions = new Set([
    'ghl_webhook',
    'task_created',
    'task_completed',
    'task_failed',
    'worker_executed',
    'policy_created',
    'policy_updated',
    'system_event',
  ]);

  const visible = receipts.filter((r: Receipt) => visibleActions.has(r.action));

  // Deduplicate: for each task_id, keep only the most recent receipt
  const seenTasks = new Set<string>();
  const deduplicated: Receipt[] = [];
  for (const receipt of visible) {
    if (receipt.task_id) {
      if (seenTasks.has(receipt.task_id)) continue;
      seenTasks.add(receipt.task_id);
    }
    deduplicated.push(receipt);
    if (deduplicated.length >= limit) break;
  }

  return deduplicated.map(receiptToActivity);
}

/**
 * Get kernel health status.
 */
export async function getKernelHealth(
  clientId: string
): Promise<{
  healthy: boolean;
  chainValid: boolean;
  chainChecked: number;
  pendingTasks: number;
  failedTasks: number;
}> {
  const [chainResult, pendingCount, failedTasks] = await Promise.all([
    verifyChain(clientId, 50),
    countPendingTasks(clientId),
    getTasks(clientId, { status: 'failed', limit: 10 }),
  ]);

  return {
    healthy: chainResult.valid && failedTasks.length === 0,
    chainValid: chainResult.valid,
    chainChecked: chainResult.checked,
    pendingTasks: pendingCount,
    failedTasks: failedTasks.length,
  };
}
