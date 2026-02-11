'use client';

import { useState } from 'react';
import { X, Database, Send, Zap, ArrowRight, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Integration {
  integration_id: string;
  integration_type: string;
  display_name: string;
  status: string;
  last_health_check: string | null;
}

interface AgentRun {
  agent_run_id: string;
  agent_type: string;
  status: string;
  queued_at: string;
  goal: string;
}

interface EcosystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: Integration[];
  agentRuns: AgentRun[];
}

const INPUT_TYPES = ['Point of Sale', 'CRM'];
const OUTPUT_TYPES = ['Email Marketing', 'Social Media', 'Local SEO'];

export function EcosystemModal({ isOpen, onClose, integrations, agentRuns }: EcosystemModalProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Categorize integrations
  const inputs = integrations.filter(i => INPUT_TYPES.includes(i.integration_type) || (!OUTPUT_TYPES.includes(i.integration_type) && i.integration_type !== 'Grid'));
  const outputs = integrations.filter(i => OUTPUT_TYPES.includes(i.integration_type));

  // Build activity feed from recent runs
  const recentActivity = agentRuns.slice(0, 5).map(run => ({
    id: run.agent_run_id,
    time: new Date(run.queued_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    message: run.goal,
    status: run.status,
    type: run.agent_type,
  }));

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 4 }}>
            Live Ecosystem
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            How your tools work together
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <X size={20} style={{ color: '#fff' }} />
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', padding: '48px 64px', gap: 48, overflow: 'hidden' }}>
        
        {/* Left: Sources */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Database size={18} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Data Sources
            </span>
          </div>
          
          {inputs.length > 0 ? inputs.map(integration => (
            <div
              key={integration.integration_id}
              onClick={() => setSelectedNode(integration.integration_id)}
              style={{
                padding: '20px 24px',
                background: selectedNode === integration.integration_id 
                  ? 'rgba(34, 197, 94, 0.15)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedNode === integration.integration_id 
                  ? '1px solid rgba(34, 197, 94, 0.3)' 
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{integration.display_name}</span>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: integration.status === 'active' ? '#22c55e' : '#ef4444',
                  boxShadow: integration.status === 'active' 
                    ? '0 0 10px rgba(34, 197, 94, 0.5)' 
                    : '0 0 10px rgba(239, 68, 68, 0.5)',
                  animation: integration.status === 'active' ? 'pulse 2s infinite' : 'none',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {integration.integration_type}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                Last sync: 2 minutes ago
              </p>
            </div>
          )) : (
            <div style={{ padding: 24, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 16, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No data sources connected</p>
            </div>
          )}
        </div>

        {/* Center: Grid Core */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          
          {/* Animated Connection Lines (Left) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, rgba(34,197,94,0.3), rgba(34,197,94,0.8))', borderRadius: 4 }}>
              <div style={{
                width: 8,
                height: 8,
                background: '#22c55e',
                borderRadius: '50%',
                animation: 'flowRight 2s infinite',
                marginTop: -3,
              }} />
            </div>
            <ArrowRight size={20} style={{ color: '#22c55e' }} />
          </div>

          {/* Central Grid Node */}
          <div
            onClick={() => setSelectedNode('grid')}
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: selectedNode === 'grid' ? '3px solid #22c55e' : '3px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 60px rgba(34, 197, 94, 0.2), inset 0 0 40px rgba(34, 197, 94, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
            }}
          >
            {/* Orbiting ring */}
            <div style={{
              position: 'absolute',
              inset: -20,
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '50%',
              animation: 'spin 20s linear infinite',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 6,
                height: 6,
                background: '#22c55e',
                borderRadius: '50%',
                marginLeft: -3,
                marginTop: -3,
              }} />
            </div>
            
            <Zap size={40} style={{ color: '#22c55e', marginBottom: 8 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>ARUGAMI</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>GRID</span>
          </div>

          {/* Animated Connection Lines (Right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ArrowRight size={20} style={{ color: '#3b82f6' }} />
            <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(59,130,246,0.3))', borderRadius: 4 }}>
              <div style={{
                width: 8,
                height: 8,
                background: '#3b82f6',
                borderRadius: '50%',
                animation: 'flowRight 2s infinite',
                marginTop: -3,
              }} />
            </div>
          </div>
        </div>

        {/* Right: Channels */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Send size={18} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Output Channels
            </span>
          </div>
          
          {outputs.length > 0 ? outputs.map(integration => (
            <div
              key={integration.integration_id}
              onClick={() => setSelectedNode(integration.integration_id)}
              style={{
                padding: '20px 24px',
                background: selectedNode === integration.integration_id 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : 'rgba(255,255,255,0.05)',
                border: selectedNode === integration.integration_id 
                  ? '1px solid rgba(59, 130, 246, 0.3)' 
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{integration.display_name}</span>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: integration.status === 'active' ? '#22c55e' : '#ef4444',
                  boxShadow: integration.status === 'active' 
                    ? '0 0 10px rgba(34, 197, 94, 0.5)' 
                    : '0 0 10px rgba(239, 68, 68, 0.5)',
                  animation: integration.status === 'active' ? 'pulse 2s infinite' : 'none',
                }} />
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {integration.integration_type}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                Last output: 15 minutes ago
              </p>
            </div>
          )) : (
            <div style={{ padding: 24, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 16, textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>No output channels connected</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '20px 32px',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Activity size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Recent Activity
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {recentActivity.length > 0 ? recentActivity.map(activity => (
            <div
              key={activity.id}
              style={{
                minWidth: 280,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {activity.status === 'success' ? (
                <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
              ) : activity.status === 'failed' ? (
                <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              ) : (
                <Clock size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: 13, 
                  color: '#fff', 
                  margin: 0, 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {activity.message}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: 2 }}>
                  {activity.time} · {activity.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )) : (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
