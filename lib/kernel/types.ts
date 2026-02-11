// ============================================================================
// @arugami/kernel - Core Types
// ============================================================================
// These types mirror the Supabase schema in 03_add_kernel_tables.sql.
// NO PII in any of these types. Metadata only.
// ============================================================================

// ----------------------------------------------------------------------------
// Receipt Types
// ----------------------------------------------------------------------------

export type ReceiptAction =
  | 'task_created'
  | 'task_claimed'
  | 'task_completed'
  | 'task_failed'
  | 'task_cancelled'
  | 'policy_checked'
  | 'policy_created'
  | 'policy_updated'
  | 'ghl_webhook'
  | 'worker_executed'
  | 'owner_approval'
  | 'owner_command'
  | 'system_event';

export interface Receipt {
  receipt_id: string;
  client_id: string;
  hash: string;
  prev_hash: string | null;
  action: ReceiptAction | string;
  actor: string;
  payload: Record<string, unknown>;
  task_id: string | null;
  policy_id: string | null;
  created_at: string;
}

export interface CreateReceiptInput {
  client_id: string;
  action: ReceiptAction | string;
  actor: string;
  payload?: Record<string, unknown>;
  task_id?: string;
  policy_id?: string;
}

// ----------------------------------------------------------------------------
// Task Types
// ----------------------------------------------------------------------------

export type TaskStatus = 'pending' | 'claimed' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  task_id: string;
  client_id: string;
  task_type: string;
  payload: Record<string, unknown>;
  priority: number;
  status: TaskStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  result: Record<string, unknown> | null;
  error: string | null;
  retry_count: number;
  max_retries: number;
  scheduled_for: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTaskInput {
  client_id: string;
  task_type: string;
  payload?: Record<string, unknown>;
  priority?: number;
  max_retries?: number;
  scheduled_for?: string;
  expires_at?: string;
}

export interface ClaimTaskResult {
  task: Task;
  receipt: Receipt;
}

export interface CompleteTaskInput {
  client_id: string;
  task_id: string;
  worker_id: string;
  result: Record<string, unknown>;
}

export interface FailTaskInput {
  client_id: string;
  task_id: string;
  worker_id: string;
  error: string;
}

// ----------------------------------------------------------------------------
// Policy Types
// ----------------------------------------------------------------------------

export type PolicyEffect = 'allow' | 'deny' | 'require_approval';

export interface Policy {
  policy_id: string;
  client_id: string;
  action: string;
  resource: string;
  effect: PolicyEffect;
  conditions: Record<string, unknown> | null;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePolicyInput {
  client_id: string;
  action: string;
  resource?: string;
  effect: PolicyEffect;
  conditions?: Record<string, unknown>;
  description?: string;
}

export interface PolicyDecision {
  effect: PolicyEffect;
  policy: Policy | null;
  reason: string;
}

// ----------------------------------------------------------------------------
// Worker Types
// ----------------------------------------------------------------------------

export interface WorkerContext {
  worker_id: string;
  task: Task;
  client_id: string;
}

export interface WorkerResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/** A function that processes one task type */
export type WorkerHandler = (ctx: WorkerContext) => Promise<WorkerResult>;

/** Maps task_type string → handler function (runtime APIs accept ReadonlyMap) */
export type WorkerRegistry = Map<string, WorkerHandler>;

/** Result of processTask() */
export interface ProcessTaskResult {
  success: boolean;
  task: Task;
  receipt: Receipt;
  duration_ms: number;
  error?: string;
  policy_effect?: PolicyEffect;
}
