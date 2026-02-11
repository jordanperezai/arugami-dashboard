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
 * POST /api/admin/clients/[id]/resend-welcome
 * Generates a new welcome token for the client
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

    const db = getSupabaseServiceClient();

    // Get client info
    const { data: client, error: clientError } = await db
      .from('clients')
      .select('client_id, business_name, status')
      .eq('client_id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Generate new token (7 day expiry)
    const token = await generateWelcomeToken(client.client_id, client.business_name);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.arugami.com';
    const welcomeUrl = `${baseUrl}/welcome?token=${token}`;

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return NextResponse.json({
      welcomeUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
