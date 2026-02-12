export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getKernelActivity } from '@/lib/kernel-data';

/**
 * GET /api/kernel/activity
 * Returns recent kernel activity for the authenticated user's client.
 * Activity items are shaped as GHLActivityItem[] for dashboard compatibility.
 */
export async function GET(request: Request) {
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

    // Parse limit from query params
    const { searchParams } = new URL(request.url);
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;

    const activity = await getKernelActivity(clientId, limit);

    return NextResponse.json({ activity });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Activity API]', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
