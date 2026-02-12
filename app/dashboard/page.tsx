export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { DashboardHeader } from './components/DashboardHeader';
import { NeedsAttentionBanner } from './components/NeedsAttentionBanner';
import { IntegrationStatus } from './components/IntegrationStatus';
import { AutomationMetrics } from './components/AutomationMetrics';
import { ComingSoonAutomations } from './components/ComingSoonAutomations';
import { RecentActivity } from './components/RecentActivity';
import { GridBackground } from './components/GridBackground';
import { QRCodeManager } from './components/QRCodeManager';
import type { GHLMetrics, GHLActivityItem } from '../../lib/ghl/types';
import { getKernelMetrics, getKernelActivity, getKernelHealth } from '../../lib/kernel-data';
import { BRAND } from '@/lib/brand';

// V8 Simplification: Removed/moved to Settings
// import { ClientOverview } from './components/ClientOverview';
// import { GridHealth } from './components/GridHealth'; // Merged into AutomationMetrics
// import { SkillsUsage } from './components/SkillsUsage';
// import { ActivityTrends } from './components/ActivityTrends';
// import { IntegrationsMarketplace } from './components/IntegrationsMarketplace'; // Move to Settings
// import { WeeklyReportPreview } from './components/WeeklyReportPreview'; // Move to Settings
// import { ReportsFeed } from './components/ReportsFeed'; // Merged into RecentActivity
// import { AgentActivity } from './components/AgentActivity'; // Merged into RecentActivity

async function getClientData() {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Error getting authenticated user:', authError);
      return {
        client: null,
        reports: [],
        agentRuns: [],
        integrations: [],
      };
    }

    // Get the user's client from client_users junction table
    const { data: clientUsers, error: clientUserError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .limit(1);

    if (clientUserError || !clientUsers?.[0]) {
      console.error('Error fetching client for user:', clientUserError);
      return {
        client: null,
        reports: [],
        agentRuns: [],
        integrations: [],
      };
    }

    const clientId = clientUsers[0].client_id;

    // Get client details
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .limit(1);

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return {
        client: null,
        reports: [],
        agentRuns: [],
        integrations: [],
      };
    }

    const client = clients?.[0] || null;

    if (!client) {
      return {
        client: null,
        reports: [],
        agentRuns: [],
        integrations: [],
      };
    }

    // Ensure brand_color has a fallback
    const clientWithBrandColor = {
      ...client,
      brand_color: client.brand_color || '#2FB7A4', // arugami teal default
    };

    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('client_id', client.client_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: agentRuns } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('client_id', client.client_id)
      .order('queued_at', { ascending: false })
      .limit(10);

    const { data: integrations } = await supabase
      .from('integrations')
      .select('*')
      .eq('client_id', client.client_id);

    // Fetch kernel data (receipts, tasks) — replaces mock GHL data
    let ghlMetrics: GHLMetrics | null = null;
    let ghlActivity: GHLActivityItem[] = [];
    let ghlHealthy = false;

    try {
      const [metrics, activity, health] = await Promise.all([
        getKernelMetrics(client.client_id),
        getKernelActivity(client.client_id, 10),
        getKernelHealth(client.client_id),
      ]);

      ghlMetrics = metrics;
      ghlActivity = activity;
      ghlHealthy = health.healthy;
    } catch (error) {
      console.error('[Dashboard] Error fetching kernel data:', error);
      // Graceful degradation - dashboard still works without kernel data
    }

    return {
      client: clientWithBrandColor,
      reports: reports || [],
      agentRuns: agentRuns || [],
      integrations: integrations || [],
      ghlMetrics,
      ghlActivity,
      ghlHealthy,
    };
  } catch (error) {
    console.error('Error in getClientData:', error);
    return {
      client: null,
      reports: [],
      agentRuns: [],
      integrations: [],
      ghlMetrics: null,
      ghlActivity: [],
      ghlHealthy: false,
    };
  }
}

