/**
 * GHL (GoHighLevel) Type Definitions
 * White-labeled as "arugami CRM" in the dashboard
 */

// GHL Contact (from GET /contacts)
export interface GHLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  dateAdded: string;
  dateUpdated?: string;
}

// GHL Opportunity (from GET /opportunities)
export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue?: number;
  contact?: {
    id: string;
    name?: string;
    email?: string;
  };
  dateAdded: string;
  dateUpdated?: string;
}

// GHL Pipeline (for mapping stage names)
export interface GHLPipeline {
  id: string;
  name: string;
  stages: Array<{
    id: string;
    name: string;
  }>;
}

// Transformed activity item for RecentActivity component
export interface GHLActivityItem {
  id: string;
  type: 'lead_created' | 'opportunity_created' | 'opportunity_updated';
  timestamp: Date;
  title: string;
  subtitle: string;
  metadata?: {
    contactName?: string;
    contactEmail?: string;
    pipelineName?: string;
    stageName?: string;
    source?: string;
  };
}

// Summary metrics for AutomationMetrics component
export interface GHLMetrics {
  contactsThisWeek: number;
  contactsTotal: number;
  opportunitiesThisWeek: number;
  openOpportunities: number;
  totalPipelineValue: number;
}

// GHL API response wrappers
export interface GHLContactsResponse {
  contacts: GHLContact[];
  meta?: {
    total: number;
    currentPage: number;
    nextPage?: number;
  };
}

export interface GHLOpportunitiesResponse {
  opportunities: GHLOpportunity[];
  meta?: {
    total: number;
  };
}

export interface GHLPipelinesResponse {
  pipelines: GHLPipeline[];
}

// Health check result
export interface GHLHealthStatus {
  healthy: boolean;
  message: string;
  lastChecked: Date;
}

// ============================================
// WRITE OPERATION TYPES
// ============================================

// Create Contact Request
export interface GHLCreateContactRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  source?: string;
  customField?: Record<string, string>;
}

// Create Contact Response
export interface GHLCreateContactResponse {
  contact: GHLContact;
}

// Create Opportunity Request
export interface GHLCreateOpportunityRequest {
  pipelineId: string;
  pipelineStageId: string;
  name: string;
  contactId: string;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
  monetaryValue?: number;
  source?: string;
}

// Create Opportunity Response
export interface GHLCreateOpportunityResponse {
  opportunity: GHLOpportunity;
}
