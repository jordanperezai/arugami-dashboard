'use client';

import { Activity, CheckCircle2, AlertCircle, Radio } from 'lucide-react';

interface Integration {
  integration_id: string;
  integration_type?: string;
  display_name?: string;
  status: string;
}

interface AgentRun {
  agent_run_id: string;
  agent_type?: string;
  status: string;
}

interface GridHealthProps {
  integrations: Integration[];
  agentRuns: AgentRun[];
}

export function GridHealth({ integrations, agentRuns }: GridHealthProps) {
  // Calculate health metrics
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter((i) => i.status === 'active').length;
  const errorIntegrations = integrations.filter((i) => i.status === 'error').length;

  const totalAgentRuns = agentRuns.length;
  const successfulRuns = agentRuns.filter((r) => r.status === 'success').length;
  const failedRuns = agentRuns.filter((r) => r.status === 'failed' || r.status === 'error').length;

  // Determine overall status
  const hasErrors = errorIntegrations > 0 || failedRuns > 0;
  const allHealthy = activeIntegrations === totalIntegrations && (totalAgentRuns === 0 || successfulRuns === totalAgentRuns);
  
  const overallStatus = hasErrors 
    ? { label: 'Needs Attention', subtitle: 'Something needs a quick fix', color: '#f59e0b', icon: AlertCircle, bg: '#fffbeb' }
    : allHealthy 
      ? { label: 'All Good', subtitle: 'Everything running smoothly', color: '#10b981', icon: CheckCircle2, bg: '#ecfdf5' }
      : { label: 'Running', subtitle: 'Systems are working', color: '#3b82f6', icon: Activity, bg: '#eff6ff' };

  // Get unique agent types that have run
  const agentTypes = Array.from(new Set(agentRuns.map(r => r.agent_type || 'Unknown')));

  // Calculate smooth streak
  const oldestRun = agentRuns[agentRuns.length - 1];
  const sinceDate = oldestRun 
    ? new Date((oldestRun as any).queued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'recently';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              background: overallStatus.bg, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <overallStatus.icon size={18} color={overallStatus.color} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{overallStatus.label}</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, marginTop: 2 }}>
              {overallStatus.subtitle}
            </p>
          </div>
        </div>
        
        {/* Live Pulse Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', display: 'flex' }}>
            <div 
              style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: overallStatus.color,
                boxShadow: `0 0 0 2px ${overallStatus.color}20`
              }} 
            />
            <div 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: overallStatus.color,
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                opacity: 0.7
              }} 
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: overallStatus.color, letterSpacing: 0.5 }}>LIVE</span>
        </div>
      </div>

      {/* Simplified List Layout - Clean, No Tree Lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Integrations Group */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Connected Systems
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {integrations.length === 0 ? (
              <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No systems connected</span>
            ) : (
              integrations.map((integration) => (
                <div key={integration.integration_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div 
                      style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: integration.status === 'active' ? '#cbd5e1' : '#f87171' 
                      }} 
                    />
                    <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>
                      {integration.display_name || integration.integration_type}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: integration.status === 'active' ? '#f1f5f9' : '#fef2f2',
                    color: integration.status === 'active' ? '#64748b' : '#ef4444'
                  }}>
                    {integration.status === 'active' ? 'Active' : 'Error'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

        {/* Agents Group */}
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Automations
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agentTypes.length === 0 ? (
               <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>No automations running yet</span>
            ) : (
              agentTypes.map((agentType) => {
                const runsOfType = agentRuns.filter(r => (r.agent_type || 'Unknown') === agentType);
                const successOfType = runsOfType.filter(r => r.status === 'success').length;
                const allSuccess = successOfType === runsOfType.length;
                
                return (
                  <div key={agentType} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                       <Radio size={14} color={allSuccess ? '#10b981' : '#f59e0b'} />
                      <span style={{ fontSize: 14, color: '#334155', fontWeight: 500, textTransform: 'capitalize' }}>
                        {agentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                     <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {successOfType}/{runsOfType.length} runs
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer: AI-native messaging */}
      <div style={{ marginTop: 24, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
         <p style={{ fontSize: 12, color: '#64748b', margin: 0, textAlign: 'center' }}>
           {hasErrors
             ? 'Some issues need your attention above.'
             : (
               <>
                 <span style={{ color: '#10b981' }}>●</span> Your grid is learning your business patterns
               </>
             )}
         </p>
      </div>

    </section>
  );
}
