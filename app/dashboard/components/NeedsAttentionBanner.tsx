'use client';

import { AlertTriangle, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface Integration {
  integration_id: string;
  display_name?: string;
  status: string;
}

interface AgentRun {
  agent_run_id: string;
  agent_type: string;
  status: string;
  queued_at: string;
}

interface NeedsAttentionBannerProps {
  integrations: Integration[];
  agentRuns: AgentRun[];
  pendingDecisions?: number;
}

export function NeedsAttentionBanner({ integrations, agentRuns, pendingDecisions = 0 }: NeedsAttentionBannerProps) {
  const failedIntegrations = integrations.filter(i => i.status === 'error');

  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

  const failedRuns = agentRuns.filter(r =>
    (r.status === 'failed' || r.status === 'error') &&
    new Date(r.queued_at) >= twentyFourHoursAgo
  );

  const hasCriticalIssues = failedIntegrations.length > 0 || failedRuns.length > 0;
  const hasDecisions = pendingDecisions > 0;

  // Priority 3: Healthy State (Proactive CTA)
  if (!hasCriticalIssues && !hasDecisions) {
    return (
      <div
        style={{
          padding: '16px 24px',
          borderRadius: 12,
          background: BRAND.utilitySlate,
          border: `1px solid ${BRAND.teal}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          marginTop: '-1rem',
          animation: 'fadeIn 0.5s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: BRAND.gridCharcoal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${BRAND.teal}40`,
            }}
          >
            <CheckCircle2 size={20} style={{ color: BRAND.teal }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: 2 }}>
              You're all set for now
            </h3>
            <p style={{ fontSize: 13, color: BRAND.concrete, margin: 0 }}>
              Take a quick look at this week's wins.
            </p>
          </div>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: BRAND.gridCharcoal,
            color: BRAND.teal,
            fontSize: 13,
            fontWeight: 600,
            border: `1px solid ${BRAND.teal}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = BRAND.teal;
            e.currentTarget.style.color = BRAND.gridCharcoal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = BRAND.gridCharcoal;
            e.currentTarget.style.color = BRAND.teal;
          }}
        >
          Review Weekly Wins
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Priority 1: Critical Issues
  if (hasCriticalIssues) {
    return (
      <div
        style={{
          padding: '16px 24px',
          borderRadius: 12,
          background: BRAND.utilitySlate,
          border: `1px solid ${BRAND.red}40`,
          borderLeft: `4px solid ${BRAND.red}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          marginTop: '-1rem',
          animation: 'slideDown 0.3s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `${BRAND.red}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} style={{ color: BRAND.red }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: 2 }}>
              Action Required
            </h3>
            <p style={{ fontSize: 13, color: BRAND.concrete, margin: 0 }}>
              {failedIntegrations.length > 0
                ? `${failedIntegrations[0].display_name || 'A connection'} stopped working.`
                : `${failedRuns.length} automation${failedRuns.length > 1 ? 's' : ''} didn't run correctly.`
              }
            </p>
          </div>
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: BRAND.red,
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Fix Now
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Priority 2: Decisions Needed
  return (
    <div
      style={{
        padding: '16px 24px',
        borderRadius: 12,
        background: BRAND.utilitySlate,
        border: `1px solid ${BRAND.amber}40`,
        borderLeft: `4px solid ${BRAND.amber}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        marginTop: '-1rem',
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `${BRAND.amber}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HelpCircle size={20} style={{ color: BRAND.amber }} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: 2 }}>
            Quick decision needed
          </h3>
          <p style={{ fontSize: 13, color: BRAND.concrete, margin: 0 }}>
            {pendingDecisions} item{pendingDecisions > 1 ? 's' : ''} waiting for your approval.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'transparent',
            color: BRAND.concrete,
            fontSize: 13,
            fontWeight: 600,
            border: `1px solid ${BRAND.concrete}40`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = BRAND.teal;
            e.currentTarget.style.color = BRAND.teal;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${BRAND.concrete}40`;
            e.currentTarget.style.color = BRAND.concrete;
          }}
        >
          Dismiss
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: BRAND.amber,
            color: BRAND.gridCharcoal,
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Review
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
