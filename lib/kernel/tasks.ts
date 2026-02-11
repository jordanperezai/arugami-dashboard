// ============================================================================
// @arugami/kernel - Task Queue
// ============================================================================
// Work queue with lifecycle: pending → claimed → completed | failed
// Workers claim tasks, execute them, and produce receipts.
// Every state transition emits a receipt for auditability.
// ============================================================================

import { getSupabaseServiceClient } from '../../utils/supabase';
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
import type { Task, CreateTaskInput, CompleteTaskInput, FailTaskInput, TaskStatus } from './types';
import { createReceipt } from './receipts';

// ----------------------------------------------------------------------------
// Task Creation
// ----------------------------------------------------------------------------

/**
 * Create a new task and emit a receipt.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      client_id: input.client_id,
      task_type: input.task_type,
      payload: (input.payload ?? {}) as unknown as Json,
      priority: input.priority ?? 0,
      max_retries: input.max_retries ?? 3,
      scheduled_for: input.scheduled_for ?? null,
      expires_at: input.expires_at ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  const task = data as unknown as Task;

  // Emit receipt
  await createReceipt({
    client_id: input.client_id,
    action: 'task_created',
    actor: 'system',
    payload: { task_type: input.task_type, priority: input.priority ?? 0 },
    task_id: task.task_id,
  });

  return task;
}

// ----------------------------------------------------------------------------
// Task Claiming
// ----------------------------------------------------------------------------

/**
 * Claim the next available pending task for a client (or any client).
 * Uses atomic update to prevent double-claiming.
 *
 * Returns null if no tasks are available.
 */
export async function claimTask(
  workerId: string,
  options: { clientId?: string; taskType?: string } = {}
): Promise<Task | null> {
  const supabase = getSupabaseServiceClient();
  const now = new Date().toISOString();

  // Find the next pending task
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);

  if (options.clientId) {
    query = query.eq('client_id', options.clientId);
  }
  if (options.taskType) {
    query = query.eq('task_type', options.taskType);
  }

  // Only get tasks that are ready to run (not scheduled for the future)
  query = query.or(`scheduled_for.is.null,scheduled_for.lte.${now}`);

  // Filter out expired tasks
  query = query.or(`expires_at.is.null,expires_at.gt.${now}`);

  const { data: tasks, error: findError } = await query;

  if (findError) {
    throw new Error(`Failed to find task: ${findError.message}`);
  }

  if (!tasks || tasks.length === 0) {
    return null;
  }

  const taskToCllaim = tasks[0] as unknown as Task;

  // Atomically claim it (only if still pending — prevents race conditions)
  const { data: claimed, error: claimError } = await supabase
    .from('tasks')
    .update({
      status: 'claimed' as string,
      claimed_by: workerId,
      claimed_at: now,
    })
    .eq('task_id', taskToCllaim.task_id)
    .eq('status', 'pending') // Atomic check — only claim if still pending
    .select()
    .single();

  if (claimError) {
    // Another worker claimed it first — this is normal, not an error
    if (claimError.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to claim task: ${claimError.message}`);
  }

  const claimedTask = claimed as unknown as Task;

  // Emit receipt
  await createReceipt({
    client_id: claimedTask.client_id,
    action: 'task_claimed',
    actor: `worker:${workerId}`,
    payload: { task_type: claimedTask.task_type },
    task_id: claimedTask.task_id,
  });

  return claimedTask;
}

// ----------------------------------------------------------------------------
// Task Completion
// ----------------------------------------------------------------------------

/**
 * Mark a task as completed with a result.
 */
export async function completeTask(input: CompleteTaskInput): Promise<Task> {
  const supabase = getSupabaseServiceClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed' as string,
      result: (input.result ?? {}) as unknown as Json,
      completed_at: now,
    })
    .eq('client_id', input.client_id)
    .eq('task_id', input.task_id)
    .eq('status', 'claimed') // Can only complete claimed tasks
    .eq('claimed_by', input.worker_id) // Only the claiming worker can complete
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to complete task: ${error.message}`);
  }

  const task = data as unknown as Task;

  // Emit receipt
  await createReceipt({
    client_id: task.client_id,
    action: 'task_completed',
    actor: `worker:${input.worker_id}`,
    payload: { task_type: task.task_type, has_result: !!input.result },
    task_id: task.task_id,
  });

  return task;
}

/**
 * Mark a task as failed with an error message.
 * If retries remain, requeues the task as pending.
 */
