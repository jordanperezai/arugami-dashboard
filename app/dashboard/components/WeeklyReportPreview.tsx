'use client';

import { Mail, CheckCircle2, TrendingUp, Zap, AlertCircle, ExternalLink, Calendar } from 'lucide-react';

interface AgentRun {
  agent_run_id: string;
  agent_type?: string;
  status: string;
  queued_at?: string;
  output?: any;
}

interface Client {
  business_name: string;
  brand_color?: string;
}

interface WeeklyReportPreviewProps {
  client: Client;
  agentRuns: AgentRun[];
}

export function WeeklyReportPreview({ client, agentRuns }: WeeklyReportPreviewProps) {
  const brandColor = client.brand_color || '#ea1d5c';

  // Calculate date range for "this week"
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateRange = `${formatDateShort(weekStart)}–${formatDateShort(now)}`;

  // Calculate metrics from agent runs
  const thisWeekRuns = agentRuns.filter(run => {
    const runDate = run.queued_at ? new Date(run.queued_at) : null;
    return runDate && runDate >= weekStart;
  });

  const successfulRuns = thisWeekRuns.filter(r => r.status === 'success').length;
  const totalRuns = thisWeekRuns.length;

  // Get unique automation types that ran
  const automationTypes = Array.from(new Set(thisWeekRuns.map(r => r.agent_type || 'task'))).slice(0, 3);

  // Mock metrics (would come from real integrations in production)
  const metrics = {
    transactions: 47,
    reviews: 3,
    leads: 8,
  };

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(95,227,133,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${brandColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Mail size={18} color={brandColor} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Weekly Report Preview</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              What you'll receive every Monday
            </p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: '#f1f5f9',
            borderRadius: 12,
          }}
        >
          <Calendar size={12} color="#64748b" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>MONDAYS</span>
        </div>
      </div>

      {/* Email Preview Card */}
      <div
        style={{
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          background: '#fafafa',
        }}
      >
        {/* Email Header */}
        <div
          style={{
            padding: '14px 16px',
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>ar</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>arugami</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>weekly@arugami.com</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {client.business_name} — Weekly Report ({dateRange})
          </p>
        </div>

        {/* Email Body */}
        <div style={{ padding: '16px' }}>

          {/* Health Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              background: '#ecfdf5',
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            <CheckCircle2 size={18} color="#10b981" />
            <p style={{ fontSize: 13, color: '#065f46', margin: 0, fontWeight: 500 }}>
              All systems running smoothly. Your grid handled everything this week.
            </p>
          </div>

          {/* Key Metrics */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              This Week's Numbers
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: '10px 12px', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{metrics.transactions}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0, marginTop: 2 }}>Transactions</p>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{metrics.reviews}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0, marginTop: 2 }}>New Reviews</p>
              </div>
              <div style={{ flex: 1, padding: '10px 12px', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{metrics.leads}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0, marginTop: 2 }}>Leads Captured</p>
              </div>
            </div>
          </div>

          {/* What We Handled */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              What We Handled
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {totalRuns > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={14} color="#10b981" />
                    <span style={{ fontSize: 13, color: '#334155' }}>
                      {successfulRuns} automated tasks completed successfully
                    </span>
                  </div>
                  {automationTypes.map((type, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 22 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                        {String(type).replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                  No automated tasks this week — grid is standing by
                </span>
              )}
            </div>
          </div>

          {/* Issues Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              background: '#f8fafc',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={14} color="#64748b" />
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              No issues this week. All clear.
            </p>
          </div>

          {/* CTA Button */}
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              background: brandColor,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            View Full Dashboard
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
        Delivered to your inbox every Monday at 8am
      </p>
    </section>
  );
}
