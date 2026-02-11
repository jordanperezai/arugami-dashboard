// ============================================================================
// @arugami/kernel - Main Entry Point
// ============================================================================
// The arugami kernel: receipts, tasks, and policies.
// Every action produces a receipt. Every task checks policies.
// ============================================================================

// Types
export type {
  Receipt,
  CreateReceiptInput,
  ReceiptAction,
  Task,
  CreateTaskInput,
  CompleteTaskInput,
  FailTaskInput,
  ClaimTaskResult,
  TaskStatus,
  Policy,
  CreatePolicyInput,
  PolicyDecision,
  PolicyEffect,
  WorkerContext,
  WorkerResult,
  WorkerHandler,
  WorkerRegistry,
  ProcessTaskResult,
} from './types';

// Receipts
export {
  computeReceiptHash,
  verifyReceiptHash,
  createReceipt,
  getLatestReceipt,
  verifyChain,
  getReceipts,
} from './receipts';

// Tasks
export {
  createTask,
  claimTask,
  completeTask,
  failTask,
  cancelTask,
  approveTask,
  getTasks,
  getTask,
  countPendingTasks,
} from './tasks';

// Policies
export {
  evaluatePolicy,
  isAllowed,
  requiresApproval,
  createPolicy,
  updatePolicy,
  getPolicies,
  getPolicy,
} from './policies';

// Worker Runtime
export {
  processTask,
  runNextTask,
} from './worker-runtime';

// Workers
export {
  defaultRegistry,
  echoHandler,
  logEventHandler,
} from './workers/index';
