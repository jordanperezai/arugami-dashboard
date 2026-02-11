// ============================================================================
// Worker Registry
// ============================================================================
// Maps task_type strings to handler functions.
// Add new workers here as they're built.
// ============================================================================

import type { WorkerHandler, WorkerRegistry } from '../types';
import { echoHandler } from './echo';
import { logEventHandler } from './log-event';

const _registry: WorkerRegistry = new Map([
  ['echo', echoHandler],
  ['ghl_event', logEventHandler],
]);

export const defaultRegistry: ReadonlyMap<string, WorkerHandler> = _registry;

export { echoHandler } from './echo';
export { logEventHandler } from './log-event';
