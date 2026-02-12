export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { approveTask } from '@/lib/kernel';

const UUID_V4_OR_V5_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST /api/kernel/tasks/[id]/approve
 * Approves a task that is waiting for owner approval.
 * Resets the task to pending with retry_count=0 and emits an owner_approval receipt.
 *
 * Does NOT re-process the task inline — the approval-aware worker runtime
 * is a Phase 4B concern. The task stays in pending.
 *
 * Body (optional):
 *   - reason: string (why the task was approved)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      console.error('[Kernel Task Approve API] client_users lookup failed:', clientUsersError.message);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const clientId = clientUsers?.[0]?.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 });
    }

    // Get task ID from route params
    const { id: taskId } = await params;
    if (!taskId || taskId.trim().length === 0) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    if (!UUID_V4_OR_V5_REGEX.test(taskId.trim())) {
      return NextResponse.json({ error: 'Task ID must be a valid UUID' }, { status: 400 });
    }

    // Parse optional body
    let reason: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        const parsed = body as Record<string, unknown>;
        reason = typeof parsed.reason === 'string' ? parsed.reason : undefined;
      }
    } catch {
      // No body or invalid JSON — that's fine, reason is optional
    }

    // Actor is the authenticated user's email or ID
    const actor = `user:${session.user.email ?? session.user.id}`;

    const task = await approveTask(taskId, clientId, actor, reason);

    return NextResponse.json({ task, approved: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Task Approve API]', message);

    // Return 404 for "not found" errors, 400 for state errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (message.includes('Cannot approve task')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
