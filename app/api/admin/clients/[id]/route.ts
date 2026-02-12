export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';
import { generateWelcomeToken } from '@/lib/welcome-token';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/clients/[id]
 * Returns client details with users, checklist, and notes
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

    // Get client details
    const { data: client, error: clientError } = await db
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get users linked to this client
    const { data: users } = await db
      .from('client_users')
      .select('email, full_name, role, status')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    // Get notes for this client (client_notes table added via migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: notes } = await (db as any)
      .from('client_notes')
      .select('id, content, created_at, created_by')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    // Generate welcome URL for pending clients
    let welcomeUrl: string | null = null;
    if (client.status === 'pending') {
      const token = await generateWelcomeToken(client.client_id, client.business_name);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.arugami.com';
      welcomeUrl = `${baseUrl}/welcome?token=${token}`;
    }

    // Cast client to include onboarding_checklist (added via migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientWithChecklist = client as any;

    return NextResponse.json({
      client: {
        client_id: client.client_id,
        business_name: client.business_name,
        slug: client.slug,
        status: client.status,
        mrr_cents: client.mrr_cents,
        created_at: client.created_at,
        onboarding_checklist: clientWithChecklist.onboarding_checklist || {
          ghl_setup: false,
          website_live: false,
          first_automation: false,
          payment_collected: false,
        },
      },
      users: users || [],
      notes: notes || [],
      welcomeUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/clients/[id]
 * Updates client checklist or other fields
 */
export async function PATCH(request: Request, { params }: RouteParams) {
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
    const { onboarding_checklist, status, mrr_cents } = body;

    const db = getSupabaseServiceClient();

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (onboarding_checklist) {
      // Get current checklist and merge (onboarding_checklist added via migration)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: current } = await (db as any)
        .from('clients')
        .select('onboarding_checklist')
        .eq('client_id', clientId)
        .single();

      updates.onboarding_checklist = {
        ...(current?.onboarding_checklist || {}),
        ...onboarding_checklist,
      };
    }

    if (status) {
      updates.status = status;
    }

    if (typeof mrr_cents === 'number') {
      updates.mrr_cents = mrr_cents;
    }

    // Update client (includes onboarding_checklist from migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (db as any)
      .from('clients')
      .update(updates)
      .eq('client_id', clientId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update client', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
