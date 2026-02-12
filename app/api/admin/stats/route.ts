export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/stats
 * Returns health metrics for the admin ops overview
 */
export async function GET() {
  try {
    // Verify admin access via session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service client for data operations
    const db = getSupabaseServiceClient();

    // Get all clients
    const { data: clients, error: clientsError } = await db
      .from('clients')
      .select('client_id, business_name, status, mrr_cents, created_at');

    if (clientsError) {
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: clientsError.message },
        { status: 500 }
      );
    }

    // Calculate stats
    const activeClients = clients?.filter(c => c.status === 'active').length || 0;
    const pendingClients = clients?.filter(c => c.status === 'pending').length || 0;
    const totalMrrCents = clients
      ?.filter(c => c.status === 'active')
      .reduce((sum, c) => sum + (c.mrr_cents || 0), 0) || 0;

    // Founding spots: 5 total - (active + pending)
    const foundingSpotsLeft = Math.max(0, 5 - activeClients - pendingClients);

    // Build alerts (clients needing attention)
    const alerts: Array<{
      clientId: string;
      businessName: string;
      type: 'payment_failed' | 'stale_onboarding';
      message: string;
      daysAgo: number;
    }> = [];

    // Check for stale pending clients (pending for > 7 days)
    const now = new Date();
    clients?.forEach(client => {
      if (client.status === 'pending') {
        const createdAt = new Date(client.created_at);
        const daysAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo > 7) {
          alerts.push({
            clientId: client.client_id,
            businessName: client.business_name,
            type: 'stale_onboarding',
            message: `Pending for ${daysAgo} days`,
            daysAgo,
          });
        }
      }
    });

    return NextResponse.json({
      mrr: totalMrrCents / 100,
      activeClients,
      pendingClients,
      foundingSpotsLeft,
      alerts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
