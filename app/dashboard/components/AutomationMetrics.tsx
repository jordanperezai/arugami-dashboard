'use client';

import { Zap, Share2, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { BRAND } from '@/lib/brand';

interface AgentRun {
  agent_run_id: string;
  skills_called: number | null;
  status: string;
  queued_at: string;
}

interface Integration {
  integration_id: string;
  integration_type?: string;
  display_name?: string;
  status: string;
}

interface Client {
  client_id: string;
  business_name: string;
  labor_cost_per_hour_cents?: number;
  weekly_automation_goal?: number;
  avg_minutes_per_task?: number;
}

interface GHLMetrics {
  contactsThisWeek: number;
  contactsTotal: number;
  opportunitiesThisWeek: number;
  openOpportunities: number;
  totalPipelineValue: number;
}

interface AutomationMetricsProps {
  agentRuns: AgentRun[];
  client: Client;
  integrations?: Integration[];
  ghlMetrics?: GHLMetrics | null;
}

export function AutomationMetrics({ agentRuns, client, integrations = [], ghlMetrics }: AutomationMetricsProps) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter((i) => i.status === 'active').length;
  const errorIntegrations = integrations.filter((i) => i.status === 'error').length;
  const failedRuns = agentRuns.filter((r) => r.status === 'failed' || r.status === 'error').length;
  const hasErrors = errorIntegrations > 0 || failedRuns > 0;
  const allHealthy = activeIntegrations === totalIntegrations && failedRuns === 0;

  const recentRuns = agentRuns.filter((run) => new Date(run.queued_at) >= sevenDaysAgo);
  const totalSkillExecutions = recentRuns.reduce((sum, run) => sum + (run.skills_called || 0), 0);
  const successfulRuns = recentRuns.filter((r) => r.status === 'success').length;
  const successRate = recentRuns.length > 0 ? Math.round((successfulRuns / recentRuns.length) * 100) : 100;

  const avgMinutesPerTask = client.avg_minutes_per_task || 15;
  const totalMinutesSaved = totalSkillExecutions * avgMinutesPerTask;
  const hoursSaved = Math.round((totalMinutesSaved / 60) * 10) / 10;

  const weeklyGoal = client.weekly_automation_goal || 20;
  const goalProgress = Math.min((totalSkillExecutions / weeklyGoal) * 100, 100);
  const tasksUntilGoal = Math.max(weeklyGoal - totalSkillExecutions, 0);

  const workdaysSaved = (hoursSaved / 8).toFixed(1);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalProgress / 100) * circumference;

  const handleShare = async () => {
    const shareText = `${client.business_name} — This Week:\n\n• ${totalSkillExecutions} tasks handled automatically\n• ${hoursSaved} hours saved (about ${workdaysSaved} workdays)\n• ${successRate}% success rate`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Weekly Automation Wins',
          text: shareText,
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <section
      style={{
        padding: '1.75rem',
        borderRadius: 16,
        background: BRAND.utilitySlate,
        border: `1px solid ${BRAND.concrete}20`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${BRAND.teal}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            This Week's Impact
          </h2>
          <p style={{ fontSize: 12, color: BRAND.concrete, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: BRAND.teal,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            The grid handled work you didn't have to do
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleShare}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: BRAND.concrete,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = BRAND.teal}
            onMouseLeave={(e) => e.currentTarget.style.color = BRAND.concrete}
            title="Share this report"
          >
            <Share2 size={18} />
          </button>
          <Zap size={20} style={{ color: BRAND.amber, opacity: 0.8 }} />
        </div>
      </div>

      {/* Hero impact line */}
      <div
        style={{
          marginBottom: 18,
          padding: '14px 18px',
          borderRadius: 12,
          background: BRAND.gridCharcoal,
          border: `1px solid ${BRAND.teal}30`,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>
          {hoursSaved} hours back this week
        </span>
        <span style={{ fontSize: 12, color: BRAND.concrete }}>
          Follow-ups, reminders, and updates went out automatically so you didn't have to chase them.
        </span>
      </div>

      {/* Main Metric: Tasks Automated with Progress Ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Ring Background */}
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={BRAND.gridCharcoal}
              strokeWidth="6"
              fill="transparent"
            />
            {/* Progress Ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={BRAND.amber}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              fontSize: 28,
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {totalSkillExecutions}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
            actions handled for you
          </span>
          <span style={{ fontSize: 13, color: BRAND.concrete }}>
            {goalProgress >= 100
              ? 'Weekly goal reached'
              : `${tasksUntilGoal} more to weekly goal`}
          </span>
        </div>
      </div>

      {/* Impact Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: ghlMetrics ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: 12 }}>

        {/* New Leads (GHL) */}
        {ghlMetrics && (
          <div
            style={{
              padding: '14px',
              borderRadius: 12,
              background: BRAND.gridCharcoal,
              border: `1px solid ${BRAND.amber}30`,
            }}
          >
            <p style={{ fontSize: 11, color: BRAND.amber, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
              NEW LEADS
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
              {ghlMetrics.contactsThisWeek}
            </p>
            <p style={{ fontSize: 11, color: BRAND.concrete, marginTop: 4 }}>
              {ghlMetrics.openOpportunities} open opportunities
            </p>
          </div>
        )}

        {/* Time Saved */}
        <div
          style={{
            padding: '14px',
            borderRadius: 12,
            background: BRAND.gridCharcoal,
            border: `1px solid ${BRAND.teal}30`,
          }}
        >
          <p style={{ fontSize: 11, color: BRAND.teal, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
            TIME SAVED
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>{workdaysSaved} workdays</p>
          <p style={{ fontSize: 11, color: BRAND.concrete, marginTop: 4, lineHeight: 1.3 }}>
            That's equivalent to {hoursSaved} hours saved, giving you more time to focus on what matters.
          </p>
        </div>

        {/* Success Rate */}
        <div
          style={{
            padding: '14px',
            borderRadius: 12,
            background: BRAND.gridCharcoal,
            border: successRate === 100
              ? `1px solid ${BRAND.teal}40`
              : `1px solid ${BRAND.concrete}20`,
            boxShadow: successRate === 100
              ? `0 0 15px ${BRAND.teal}15`
              : 'none',
          }}
        >
          <p style={{ fontSize: 11, color: successRate === 100 ? BRAND.teal : BRAND.concrete, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
            RELIABILITY
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: successRate >= 80 ? BRAND.teal : successRate >= 50 ? BRAND.amber : BRAND.red }}>
            {successRate}%
          </p>
          <p style={{ fontSize: 11, color: BRAND.concrete, marginTop: 4 }}>
            {successfulRuns} successful runs this week
          </p>
        </div>
      </div>
    </section>
  );
}
