export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getKernelMetrics } from '@/lib/kernel-data';

/**
 * GET /api/kernel/metrics
 * Returns kernel-derived metrics for the authenticated user's client.
 * Shaped as GHLMetrics for dashboard component compatibility.
 */
export async function GET() {
  try {
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve client_id from session user
    const { data: clientUsers } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', session.user.id)
      .limit(1);

    const clientId = clientUsers?.[0]?.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 });
    }

    const metrics = await getKernelMetrics(clientId);

    return NextResponse.json({ metrics });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Metrics API]', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