export async function failTask(input: FailTaskInput): Promise<Task> {
  const supabase = getSupabaseServiceClient();

  // First get the current task to check retry count
  const { data: current, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', input.client_id)
    .eq('task_id', input.task_id)
    .eq('status', 'claimed')
    .eq('claimed_by', input.worker_id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch task: ${fetchError.message}`);
  }

  const currentTask = current as unknown as Task;
  const newRetryCount = currentTask.retry_count + 1;
  const shouldRetry = newRetryCount < currentTask.max_retries;

  const newStatus: TaskStatus = shouldRetry ? 'pending' : 'failed';

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: newStatus as string,
      error: input.error,
      retry_count: newRetryCount,
      // Reset claim fields if retrying
      claimed_by: shouldRetry ? null : currentTask.claimed_by,
      claimed_at: shouldRetry ? null : currentTask.claimed_at,
      completed_at: shouldRetry ? null : new Date().toISOString(),
    })
    .eq('client_id', input.client_id)
    .eq('task_id', input.task_id)
    .eq('status', 'claimed')
    .eq('claimed_by', input.worker_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to fail task: ${error.message}`);
  }

  const task = data as unknown as Task;

  // Emit receipt
  await createReceipt({
    client_id: task.client_id,
    action: 'task_failed',
    actor: `worker:${input.worker_id}`,
    payload: {
      task_type: task.task_type,
      error: input.error,
      retry_count: newRetryCount,
      will_retry: shouldRetry,
    },
    task_id: task.task_id,
  });

  return task;
}

/**
 * Cancel a pending task.
 */
export async function cancelTask(taskId: string, clientId: string, actor: string): Promise<Task> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'cancelled' as string,
      completed_at: new Date().toISOString(),
    })
    .eq('client_id', clientId)
    .eq('task_id', taskId)
    .eq('status', 'pending') // Can only cancel pending tasks
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel task: ${error.message}`);
  }

  const task = data as unknown as Task;

  // Emit receipt
  await createReceipt({
    client_id: task.client_id,
    action: 'task_cancelled',
    actor,
    payload: { task_type: task.task_type },
    task_id: task.task_id,
  });

  return task;
}

// ----------------------------------------------------------------------------
// Task Approval
// ----------------------------------------------------------------------------

/**
 * Approve a task that is waiting for owner approval.
 * Resets the task to pending with retry_count=0, clears claim fields,
 * and emits an owner_approval receipt.
 *
 * Does NOT re-process the task inline — the approval-aware worker runtime
 * is a future concern (Phase 4B). The task stays in pending until the
 * runtime learns to check for approval receipts before policy evaluation.
 */
export async function approveTask(
  taskId: string,
  clientId: string,
  actor: string,
  reason?: string
): Promise<Task> {
  const supabase = getSupabaseServiceClient();

  // Atomically reset task only if it is currently in an approvable state.
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'pending' as string,
      retry_count: 0,
      claimed_by: null,
      claimed_at: null,
      error: null,
      completed_at: null,
    })
    .eq('client_id', clientId)
    .eq('task_id', taskId)
    .in('status', ['pending', 'failed'])
    .select()
    .single();

  if (!error && data) {
    const approvedTask = data as unknown as Task;

    // Emit owner_approval receipt
    await createReceipt({
      client_id: clientId,
      action: 'owner_approval',
      actor,
      payload: {
        task_type: approvedTask.task_type,
        reason: reason ?? 'Owner approved task',
        previous_status: 'pending_or_failed',
        previous_retry_count: 'unknown',
      },
      task_id: approvedTask.task_id,
    });

    return approvedTask;
  }

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to approve task: ${error.message}`);
  }

  // Differentiate "not found" vs "wrong state" when atomic update found no row.
  const { data: existing, error: existingError } = await supabase
    .from('tasks')
    .select('status')
    .eq('client_id', clientId)
    .eq('task_id', taskId)
    .single();

  if (existingError) {
    if (existingError.code === 'PGRST116') {
      throw new Error(`Task ${taskId} not found for client ${clientId}`);
    }
    throw new Error(`Failed to fetch task: ${existingError.message}`);
  }

  const existingTask = existing as Pick<Task, 'status'>;
  throw new Error(
    `Cannot approve task in "${existingTask.status}" state. Only pending or failed tasks can be approved.`
  );
}

// ----------------------------------------------------------------------------
// Task Queries
// ----------------------------------------------------------------------------

/**
 * Get tasks for a client, with optional filters.
 */
export async function getTasks(
  clientId: string,
  options: { status?: TaskStatus; taskType?: string; limit?: number } = {}
): Promise<Task[]> {
  const supabase = getSupabaseServiceClient();
  const { status, taskType, limit = 50 } = options;

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  if (taskType) {
    query = query.eq('task_type', taskType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get tasks: ${error.message}`);
  }

  return (data ?? []) as unknown as Task[];
}

/**
 * Get a single task by ID.
 */
export async function getTask(taskId: string, clientId: string): Promise<Task | null> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', clientId)
    .eq('task_id', taskId)
    .single();

  if (error && error.code === 'PGRST116') {
    return null;
  }

  if (error) {
    throw new Error(`Failed to get task: ${error.message}`);
  }

  return data as unknown as Task;
}

/**
 * Count pending tasks for a client (useful for dashboard).
 */
export async function countPendingTasks(clientId: string): Promise<number> {
  const supabase = getSupabaseServiceClient();

  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Failed to count tasks: ${error.message}`);
  }

  return count ?? 0;
}
