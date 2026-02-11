import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { isAdmin, generateSlug } from '@/lib/admin';
import { generateWelcomeToken } from '@/lib/welcome-token';

/**
 * GET /api/admin/clients
 * Returns all clients for admin view
 */
export async function GET() {
  try {
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

    // Get clients with owner info
    const { data: clients, error: clientsError } = await db
      .from('clients')
      .select(`
        client_id,
        business_name,
        slug,
        status,
        mrr_cents,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (clientsError) {
      return NextResponse.json(
        { error: 'Failed to fetch clients', details: clientsError.message },
        { status: 500 }
      );
    }

    // Get owner status for each client
    const clientIds = clients?.map(c => c.client_id) || [];
    const { data: clientUsers } = await db
      .from('client_users')
      .select('client_id, role')
      .in('client_id', clientIds)
      .eq('role', 'owner');

    const clientsWithOwner = clients?.map(client => ({
      ...client,
      has_owner: clientUsers?.some(u => u.client_id === client.client_id) || false,
    }));

    // Sort: pending first, then by created_at descending
    const sortedClients = clientsWithOwner?.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ clients: sortedClients });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/clients
 * Creates a new client and generates welcome token
 */
export async function POST(request: Request) {
  try {
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
    const { businessName, slug: providedSlug } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    const slug = providedSlug || generateSlug(businessName);

    const db = getSupabaseServiceClient();

    // Check if slug already exists
    const { data: existing } = await db
      .from('clients')
      .select('client_id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A client with this slug already exists' },
        { status: 409 }
      );
    }

    // Create the client with default onboarding checklist
    // Note: onboarding_checklist is a JSONB column added via migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: client, error: createError } = await (db
      .from('clients') as any)
      .insert({
        business_name: businessName,
        slug,
        status: 'pending',
        mrr_cents: 0,
        ghl_location_id: '', // Required field, will be set during GHL setup
        onboarding_checklist: {
          ghl_setup: false,
          website_live: false,
          first_automation: false,
          payment_collected: false,
        },
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create client', details: createError.message },
        { status: 500 }
      );
    }

    // Generate welcome token
    const token = await generateWelcomeToken(client.client_id, businessName);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.arugami.com';
    const welcomeUrl = `${baseUrl}/welcome?token=${token}`;

    return NextResponse.json({
      client: {
        client_id: client.client_id,
        business_name: client.business_name,
        slug: client.slug,
        status: client.status,
      },
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
