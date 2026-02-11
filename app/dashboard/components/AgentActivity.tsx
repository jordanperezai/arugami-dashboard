'use client';

import { Bot } from 'lucide-react';

interface AgentRun {
  agent_run_id: string;
  agent_type: string;
  goal: string;
  status: string;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  skills_called: number | null;
  total_execution_time_ms: number | null;
}

interface AgentActivityProps {
  agentRuns: AgentRun[];
}

export function AgentActivity({ agentRuns }: AgentActivityProps) {
  // Calculate summary stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentRuns = agentRuns.filter((run) => new Date(run.queued_at) >= sevenDaysAgo);
  const successfulRuns = recentRuns.filter((r) => r.status === 'success').length;
  const successRate = recentRuns.length > 0 ? Math.round((successfulRuns / recentRuns.length) * 100) : 0;

  const totalExecutionTime = recentRuns.reduce((sum, run) => sum + (run.total_execution_time_ms || 0), 0);
  const avgExecutionTime = recentRuns.length > 0 ? totalExecutionTime / recentRuns.length : 0;

  // Count agent types
  const agentTypeCounts: Record<string, number> = {};
  recentRuns.forEach((run) => {
    agentTypeCounts[run.agent_type] = (agentTypeCounts[run.agent_type] || 0) + 1;
  });
  const mostActiveAgent = Object.keys(agentTypeCounts).length > 0
    ? Object.entries(agentTypeCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#22c55e';
      case 'running':
        return '#0ea5e9';
      case 'queued':
        return '#64748b';
      case 'failure':
      case 'timeout':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  // Group runs by relative day
  const groupedRuns: Record<string, AgentRun[]> = {};
  recentRuns.forEach(run => {
    const date = new Date(run.queued_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (date.toDateString() === today.toDateString()) key = 'Today';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
    
    if (!groupedRuns[key]) groupedRuns[key] = [];
    groupedRuns[key].push(run);
  });

  const groupKeys = Object.keys(groupedRuns);

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 20,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          AI Agent Activity
        </h2>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#10b981',
            background: '#ecfdf5',
            padding: '2px 8px',
            borderRadius: 10,
            letterSpacing: 0.3,
          }}
        >
          ALWAYS ON
        </span>
      </div>

      {/* Compact narrative summary — context line, not a second KPI card */}
      {recentRuns.length > 0 && (
        <p
          style={{
            fontSize: 13,
            color: '#64748b',
            marginBottom: 16,
            lineHeight: 1.6,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px 12px',
          }}
        >
          <span style={{ color: '#94a3b8' }}>Last 7 days:</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{recentRuns.length} tasks</span>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <span
            style={{
              fontWeight: 600,
              color: successRate >= 80 ? '#22c55e' : successRate >= 60 ? '#f59e0b' : '#ef4444',
            }}
          >
            {successRate}% success
          </span>
          <span style={{ color: '#cbd5e1' }}>·</span>
          <span style={{ fontWeight: 500, color: '#0f172a' }}>
            avg {(avgExecutionTime / 1000).toFixed(1)}s
          </span>
          {mostActiveAgent && (
            <>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span
                style={{
                  fontWeight: 500,
                  color: '#0f172a',
                  textTransform: 'capitalize',
                }}
              >
                most used: {mostActiveAgent.replace(/_/g, ' ')}
              </span>
            </>
          )}
        </p>
      )}

      {agentRuns.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 140,
            textAlign: 'center',
            color: '#94a3b8',
          }}
        >
          <Bot size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: '#0f172a' }}>No activity yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Your automations will show up here as they run.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            maxHeight: 500,
            overflowY: 'auto',
          }}
        >
          {groupKeys.map((group) => (
            <div key={group}>
              <h3 style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: '#94a3b8', 
                textTransform: 'uppercase', 
                letterSpacing: 0.5, 
                marginBottom: 12,
                paddingLeft: 4
              }}>
                {group}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {groupedRuns[group].map((run) => (
                  <div
                    key={run.agent_run_id}
                    style={{
                      padding: '16px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)';
                      e.currentTarget.style.border = '1px solid rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                      e.currentTarget.style.border = '1px solid rgba(0,0,0,0.04)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Bot size={18} style={{ color: '#10b981', opacity: 0.8 }} />
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#0f172a',
                            textTransform: 'capitalize',
                          }}
                        >
                          {run.agent_type.replace(/_/g, ' ')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: getStatusColor(run.status),
                            boxShadow: `0 0 0 3px ${getStatusColor(run.status)}20`,
                          }}
                        />
                        <p
                          style={{
                            fontSize: 12,
                            color: '#0f172a',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                          }}
                        >
                          {run.status}
                        </p>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8, lineHeight: 1.5 }}>
                      {run.goal}
                    </p>

                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                      <span>{formatDate(run.queued_at)}</span>
                      {run.skills_called != null && run.skills_called > 0 && (
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          {run.skills_called} steps
                        </span>
                      )}
                      {run.total_execution_time_ms && (
                        <span>{(run.total_execution_time_ms / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
