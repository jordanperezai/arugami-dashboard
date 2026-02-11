/**
 * Mock GHL Client for Development/Testing
 * Returns realistic Cubita Cafe data without requiring GHL API access
 *
 * Usage: Set USE_MOCK_GHL=true in .env.local to use mock data
 */

import type {
  GHLContact,
  GHLOpportunity,
  GHLPipeline,
  GHLMetrics,
  GHLActivityItem,
  GHLHealthStatus,
  GHLCreateContactRequest,
  GHLCreateOpportunityRequest,
} from './types';

// Realistic Cubita Cafe mock data
const MOCK_PIPELINES: GHLPipeline[] = [
  {
    id: 'pipeline-general',
    name: 'General Inquiries',
    stages: [
      { id: 'stage-new', name: 'New' },
      { id: 'stage-contacted', name: 'Contacted' },
      { id: 'stage-qualified', name: 'Qualified' },
      { id: 'stage-won', name: 'Won' },
      { id: 'stage-lost', name: 'Lost' },
    ],
  },
  {
    id: 'pipeline-catering',
    name: 'Catering',
    stages: [
      { id: 'stage-catering-new', name: 'New Catering Lead' },
      { id: 'stage-catering-quoted', name: 'Quote Sent' },
      { id: 'stage-catering-followup', name: 'Follow Up' },
      { id: 'stage-catering-booked', name: 'Booked' },
      { id: 'stage-catering-completed', name: 'Completed' },
      { id: 'stage-catering-lost', name: 'Lost' },
    ],
  },
];

