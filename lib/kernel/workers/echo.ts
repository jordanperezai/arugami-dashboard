// ============================================================================
// Worker: echo
// ============================================================================
// Test worker. Returns the task payload as its result.
// Useful for smoke tests and verifying the worker runtime flow.
// ============================================================================

import type { WorkerHandler } from '../types';

export const echoHandler: WorkerHandler = async (ctx) => {
  return {
    success: true,
    data: {
      echoed_payload: ctx.task.payload,
      worker_id: ctx.worker_id,
      task_type: ctx.task.task_type,
    },
  };
};
