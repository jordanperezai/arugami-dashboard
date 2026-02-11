'use client';

import { FileText, Bot, Clock, CheckCircle, AlertCircle, Loader2, ChevronRight, UserPlus, Target, Activity } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface Report {
  report_id: string;
  report_type: string;
  subject?: string;
  summary?: string;
  created_at: string;
  read_at?: string;
}

interface AgentRun {
  agent_run_id: string;
  agent_name?: string;
  skills_called?: number | null;
  status: string;
  queued_at: string;
  started_at?: string;
  completed_at?: string;
}

// GHL activity item (white-labeled as "arugami CRM")
interface GHLActivityItem {
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

interface RecentActivityProps {
  reports: Report[];
  agentRuns: AgentRun[];
  ghlActivity?: GHLActivityItem[];
}

type ActivityItem = {
  id: string;
  type: 'report' | 'agent' | 'crm';
  timestamp: Date;
  data: Report | AgentRun | GHLActivityItem;
};

// Helper: Format relative time
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper: Get status color for agent runs
function getStatusColor(status: string): string {
  switch (status) {
    case 'success':
      return BRAND.teal;
    case 'failed':
    case 'error':
      return BRAND.red;
    case 'running':
      return BRAND.amber;
    default:
      return BRAND.concrete;
  }
}

// Helper: Get status icon for agent runs
function getStatusIcon(status: string) {
  switch (status) {
    case 'success':
      return <CheckCircle size={12} style={{ color: BRAND.teal }} />;
    case 'failed':
    case 'error':
      return <AlertCircle size={12} style={{ color: BRAND.red }} />;
    case 'running':
      return <Loader2 size={12} style={{ color: BRAND.amber, animation: 'spin 1s linear infinite' }} />;
    default:
      return <Clock size={12} style={{ color: BRAND.concrete }} />;
  }
}

// Helper: Humanize agent name
function humanizeAgentName(name?: string): string {
  if (!name) return 'AI Agent';
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Helper: Humanize report type
function humanizeReportType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Helper: Get summary for report
function getReportSummary(report: Report): string {
  if (report.summary) return report.summary;
  if (report.subject) return report.subject;
  return humanizeReportType(report.report_type);
}

export function RecentActivity({ reports, agentRuns, ghlActivity = [] }: RecentActivityProps) {
  // Merge and sort all activity items by timestamp (most recent first)
  const activityItems: ActivityItem[] = [
    ...reports.map((report) => ({
      id: report.report_id,
      type: 'report' as const,
      timestamp: new Date(report.created_at),
      data: report,
    })),
    ...agentRuns.map((run) => ({
      id: run.agent_run_id,
      type: 'agent' as const,
      timestamp: new Date(run.queued_at),
      data: run,
    })),
    // GHL activity (leads and opportunities from "arugami CRM")
    ...ghlActivity.map((activity) => ({
      id: activity.id,
      type: 'crm' as const,
      timestamp: activity.timestamp,
      data: activity,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Take only the most recent items
  const recentItems = activityItems.slice(0, 10);

  // Check if report is unread
  const isUnread = (report: Report) => !report.read_at;

  return (
    <section
      style={{
        padding: '1.5rem',
        borderRadius: 16,
        background: `linear-gradient(180deg, ${BRAND.utilitySlate} 0%, ${BRAND.gridCharcoal} 100%)`,
        border: `1px solid ${BRAND.concrete}20`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse at 0% 0%, ${BRAND.amber}05 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.concrete}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} style={{ color: BRAND.amber }} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white', margin: 0 }}>Recent Activity</h2>
            <p style={{ fontSize: 12, color: BRAND.concrete, marginTop: 2, margin: 0 }}>
              Everything the grid has handled for you
            </p>
          </div>
        </div>
        <button
          style={{
            background: BRAND.gridCharcoal,
            border: `1px solid ${BRAND.concrete}20`,
            fontSize: 11,
            fontWeight: 500,
            color: BRAND.concrete,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 6,
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${BRAND.teal}40`;
            e.currentTarget.style.color = BRAND.teal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${BRAND.concrete}20`;
            e.currentTarget.style.color = BRAND.concrete;
          }}
        >
          View All
          <ChevronRight size={12} />
        </button>
      </div>

      {recentItems.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            color: BRAND.concrete,
            fontSize: 13,
            background: BRAND.gridCharcoal,
            borderRadius: 10,
            border: `1px dashed ${BRAND.concrete}30`,
          }}
        >
          <Activity size={24} style={{ color: `${BRAND.concrete}60`, marginBottom: 8 }} />
          <p style={{ margin: 0 }}>No recent activity yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7 }}>
            Activity will appear here as your grid processes tasks
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recentItems.map((item, index) => {
            const isReport = item.type === 'report';
            const isCRM = item.type === 'crm';
            const isAgent = item.type === 'agent';
            const reportData = item.data as Report;
            const crmData = item.data as GHLActivityItem;
            const agentData = item.data as AgentRun;

            // Determine icon background and color
            let iconBg = BRAND.gridCharcoal as string;
            let iconColor = BRAND.concrete as string;
            let borderAccent = `${BRAND.concrete}15` as string;

            if (isReport) {
              if (isUnread(reportData)) {
                iconBg = `${BRAND.teal}15`;
                iconColor = BRAND.teal;
                borderAccent = `${BRAND.teal}30`;
              }
            } else if (isCRM) {
              if (crmData.type === 'lead_created') {
                iconBg = `${BRAND.amber}15`;
                iconColor = BRAND.amber;
                borderAccent = `${BRAND.amber}30`;
              } else {
                iconBg = `${BRAND.teal}15`;
                iconColor = BRAND.teal;
                borderAccent = `${BRAND.teal}30`;
              }
            } else if (isAgent) {
              const statusColor = getStatusColor(agentData.status);
              iconBg = `${statusColor}15`;
              iconColor = statusColor;
              if (agentData.status === 'success') borderAccent = `${BRAND.teal}30`;
              else if (agentData.status === 'running') borderAccent = `${BRAND.amber}30`;
              else if (agentData.status === 'failed' || agentData.status === 'error') borderAccent = `${BRAND.red}30`;
            }

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: BRAND.gridCharcoal,
                  border: `1px solid ${borderAccent}`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${BRAND.teal}40`;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderAccent;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Animated entry line for recent items */}
                {index < 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 2,
                      height: '60%',
                      background: `linear-gradient(180deg, transparent, ${iconColor}, transparent)`,
                      borderRadius: 1,
                      opacity: 0.6,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: iconBg,
                    border: `1px solid ${iconColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isReport ? (
                    <FileText size={14} style={{ color: iconColor }} />
                  ) : isCRM ? (
                    crmData.type === 'lead_created' ? (
                      <UserPlus size={14} style={{ color: iconColor }} />
                    ) : (
                      <Target size={14} style={{ color: iconColor }} />
                    )
                  ) : (
                    <Bot size={14} style={{ color: iconColor }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isReport ? (
                    <>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: isUnread(reportData) ? 600 : 500,
                          color: isUnread(reportData) ? 'white' : 'rgba(255,255,255,0.8)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                      >
                        {getReportSummary(reportData)}
                      </p>
                      <p style={{ fontSize: 11, color: BRAND.concrete, marginTop: 2, margin: '2px 0 0' }}>
                        {humanizeReportType(reportData.report_type)}
                      </p>
                    </>
                  ) : isCRM ? (
                    <>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.9)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                      >
                        {crmData.title}
                      </p>
                      <p style={{ fontSize: 11, color: BRAND.concrete, margin: '2px 0 0' }}>
                        {crmData.subtitle}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          margin: 0,
                        }}
                      >
                        {humanizeAgentName(agentData.agent_name)}
                        {getStatusIcon(agentData.status)}
                      </p>
                      <p style={{ fontSize: 11, color: BRAND.concrete, margin: '2px 0 0' }}>
                        {agentData.skills_called
                          ? `${agentData.skills_called} skills executed`
                          : agentData.status === 'running'
                            ? 'Running...'
                            : 'Completed'}
                      </p>
                    </>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: 10,
                    color: BRAND.concrete,
                    flexShrink: 0,
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                  }}
                >
                  {isReport
                    ? formatDate(reportData.created_at)
                    : isCRM
                      ? formatDate(crmData.timestamp.toISOString())
                      : formatDate(agentData.queued_at)}
                </span>

                {/* Unread indicator for reports */}
                {isReport && isUnread(reportData) && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: BRAND.teal,
                      boxShadow: `0 0 8px ${BRAND.teal}60`,
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {recentItems.length > 0 && (
        <p
          style={{
            margin: '1rem 0 0',
            fontSize: '0.65rem',
            color: `${BRAND.concrete}60`,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Showing {recentItems.length} most recent activities
        </p>
      )}
    </section>
  );
}
