import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getReceipts } from '@/lib/kernel';

/**
 * GET /api/kernel/receipts
 * Returns kernel receipts for the authenticated user's client.
 * Supports filtering by action, task_id, since (ISO date), and limit.
 *
 * Query params:
 *   - limit: number (default 20, max 100)
 *   - action: string (e.g. "ghl_webhook", "task_completed")
 *   - task_id: string (filter by task)
 *   - since: ISO 8601 string (only receipts after this timestamp)
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
    const { data: clientUsers, error: clientUsersError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', session.user.id)
      .limit(1);

    if (clientUsersError) {
      console.error('[Kernel Receipts API] client_users lookup failed:', clientUsersError.message);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const clientId = clientUsers?.[0]?.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);

    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;

    const action = searchParams.get('action') || undefined;
    const taskId = searchParams.get('task_id') || undefined;
    const since = searchParams.get('since') || undefined;

    // Validate since is a valid ISO date if provided
    if (since && isNaN(Date.parse(since))) {
      return NextResponse.json(
        { error: 'Invalid "since" parameter. Must be an ISO 8601 date string.' },
        { status: 400 }
      );
    }

    const receipts = await getReceipts(clientId, { limit, action, taskId, since });

    return NextResponse.json({ receipts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Receipts API]', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
