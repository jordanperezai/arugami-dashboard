import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/utils/supabase';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding endpoint is disabled in production.' },
      { status: 403 },
    );
  }

  try {
    // Use service client to bypass RLS for seeding
    const supabase = getSupabaseServiceClient();

    // Get the first client (Cubita in current dev setup)
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);

    if (clientError) {
      console.error('Error fetching client for seeding:', clientError);
      return NextResponse.json(
        { error: 'Failed to load client for seeding' },
        { status: 500 },
      );
    }

    const client = clients?.[0];

    if (!client) {
      return NextResponse.json(
        { error: 'No client found to seed data for. Create a client row first.' },
        { status: 400 },
      );
    }

    const clientId = client.client_id;

    // 0) Clear existing seed data for fresh start
    await supabase.from('reports').delete().eq('client_id', clientId);
    await supabase.from('agent_runs').delete().eq('client_id', clientId);
    await supabase.from('integrations').delete().eq('client_id', clientId);
    console.log('Cleared existing data for client:', clientId);

    // 1) Sample integrations — Cubita uses Clover POS
    const { error: integrationsError, data: insertedIntegrations } = await supabase.from('integrations').insert([
      {
        client_id: clientId,
        display_name: 'Clover POS',
        integration_type: 'clover',
        status: 'active',
        credentials_encrypted: {},
      },
      {
        client_id: clientId,
        display_name: 'Google Business Profile',
        integration_type: 'google_business',
        status: 'active',
        credentials_encrypted: {},
      },
      {
        client_id: clientId,
        display_name: 'arugami CRM',
        integration_type: 'arugami_crm',  // White-labeled GHL
        status: 'disabled',  // Will be 'active' once connected
        credentials_encrypted: {},
      },
    ]).select();

    if (integrationsError) {
      console.error('Error seeding integrations:', integrationsError);
    }

    // 2) Sample agent runs — realistic activity over last 7 days
    const now = new Date();
    const minutesAgo = (mins: number) =>
      new Date(now.getTime() - mins * 60_000).toISOString();
    const daysAgo = (days: number, hour: number = 8) => {
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString();
    };

    const agentRunsData = [
      // Today
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: minutesAgo(45),
        started_at: minutesAgo(44),
        completed_at: minutesAgo(43),
        skills_called: 4,
        total_execution_time_ms: 52_000,
      },
      // Yesterday
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: daysAgo(1, 8),
        started_at: daysAgo(1, 8),
        completed_at: daysAgo(1, 8),
        skills_called: 4,
        total_execution_time_ms: 48_000,
      },
      {
        client_id: clientId,
        agent_type: 'follow_up_recommendations',
        goal: 'Identify catering leads that need follow-up',
        status: 'success',
        queued_at: daysAgo(1, 14),
        started_at: daysAgo(1, 14),
        completed_at: daysAgo(1, 14),
        skills_called: 2,
        total_execution_time_ms: 31_000,
      },
      // 2 days ago
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: daysAgo(2, 8),
        started_at: daysAgo(2, 8),
        completed_at: daysAgo(2, 8),
        skills_called: 4,
        total_execution_time_ms: 55_000,
      },
      // 3 days ago
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: daysAgo(3, 8),
        started_at: daysAgo(3, 8),
        completed_at: daysAgo(3, 8),
        skills_called: 4,
        total_execution_time_ms: 49_000,
      },
      {
        client_id: clientId,
        agent_type: 'social_content',
        goal: 'Draft Instagram post featuring Cuban coffee special',
        status: 'success',
        queued_at: daysAgo(3, 10),
        started_at: daysAgo(3, 10),
        completed_at: daysAgo(3, 10),
        skills_called: 3,
        total_execution_time_ms: 67_000,
      },
      // 5 days ago
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: daysAgo(5, 8),
        started_at: daysAgo(5, 8),
        completed_at: daysAgo(5, 8),
        skills_called: 4,
        total_execution_time_ms: 51_000,
      },
      // 6 days ago
      {
        client_id: clientId,
        agent_type: 'business_health',
        goal: 'Generate daily business health summary for Cubita Café',
        status: 'success',
        queued_at: daysAgo(6, 8),
        started_at: daysAgo(6, 8),
        completed_at: daysAgo(6, 8),
        skills_called: 4,
        total_execution_time_ms: 46_000,
      },
      {
        client_id: clientId,
        agent_type: 'follow_up_recommendations',
        goal: 'Check for unanswered Google reviews',
        status: 'success',
        queued_at: daysAgo(6, 15),
        started_at: daysAgo(6, 15),
        completed_at: daysAgo(6, 15),
        skills_called: 2,
        total_execution_time_ms: 28_000,
      },
    ];

    const { error: agentRunsError } = await supabase.from('agent_runs').insert(agentRunsData).select();

    if (agentRunsError) {
      console.error('Error seeding agent runs:', agentRunsError);
    }

    // 3) Sample reports — realistic content for Cubita Café
    const { data: seededAgentRuns } = await supabase
      .from('agent_runs')
      .select('agent_run_id')
      .eq('client_id', clientId)
      .order('queued_at', { ascending: false })
      .limit(1);

    const linkedAgentRunId = seededAgentRuns?.[0]?.agent_run_id ?? null;

    const reportsData = [
      // Today's daily report
      {
        client_id: clientId,
        agent_run_id: linkedAgentRunId,
        report_type: 'daily_summary',
        title: 'Daily Summary — Monday',
        content: {
          summary: 'Steady Monday at Cubita. 2 new catering inquiries and strong morning rush.',
          highlights: [
            '2 new catering inquiries (holiday parties)',
            '23 repeat customers identified',
            '4.8★ average on Google reviews this week',
          ],
          metrics: {
            transactions: 127,
            topSeller: 'Cuban Sandwich',
            topSellerCount: 34,
          },
          actionItems: [],
        },
        delivered_via: ['dashboard'],
        created_at: minutesAgo(30),
      },
      // Yesterday
      {
        client_id: clientId,
        report_type: 'daily_summary',
        title: 'Daily Summary — Sunday',
        content: {
          summary: 'Quiet Sunday. Good for prep and planning.',
          highlights: [
            'Weekend brunch traffic up 12% vs last week',
            '1 new 5-star Google review',
          ],
          metrics: {
            transactions: 89,
            topSeller: 'Empanadas (Beef)',
            topSellerCount: 28,
          },
          actionItems: [],
        },
        delivered_via: ['dashboard'],
        created_at: daysAgo(1, 20),
      },
      // Weekly report from 2 days ago
      {
        client_id: clientId,
        report_type: 'weekly_business_health',
        title: 'Weekly Business Health — Dec 1-7',
        content: {
          summary: 'Strong week for Cubita. Catering pipeline is heating up for the holidays.',
          highlights: [
            '6 catering inquiries this week (+50% vs prior week)',
            '892 total transactions',
            '12 new email subscribers',
            '3 Google reviews (all 5-star)',
          ],
          metrics: {
            weeklyTransactions: 892,
            avgTransactionValue: 18.45,
            repeatCustomerRate: '34%',
            googleRating: 4.8,
          },
          opportunities: [
            'Follow up with 2 catering leads who haven\'t responded',
            'Consider holiday-themed Instagram post',
          ],
          warnings: [],
        },
        delivered_via: ['dashboard', 'email'],
        created_at: daysAgo(2, 9),
      },
      // Older daily reports
      {
        client_id: clientId,
        report_type: 'daily_summary',
        title: 'Daily Summary — Saturday',
        content: {
          summary: 'Busy Saturday with strong lunch and afternoon traffic.',
          highlights: [
            'Best Saturday this month',
            '2 catering inquiries for corporate events',
          ],
          metrics: {
            transactions: 156,
            topSeller: 'Cuban Sandwich',
            topSellerCount: 42,
          },
          actionItems: [],
        },
        delivered_via: ['dashboard'],
        created_at: daysAgo(2, 20),
      },
    ];

    const { error: reportsError } = await supabase.from('reports').insert(reportsData);

    if (reportsError) {
      console.error('Error seeding reports:', reportsError);
    }

    // Read back counts so we can see what actually exists
    const [{ count: integrationsCount }, { count: agentRunsCount }, { count: reportsCount }] =
      await Promise.all([
        supabase
          .from('integrations')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId),
        supabase
          .from('agent_runs')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId),
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientId),
      ]);

    return NextResponse.json({
      ok: true,
      message: 'Attempted to seed sample integrations, agent runs, and one report for the first client.',
      client_id: clientId,
      integrations: {
        error: integrationsError ?? null,
        count: integrationsCount ?? null,
      },
      agent_runs: {
        error: agentRunsError ?? null,
        count: agentRunsCount ?? null,
      },
      reports: {
        error: reportsError ?? null,
        count: reportsCount ?? null,
      },
    });
  } catch (error) {
    console.error('Unexpected error in seed endpoint:', error);
    return NextResponse.json(
      { error: 'Unexpected error while seeding sample data' },
      { status: 500 },
    );
  }
}
