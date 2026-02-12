// ============================================================================
// Worker: log-event
// ============================================================================
// Logs an inbound event (e.g. GHL webhook) into the receipt chain.
// The receipt chain already records that the task was created + executed,
// so this worker simply acknowledges the event with structured metadata.
//
// This is the first "real" worker — it proves the end-to-end flow:
//   GHL webhook → createTask(ghl_event) → worker claims → log-event runs → receipt
// ============================================================================

import type { WorkerHandler } from '../types';

export const logEventHandler: WorkerHandler = async (ctx) => {
  const payload = ctx.task.payload;

  return {
    success: true,
    data: {
      logged: true,
      event_type: payload.event_type ?? 'unknown',
      source: payload.source ?? 'unknown',
      client_id: ctx.client_id,
    },
  };
};
