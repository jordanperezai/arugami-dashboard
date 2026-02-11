import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/utils/supabase';

/**
 * Dev-only endpoint to create a test user and link them to Cubita
 *
 * POST /api/dev/create-test-user
 * Body: { email: string, password: string, fullName?: string }
 */
export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const supabase = getSupabaseServiceClient();

  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for dev
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Get Cubita's client_id
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('client_id')
      .limit(1)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Failed to find Cubita client', details: clientError?.message },
        { status: 500 }
      );
    }

    const clientId = clientData.client_id;

    // Link user to Cubita in client_users
    const { error: linkError } = await supabase
      .from('client_users')
      .insert({
        user_id: userId,
        client_id: clientId,
        email,
        full_name: fullName || null,
        role: 'owner',
        status: 'active',
      });

    if (linkError) {
      return NextResponse.json(
        { error: 'Failed to link user to client', details: linkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created and linked to Cubita',
      data: {
        user_id: userId,
        email,
        client_id: clientId,
        credentials: {
          email,
          password: '***hidden***',
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
