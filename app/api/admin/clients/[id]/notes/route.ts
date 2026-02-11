import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/clients/[id]/notes
 * Returns notes for a client
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: clientId } = await params;

    // Verify admin access
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

    const db = getSupabaseServiceClient();

    // client_notes table added via migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notes, error } = await (db as any)
      .from('client_notes')
      .select('id, content, created_at, created_by')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notes', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/clients/[id]/notes
 * Adds a note to a client
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: clientId } = await params;

    // Verify admin access
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

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const db = getSupabaseServiceClient();

    // Verify client exists
    const { data: client } = await db
      .from('clients')
      .select('client_id')
      .eq('client_id', clientId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create note (client_notes table added via migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: note, error: createError } = await (db as any)
      .from('client_notes')
      .insert({
        client_id: clientId,
        content: content.trim(),
        created_by: session.user.email || 'admin',
      })
      .select('id, content, created_at, created_by')
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create note', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ note });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
