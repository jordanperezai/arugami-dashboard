'use client';

import { Wrench, Lock, Database, Mail, Image as ImageIcon, BarChart3 } from 'lucide-react';

interface AgentRun {
  agent_run_id: string;
  skills_called: number | null;
  status: string;
  agent_type: string;
}

interface Integration {
  integration_id: string;
  integration_type: string;
  display_name: string;
  status: string;
}

interface SkillsUsageProps {
  agentRuns: AgentRun[];
  integrations: Integration[];
}

// Map agent types to likely skills used (for demo visualization)
const getSkillsForAgentType = (agentType: string): string[] => {
  const skillMap: Record<string, string[]> = {
    business_health: ['fetch_pos_data', 'analyze_revenue', 'generate_insights'],
    follow_up_recommendations: ['fetch_customer_data', 'generate_email', 'schedule_campaign'],
    content_generation: ['fetch_brand_assets', 'generate_copy', 'optimize_image'],
    analytics_report: ['fetch_pos_data', 'fetch_crm_data', 'generate_report'],
  };
  return skillMap[agentType] || ['generic_skill'];
};

const getSkillIcon = (skillName: string) => {
  if (skillName.includes('fetch') || skillName.includes('data')) return Database;
  if (skillName.includes('email') || skillName.includes('campaign')) return Mail;
  if (skillName.includes('image') || skillName.includes('assets')) return ImageIcon;
  if (skillName.includes('analyze') || skillName.includes('report')) return BarChart3;
  return Wrench;
};

export function SkillsUsage({ agentRuns, integrations }: SkillsUsageProps) {
  // Generate skill usage data from agent runs
  const skillUsageMap: Record<string, { executions: number; successes: number; integration: string }> = {};

  agentRuns.forEach((run) => {
    const skills = getSkillsForAgentType(run.agent_type);
    
    skills.forEach((skill) => {
      if (!skillUsageMap[skill]) {
        // Try to map skill to integration
        const integration = integrations.find((i) =>
          skill.includes('pos') ? i.integration_type === 'pos_system' :
          skill.includes('email') || skill.includes('campaign') ? i.integration_type === 'marketing_platform' :
          false
        );

        skillUsageMap[skill] = {
          executions: 0,
          successes: 0,
          integration: integration?.display_name || 'Grid Core',
        };
      }

      skillUsageMap[skill].executions += 1;
      if (run.status === 'success') {
        skillUsageMap[skill].successes += 1;
      }
    });
  });

  // Sort by execution count and take top 4 for grid
  const topSkills = Object.entries(skillUsageMap)
    .sort((a, b) => b[1].executions - a[1].executions)
    .slice(0, 4);

  const totalSkillExecutions = Object.values(skillUsageMap).reduce(
    (sum, skill) => sum + skill.executions,
    0
  );

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Your Skills
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#0ea5e9',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: 12,
              }}
            >
              {topSkills.length} collected
            </span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Skills grow as you connect more tools
          </p>
        </div>
        <Wrench size={20} style={{ color: '#0ea5e9', opacity: 0.8 }} />
      </div>

      {/* Capabilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        {topSkills.length > 0 ? topSkills.map(([skillName, data]) => {
          const Icon = getSkillIcon(skillName);
          return (
            <div
              key={skillName}
              style={{
                padding: '12px',
                borderRadius: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon size={16} style={{ color: '#0f172a' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b' }}>{data.executions}×</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: 1.2, marginBottom: 2 }}>
                  {skillName.replace(/_/g, ' ')}
                </p>
                <p style={{ fontSize: 10, color: '#64748b' }}>{data.executions} uses</p>
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: 20, color: '#94a3b8', fontSize: 13 }}>
            Capabilities will appear as automations run
          </div>
        )}
      </div>

      {/* Unlock More Skills Teaser */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          border: '1px dashed #d8b4fe',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#f3e8ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Lock size={16} style={{ color: '#a855f7' }} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 2 }}>
            Unlock More Skills
          </p>
          <p style={{ fontSize: 10, color: '#8b5cf6' }}>
            Connect Instagram, Google Business, and more to grow your arsenal
          </p>
        </div>
      </div>
    </section>
  );
}
