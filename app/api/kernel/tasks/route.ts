import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getTasks, createTask } from '@/lib/kernel';
import type { TaskStatus } from '@/lib/kernel';

/**
 * GET /api/kernel/tasks
 * Returns kernel tasks for the authenticated user's client.
 * Supports filtering by status, task_type, and limit.
 *
 * Query params:
 *   - limit: number (default 20, max 100)
 *   - status: TaskStatus (pending, claimed, completed, failed, cancelled)
 *   - task_type: string (e.g. "ghl_event")
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
      console.error('[Kernel Tasks API GET] client_users lookup failed:', clientUsersError.message);
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

    const statusParam = searchParams.get('status') || undefined;
    const taskType = searchParams.get('task_type') || undefined;

    // Validate status if provided
    const validStatuses: TaskStatus[] = ['pending', 'claimed', 'completed', 'failed', 'cancelled'];
    if (statusParam && !validStatuses.includes(statusParam as TaskStatus)) {
      return NextResponse.json(
        { error: `Invalid "status" parameter. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const status = statusParam as TaskStatus | undefined;

    const tasks = await getTasks(clientId, { status, taskType, limit });

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Tasks API GET]', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kernel/tasks
 * Creates a new kernel task for the authenticated user's client.
 *
 * Body:
 *   - task_type: string (required, non-empty)
 *   - payload: object (optional)
 *   - priority: number (optional, default 0)
 */
export async function POST(request: Request) {
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
      console.error('[Kernel Tasks API POST] client_users lookup failed:', clientUsersError.message);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const clientId = clientUsers?.[0]?.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'No client found' }, { status: 404 });
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
      const parsed = await request.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate task_type
    const taskType = body.task_type;
    if (!taskType || typeof taskType !== 'string' || taskType.trim().length === 0) {
      return NextResponse.json(
        { error: '"task_type" is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate payload if provided
    const payload = body.payload ?? {};
    if (typeof payload !== 'object' || Array.isArray(payload) || payload === null) {
      return NextResponse.json(
        { error: '"payload" must be an object if provided' },
        { status: 400 }
      );
    }

    // Validate priority if provided
    let priority = 0;
    if (body.priority !== undefined) {
      const rawPriority = Number(body.priority);
      if (!Number.isFinite(rawPriority)) {
        return NextResponse.json(
          { error: '"priority" must be a number if provided' },
          { status: 400 }
        );
      }
      priority = Math.min(Math.max(rawPriority, 0), 10);
    }

    const task = await createTask({
      client_id: clientId,
      task_type: taskType.trim(),
      payload: payload as Record<string, unknown>,
      priority,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Kernel Tasks API POST]', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