export default async function DashboardPage() {
  const { client, reports, agentRuns, integrations, ghlMetrics, ghlActivity, ghlHealthy } = await getClientData();

  const logoDevToken =
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY ||
    Object.entries(process.env).find(([key]) =>
      key.includes('LOGO_DEV_PUBLISHABLE_KEY')
    )?.[1];

  // Build at-a-glance narrative summary (V1: Story-driven)
  const now = new Date();
  const hour = now.getHours();
  const twentyFourHoursAgo = new Date(now);
  twentyFourHoursAgo.setDate(now.getDate() - 1);

  const safeAgentRuns = agentRuns || [];
  const safeReports = reports || [];
  const safeIntegrations = integrations || [];

  const recentRuns24h = safeAgentRuns.filter((run: any) => {
    const queuedAt = run.queued_at ? new Date(run.queued_at) : null;
    return queuedAt && queuedAt >= twentyFourHoursAgo;
  });

  const reports24h = safeReports.filter((report: any) => {
    const createdAt = report.created_at ? new Date(report.created_at) : null;
    return createdAt && createdAt >= twentyFourHoursAgo;
  });

  const failingIntegrations = safeIntegrations.filter(
    (integration: any) => integration.status === 'error'
  ).length;

  const hasFailures =
    failingIntegrations > 0 ||
    safeAgentRuns.some(
      (run: any) => run.status === 'failed' || run.status === 'error'
    );

  const getNarrativeSummary = () => {
    // 1. Critical Alerts First
    if (hasFailures) {
      return `Alert: ${failingIntegrations} integration${failingIntegrations === 1 ? '' : 's'} need${failingIntegrations === 1 ? 's' : ''} attention. Review Grid Status.`;
    }

    // 2. High Activity (Success)
    if (recentRuns24h.length >= 3) {
      return `Your grid is active. ${recentRuns24h.length} automated actions handled in the last 24 hours.`;
    }

    // 3. New Reports (Insight)
    if (reports24h.length > 0) {
      return `Daily briefing ready. You have ${reports24h.length} new report${reports24h.length === 1 ? '' : 's'} to review.`;
    }

    // 4. Quiet / Standing By (Contextual)
    if (hour < 9) {
      return "All systems operational. Grid is monitoring while you start your day.";
    }
    if (hour > 18) {
      return `Quiet evening. Grid remains active and healthy.`;
    }

    return "All systems operational. Grid is standing by for new tasks.";
  };

  const summaryLine = getNarrativeSummary();

  let storyHighlight: string | undefined;

  if (hasFailures) {
    storyHighlight = 'Some tools need attention. See the banner below.';
  } else if (recentRuns24h.length >= 3) {
    storyHighlight = `${recentRuns24h.length} automated actions handled in the last 24 hours.`;
  } else if (reports24h.length > 0) {
    storyHighlight = `Daily briefing ready. You have ${reports24h.length} new report${reports24h.length === 1 ? '' : 's'}.`;
  } else {
    storyHighlight = 'Grid is connected and standing by for new tasks.';
  }

  const setupSteps = [
    {
      id: 'integrations',
      label: 'Connect your first tool',
      done: integrations.length > 0,
    },
    {
      id: 'reports',
      label: 'Receive your first report',
      done: reports.length > 0,
    },
    {
      id: 'agents',
      label: 'Let an AI agent run',
      done: agentRuns.length > 0,
    },
  ];

  if (!client) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', background: BRAND.gridCharcoal }}>
        <p style={{ color: BRAND.concrete }}>No client data found. Please contact support.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: BRAND.gridCharcoal,
        position: 'relative',
      }}
    >
      {/* Animated Grid Background */}
      <GridBackground />

      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <DashboardHeader 
          client={client} 
          summaryLine={summaryLine} 
          gridHealthy={!hasFailures} 
          storyBeat={storyHighlight}
        />
        
        <NeedsAttentionBanner 
          integrations={integrations} 
          agentRuns={agentRuns} 
          pendingDecisions={0} // Set to 0 to show Healthy State CTA
        />

        {/* V8: This Week's Impact — Primary value proof + system health */}
        <AutomationMetrics
          agentRuns={agentRuns}
          client={client}
          integrations={integrations}
          ghlMetrics={ghlMetrics}
        />

        {/* V8: Live Ecosystem — THE HERO (70% viewport, shareable) */}
        <IntegrationStatus
          integrations={integrations}
          agentRuns={agentRuns}
          fullWidth
          logoDevToken={logoDevToken}
          clientWebsite={client.website || client.slug || ''}
          clientBrandColor={client.brand_color}
          ghlHealthy={ghlHealthy}
          ghlMetrics={ghlMetrics}
        />

        {/* V8: AI Team Teaser — Movie trailer style, not construction site */}
        <ComingSoonAutomations brandColor={client.brand_color} />

        {/* QR Code Tracking — Generate + track QR codes, trigger pipelines */}
        <QRCodeManager />

        {/* V8: Recent Activity — Unified feed (merged ReportsFeed + AgentActivity) */}
        <RecentActivity reports={reports} agentRuns={agentRuns} ghlActivity={ghlActivity} />

        {/* V8: Removed sections (moved to Settings or merged):
            - GridHealth → merged into AutomationMetrics (Phase 2)
            - ClientOverview → removed (status shown in header)
            - SkillsUsage → removed
            - ActivityTrends → removed
            - WeeklyReportPreview → moved to Settings
            - IntegrationsMarketplace → moved to Settings
        */}
      </div>
    </main>
  );
}