const MOCK_CONTACTS: GHLContact[] = [
  {
    id: 'contact-1',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    phone: '201-555-0101',
    tags: ['catering', 'corporate'],
    source: 'Website - Catering Form',
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'contact-2',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'James',
    lastName: 'Chen',
    name: 'James Chen',
    email: 'jchen@techstartup.io',
    phone: '973-555-0202',
    tags: ['catering', 'tech'],
    source: 'Website - Catering Form',
    dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'contact-3',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'Sarah',
    lastName: 'Thompson',
    name: 'Sarah Thompson',
    email: 'sarah.t@gmail.com',
    phone: '201-555-0303',
    tags: ['general'],
    source: 'Website - Contact Form',
    dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'contact-4',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'Michael',
    lastName: 'Gonzalez',
    name: 'Michael Gonzalez',
    email: 'mgonzalez@lawfirm.com',
    phone: '201-555-0404',
    tags: ['catering', 'law-firm'],
    source: 'Website - Catering Form',
    dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'contact-5',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'Lisa',
    lastName: 'Park',
    name: 'Lisa Park',
    email: 'lisa.park@email.com',
    phone: '973-555-0505',
    tags: ['general', 'returning'],
    source: 'Website - Contact Form',
    dateAdded: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
  {
    id: 'contact-6',
    locationId: '7C711QGyqT7TlkQM1mxB',
    firstName: 'David',
    lastName: 'Kim',
    name: 'David Kim',
    email: 'dkim@weddings.co',
    phone: '201-555-0606',
    tags: ['catering', 'wedding'],
    source: 'Website - Catering Form',
    dateAdded: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
];

const MOCK_OPPORTUNITIES: GHLOpportunity[] = [
  {
    id: 'opp-1',
    name: 'Corporate Lunch - Tech Startup',
    pipelineId: 'pipeline-catering',
    pipelineStageId: 'stage-catering-quoted',
    status: 'open',
    monetaryValue: 850,
    contact: {
      id: 'contact-2',
      name: 'James Chen',
      email: 'jchen@techstartup.io',
    },
    dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-2',
    name: 'Office Party Catering',
    pipelineId: 'pipeline-catering',
    pipelineStageId: 'stage-catering-new',
    status: 'open',
    monetaryValue: 1200,
    contact: {
      id: 'contact-1',
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@email.com',
    },
    dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-3',
    name: 'Law Firm Monthly Lunch',
    pipelineId: 'pipeline-catering',
    pipelineStageId: 'stage-catering-booked',
    status: 'open',
    monetaryValue: 2400,
    contact: {
      id: 'contact-4',
      name: 'Michael Gonzalez',
      email: 'mgonzalez@lawfirm.com',
    },
    dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-4',
    name: 'Wedding Reception',
    pipelineId: 'pipeline-catering',
    pipelineStageId: 'stage-catering-new',
    status: 'open',
    monetaryValue: 3500,
    contact: {
      id: 'contact-6',
      name: 'David Kim',
      email: 'dkim@weddings.co',
    },
    dateAdded: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-5',
    name: 'General Inquiry - Menu Questions',
    pipelineId: 'pipeline-general',
    pipelineStageId: 'stage-contacted',
    status: 'open',
    monetaryValue: 0,
    contact: {
      id: 'contact-3',
      name: 'Sarah Thompson',
      email: 'sarah.t@gmail.com',
    },
    dateAdded: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock GHL Client - implements same interface as real GHLClient
 */
export class MockGHLClient {
  private locationId: string;

  constructor(locationId: string = '7C711QGyqT7TlkQM1mxB') {
    this.locationId = locationId;
    console.log('[MockGHLClient] Initialized with mock data for location:', locationId);
  }

  async getContacts(limit = 100): Promise<GHLContact[]> {
    // Simulate network delay
    await this.simulateDelay();
    return MOCK_CONTACTS.slice(0, limit);
  }

  async getOpportunities(limit = 100): Promise<GHLOpportunity[]> {
    await this.simulateDelay();
    return MOCK_OPPORTUNITIES.slice(0, limit);
  }

  async getPipelines(): Promise<GHLPipeline[]> {
    await this.simulateDelay();
    return MOCK_PIPELINES;
  }

  async getMetrics(): Promise<GHLMetrics> {
    await this.simulateDelay();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const contactsThisWeek = MOCK_CONTACTS.filter(
      c => new Date(c.dateAdded) >= sevenDaysAgo
    ).length;

    const opportunitiesThisWeek = MOCK_OPPORTUNITIES.filter(
      o => new Date(o.dateAdded) >= sevenDaysAgo
    ).length;

    const openOpportunities = MOCK_OPPORTUNITIES.filter(
      o => o.status === 'open'
    ).length;

    const totalPipelineValue = MOCK_OPPORTUNITIES
      .filter(o => o.status === 'open')
      .reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);

    return {
      contactsThisWeek,
      contactsTotal: MOCK_CONTACTS.length,
      opportunitiesThisWeek,
      openOpportunities,
      totalPipelineValue,
    };
  }

  async getRecentActivity(limit = 10): Promise<GHLActivityItem[]> {
    await this.simulateDelay();

    const activities: GHLActivityItem[] = [];

    // Add contact creations
    MOCK_CONTACTS.forEach(contact => {
      activities.push({
        id: `contact-activity-${contact.id}`,
        type: 'lead_created',
        timestamp: new Date(contact.dateAdded),
        title: contact.name || 'New Lead',
        subtitle: contact.source ? `via ${contact.source}` : 'New contact added',
        metadata: {
          contactName: contact.name,
          contactEmail: contact.email,
          source: contact.source,
        },
      });
    });

    // Add opportunity creations
    MOCK_OPPORTUNITIES.forEach(opp => {
      const pipeline = MOCK_PIPELINES.find(p => p.id === opp.pipelineId);
      const stage = pipeline?.stages.find(s => s.id === opp.pipelineStageId);

      activities.push({
        id: `opp-activity-${opp.id}`,
        type: 'opportunity_created',
        timestamp: new Date(opp.dateAdded),
        title: opp.name,
        subtitle: pipeline && stage ? `${pipeline.name} → ${stage.name}` : 'Pipeline opportunity',
        metadata: {
          pipelineName: pipeline?.name,
          stageName: stage?.name,
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

  async checkHealth(): Promise<GHLHealthStatus> {
    await this.simulateDelay();
    return {
      healthy: true,
      message: 'Connected (Mock)',
      lastChecked: new Date(),
    };
  }

  // ============================================
  // WRITE OPERATIONS (Mock)
  // ============================================

  /**
   * Create a new contact (mock)
   */
  async createContact(data: GHLCreateContactRequest): Promise<{ contactId: string } | null> {
    await this.simulateDelay();
    const contactId = `mock-contact-${Date.now()}`;
    console.log('[MockGHLClient] Created contact:', contactId, data);
    return { contactId };
  }

  /**
   * Create a new opportunity (mock)
   */
  async createOpportunity(data: GHLCreateOpportunityRequest): Promise<{ opportunityId: string } | null> {
    await this.simulateDelay();
    const opportunityId = `mock-opp-${Date.now()}`;
    console.log('[MockGHLClient] Created opportunity:', opportunityId, data);
    return { opportunityId };
  }

  /**
   * Find existing contact by email or phone (mock)
   */
  async findContact(params: { email?: string; phone?: string }): Promise<GHLContact | null> {
    await this.simulateDelay();
    // In mock mode, return null to simulate no existing contact found
    // This will cause QR scans to always create new contacts
    console.log('[MockGHLClient] Finding contact:', params, '-> null (mock always creates new)');
    return null;
  }

  private async simulateDelay(): Promise<void> {
    // Simulate 100-300ms network delay for realistic feel
    const delay = 100 + Math.random() * 200;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Create a mock GHL client
 */
export function createMockGHLClient(locationId?: string): MockGHLClient {
  return new MockGHLClient(locationId);
}
