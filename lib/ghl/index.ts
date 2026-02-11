/**
 * GHL (GoHighLevel) Client Module
 *
 * Exports both real and mock clients. Use `getGHLClient()` to automatically
 * choose based on USE_MOCK_GHL environment variable.
 *
 * Usage:
 *   - Set USE_MOCK_GHL=true in .env.local for mock data
 *   - Remove or set USE_MOCK_GHL=false for real API calls
 */

export { GHLClient, createGHLClient } from './api-client';
export { MockGHLClient, createMockGHLClient } from './mock-client';
export type {
  GHLContact,
  GHLOpportunity,
  GHLPipeline,
  GHLActivityItem,
  GHLMetrics,
  GHLHealthStatus,
  GHLCreateContactRequest,
  GHLCreateOpportunityRequest,
} from './types';

import { GHLClient, createGHLClient } from './api-client';
import { MockGHLClient, createMockGHLClient } from './mock-client';

/**
 * Check if we should use mock data
 */
export function shouldUseMockGHL(): boolean {
  return process.env.USE_MOCK_GHL === 'true';
}

/**
 * Get a GHL client - automatically chooses mock or real based on env
 *
 * @param client - Client data with GHL credentials (for real client)
 * @returns GHLClient or MockGHLClient
 */
export function getGHLClient(client?: {
  ghl_location_id?: string | null;
  ghl_api_key_encrypted?: string | null;
}): GHLClient | MockGHLClient | null {
  // Use mock if flag is set
  if (shouldUseMockGHL()) {
    console.log('[GHL] Using mock client (USE_MOCK_GHL=true)');
    return createMockGHLClient(client?.ghl_location_id || undefined);
  }

  // Otherwise try to create real client
  if (!client) {
    console.log('[GHL] No client data provided');
    return null;
  }

  const realClient = createGHLClient(client);

  if (!realClient) {
    console.log('[GHL] Could not create real client - missing credentials');
    // Fallback to mock for development convenience
    if (process.env.NODE_ENV === 'development') {
      console.log('[GHL] Falling back to mock client in development');
      return createMockGHLClient(client?.ghl_location_id || undefined);
    }
    return null;
  }

  return realClient;
}
