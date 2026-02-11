// ============================================================================
// @arugami/kernel - Worker Runtime
// ============================================================================
// Stateless worker execution layer. Workers are functions that process tasks.
// The runtime handles: claim → policy check → execute → complete/fail.
// Every step produces a receipt for auditability.
//
// Workers execute inline (Vercel serverless). No long-running poll loops.
// Failed tasks stay in the queue for retry.
// ============================================================================

import type {
  Task,
  WorkerHandler,
  WorkerContext,
  WorkerResult,
  ProcessTaskResult,
} from './types';
import { claimTask, completeTask, failTask } from './tasks';
import { evaluatePolicy } from './policies';
import { createReceipt } from './receipts';

// ----------------------------------------------------------------------------
// Process a Single Task
// ----------------------------------------------------------------------------

/**
 * Process a task through the worker runtime.
 *
 * Flow:
 * 1. Look up handler by task.task_type in the registry
 * 2. Check policy: is this action allowed for this client?
 * 3. If denied → fail task with policy reason
 * 4. If require_approval → leave task, emit receipt, return
 * 5. If allowed → execute handler
 * 6. On success → completeTask()
 * 7. On error → failTask() (auto-retries if under max)
 *
 * Assumes task is already claimed by workerId.
 */
export async function processTask(
  task: Task,
  workerId: string,
  registry: ReadonlyMap<string, WorkerHandler>
): Promise<ProcessTaskResult> {
  const start = Date.now();

  if (task.status !== 'claimed' || task.claimed_by !== workerId) {
    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        error: 'claim_verification_failed',
        actual_status: task.status,
        actual_claimed_by: task.claimed_by,
      },
      task_id: task.task_id,
    });

    return {
      success: false,
      task,
      receipt,
      duration_ms: Date.now() - start,
      error: `Task ${task.task_id} is not claimed by ${workerId} (status=${task.status}, claimed_by=${task.claimed_by})`,
    };
  }

  // 1. Look up handler
  const handler = registry.get(task.task_type);
  if (!handler) {
    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        error: 'no_handler_registered',
      },
      task_id: task.task_id,
    });

    const failedTask = await failTask({
      client_id: task.client_id,
      task_id: task.task_id,
      worker_id: workerId,
      error: `No handler registered for task_type "${task.task_type}"`,
    });

    return {
      success: false,
      task: failedTask,
      receipt,
      duration_ms: Date.now() - start,
      error: `No handler registered for task_type "${task.task_type}"`,
    };
  }

  // 2. Check policy
  const decision = await evaluatePolicy(task.client_id, task.task_type);

  if (decision.effect === 'deny') {
    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        policy_effect: 'deny',
        policy_reason: decision.reason,
      },
      task_id: task.task_id,
      policy_id: decision.policy?.policy_id,
    });

    const failedTask = await failTask({
      client_id: task.client_id,
      task_id: task.task_id,
      worker_id: workerId,
      error: `Policy denied: ${decision.reason}`,
    });

    return {
      success: false,
      task: failedTask,
      receipt,
      duration_ms: Date.now() - start,
      error: `Policy denied: ${decision.reason}`,
      policy_effect: 'deny',
    };
  }

  if (decision.effect === 'require_approval') {
    // Don't execute — leave task claimed but emit a receipt.
    // In future phases, this triggers an approval request to the owner.
    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        policy_effect: 'require_approval',
        policy_reason: decision.reason,
        awaiting_approval: true,
      },
      task_id: task.task_id,
      policy_id: decision.policy?.policy_id,
    });

    // Fail the task so it goes back to pending for retry after approval
    const failedTask = await failTask({
      client_id: task.client_id,
      task_id: task.task_id,
      worker_id: workerId,
      error: `Awaiting owner approval: ${decision.reason}`,
    });

    return {
      success: false,
      task: failedTask,
      receipt,
      duration_ms: Date.now() - start,
      error: `Awaiting owner approval: ${decision.reason}`,
      policy_effect: 'require_approval',
    };
  }

  // 3. Execute handler (policy allowed)
  const ctx: WorkerContext = {
    worker_id: workerId,
    task,
    client_id: task.client_id,
  };

  let result: WorkerResult;
  try {
    result = await handler(ctx);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        policy_effect: 'allow',
        error: errorMessage,
        threw: true,
      },
      task_id: task.task_id,
    });

    const failedTask = await failTask({
      client_id: task.client_id,
      task_id: task.task_id,
      worker_id: workerId,
      error: errorMessage,
    });

    return {
      success: false,
      task: failedTask,
      receipt,
      duration_ms: Date.now() - start,
      error: errorMessage,
      policy_effect: 'allow',
    };
  }

  // 4. Handle result
  if (!result.success) {
    const receipt = await createReceipt({
      client_id: task.client_id,
      action: 'worker_executed',
      actor: `worker:${workerId}`,
      payload: {
        task_type: task.task_type,
        policy_effect: 'allow',
        error: result.error,
        handler_returned_failure: true,
      },
      task_id: task.task_id,
    });

    const failedTask = await failTask({
      client_id: task.client_id,
      task_id: task.task_id,
      worker_id: workerId,
      error: result.error ?? 'Handler returned failure',
    });

    return {
      success: false,
      task: failedTask,
      receipt,
      duration_ms: Date.now() - start,
      error: result.error ?? 'Handler returned failure',
      policy_effect: 'allow',
    };
  }

  // 5. Success — complete the task
  const completedTask = await completeTask({
    client_id: task.client_id,
    task_id: task.task_id,
    worker_id: workerId,
    result: result.data ?? {},
  });

  const receipt = await createReceipt({
    client_id: task.client_id,
    action: 'worker_executed',
    actor: `worker:${workerId}`,
    payload: {
      task_type: task.task_type,
      policy_effect: 'allow',
      success: true,
      duration_ms: Date.now() - start,
    },
    task_id: task.task_id,
  });

  return {
    success: true,
    task: completedTask,
    receipt,
    duration_ms: Date.now() - start,
    policy_effect: 'allow',
  };
}

// ----------------------------------------------------------------------------
// Claim + Process (Convenience)
// ----------------------------------------------------------------------------

/**
 * Claim the next pending task and process it.
 * Returns null if no tasks are available.
 *
 * This is the main entry point for inline worker execution:
 *   webhook arrives → createTask() → runNextTask()
 */
export async function runNextTask(
  workerId: string,
  registry: ReadonlyMap<string, WorkerHandler>,
  options: { clientId?: string; taskType?: string } = {}
): Promise<ProcessTaskResult | null> {
  const task = await claimTask(workerId, options);
  if (!task) return null;

  return processTask(task, workerId, registry);
}
