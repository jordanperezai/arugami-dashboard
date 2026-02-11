/**
 * GHL (GoHighLevel) API Client
 * Server-side only - never expose API keys to client
 */

import { decryptIntegrationCredentials } from '../integrations/credentialsCrypto';
import type {
  GHLContact,
  GHLOpportunity,
  GHLPipeline,
  GHLMetrics,
  GHLActivityItem,
  GHLHealthStatus,
  GHLContactsResponse,
  GHLOpportunitiesResponse,
  GHLPipelinesResponse,
  GHLCreateContactRequest,
  GHLCreateContactResponse,
  GHLCreateOpportunityRequest,
  GHLCreateOpportunityResponse,
} from './types';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

interface GHLClientConfig {
  locationId: string;
  apiKeyEncrypted: string; // JSON string of EncryptedPayloadV1
}

interface EncryptedPayload {
  v: number;
  alg: string;
  iv: string;
  tag: string;
  data: string;
}

export class GHLClient {
  private locationId: string;
  private apiKey: string;

  constructor(config: GHLClientConfig) {
    this.locationId = config.locationId;

    // Decrypt the API key
    try {
      const payload: EncryptedPayload = JSON.parse(config.apiKeyEncrypted);
      const decrypted = decryptIntegrationCredentials(payload as any) as { api_key: string };
      this.apiKey = decrypted.api_key;
    } catch (error) {
      console.error('[GHLClient] Failed to decrypt API key:', error);
      throw new Error('Failed to initialize GHL client: invalid credentials');
    }
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
    try {
      const url = new URL(`${GHL_API_BASE}${endpoint}`);

      // Always include locationId
      url.searchParams.set('locationId', this.locationId);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // No caching for v1
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[GHLClient] API error: ${response.status} ${response.statusText}`, text);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[GHLClient] Fetch error:', error);
      return null;
    }
  }

  private async post<T>(endpoint: string, body: object): Promise<T | null> {
    try {
      const url = new URL(`${GHL_API_BASE}${endpoint}`);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          locationId: this.locationId,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[GHLClient] POST error: ${response.status} ${response.statusText}`, text);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[GHLClient] POST error:', error);
      return null;
    }
  }

  /**
   * Fetch contacts from GHL
   */
  async getContacts(limit = 100): Promise<GHLContact[]> {
    const data = await this.fetch<GHLContactsResponse>(
      '/contacts/',
      { limit: String(limit) }
    );
    return data?.contacts ?? [];
  }

  /**
   * Fetch opportunities from GHL
   */
  async getOpportunities(limit = 100): Promise<GHLOpportunity[]> {
    const data = await this.fetch<GHLOpportunitiesResponse>(
      '/opportunities/search',
      { limit: String(limit) }
    );
    return data?.opportunities ?? [];
  }

  /**
   * Fetch pipelines to map stage IDs to names
   */
  async getPipelines(): Promise<GHLPipeline[]> {
    const data = await this.fetch<GHLPipelinesResponse>(
      '/opportunities/pipelines'
    );
    return data?.pipelines ?? [];
  }

  /**
   * Get aggregated metrics for AutomationMetrics component
   */
  async getMetrics(): Promise<GHLMetrics> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [contacts, opportunities] = await Promise.all([
      this.getContacts(500),
      this.getOpportunities(500),
    ]);

    const contactsThisWeek = contacts.filter(
      c => new Date(c.dateAdded) >= sevenDaysAgo
    ).length;

    const opportunitiesThisWeek = opportunities.filter(
      o => new Date(o.dateAdded) >= sevenDaysAgo
    ).length;

    const openOpportunities = opportunities.filter(
      o => o.status === 'open'
    ).length;

    const totalPipelineValue = opportunities
      .filter(o => o.status === 'open')
      .reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);

    return {
      contactsThisWeek,
      contactsTotal: contacts.length,
      opportunitiesThisWeek,
      openOpportunities,
      totalPipelineValue,
    };
  }

  /**
   * Get recent activity for RecentActivity component
   */
  async getRecentActivity(limit = 10): Promise<GHLActivityItem[]> {
    const [contacts, opportunities, pipelines] = await Promise.all([
      this.getContacts(50),
      this.getOpportunities(50),
      this.getPipelines(),
    ]);

    // Build pipeline/stage name lookup
    const stageNames = new Map<string, { pipeline: string; stage: string }>();
    pipelines.forEach(p => {
      p.stages.forEach(s => {
        stageNames.set(s.id, { pipeline: p.name, stage: s.name });
      });
    });

    const activities: GHLActivityItem[] = [];

    // Add contact creations (leads)
    contacts.slice(0, 20).forEach(contact => {
      const name = contact.name ||
        `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
        'New Lead';

      activities.push({
        id: `contact-${contact.id}`,
        type: 'lead_created',
        timestamp: new Date(contact.dateAdded),
        title: name,
        subtitle: contact.source ? `via ${contact.source}` : 'New contact added',
        metadata: {
          contactName: name,
          contactEmail: contact.email,
          source: contact.source,
        },
      });
    });

    // Add opportunity creations
    opportunities.slice(0, 20).forEach(opp => {
      const stageInfo = stageNames.get(opp.pipelineStageId);

      activities.push({
        id: `opp-${opp.id}`,
        type: 'opportunity_created',
        timestamp: new Date(opp.dateAdded),
        title: opp.name || 'New Opportunity',
        subtitle: stageInfo
          ? `${stageInfo.pipeline} → ${stageInfo.stage}`
          : 'Pipeline opportunity',
        metadata: {
          pipelineName: stageInfo?.pipeline,
          stageName: stageInfo?.stage,
          contactName: opp.contact?.name,
          contactEmail: opp.contact?.email,
        },
      });
    });

    // Sort by timestamp (most recent first) and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Health check for IntegrationStatus component
   */
  async checkHealth(): Promise<GHLHealthStatus> {
    try {
      const contacts = await this.getContacts(1);
      const healthy = contacts !== null;

      return {
        healthy,
        message: healthy ? 'Connected' : 'API error',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Connection failed',
        lastChecked: new Date(),
      };
    }
  }

  // ============================================
  // WRITE OPERATIONS (for QR Code Tracking)
  // ============================================

  /**
   * Create a new contact in GHL
   * Used when a QR code scan triggers a pipeline
   */
  async createContact(data: GHLCreateContactRequest): Promise<{ contactId: string } | null> {
    const result = await this.post<GHLCreateContactResponse>('/contacts/', data);

    if (!result?.contact?.id) {
      console.error('[GHLClient] Failed to create contact');
      return null;
    }

    return { contactId: result.contact.id };
  }

  /**
   * Create a new opportunity in GHL
   * Used when a QR code scan triggers a pipeline
   */
  async createOpportunity(data: GHLCreateOpportunityRequest): Promise<{ opportunityId: string } | null> {
    const result = await this.post<GHLCreateOpportunityResponse>('/opportunities/', data);

    if (!result?.opportunity?.id) {
      console.error('[GHLClient] Failed to create opportunity');
      return null;
    }

    return { opportunityId: result.opportunity.id };
  }

  /**
   * Find existing contact by email or phone
   * Used to avoid creating duplicates during QR scans
   */
  async findContact(params: { email?: string; phone?: string }): Promise<GHLContact | null> {
    if (!params.email && !params.phone) {
      return null;
    }

    const searchParams: Record<string, string> = { limit: '1' };
    if (params.email) searchParams.email = params.email;
    if (params.phone) searchParams.phone = params.phone;

    const data = await this.fetch<GHLContactsResponse>('/contacts/', searchParams);
    return data?.contacts?.[0] ?? null;
  }
}

/**
 * Create a GHL client from client data
 * Returns null if client doesn't have GHL credentials
 */
export function createGHLClient(client: {
  ghl_location_id?: string | null;
  ghl_api_key_encrypted?: string | null;
}): GHLClient | null {
  if (!client.ghl_location_id || !client.ghl_api_key_encrypted) {
    return null;
  }

  try {
    return new GHLClient({
      locationId: client.ghl_location_id,
      apiKeyEncrypted: client.ghl_api_key_encrypted,
    });
  } catch (error) {
    console.error('[GHL] Failed to create client:', error);
    return null;
  }
}
