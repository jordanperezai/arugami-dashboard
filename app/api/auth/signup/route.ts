import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/utils/supabase';

/**
 * Create a new user account and link them to a client
 *
 * POST /api/auth/signup
 * Body: { email: string, password: string, clientId: string, fullName?: string, phone?: string }
 */
export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();

  try {
    const { email, password, clientId, fullName, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Verify the client exists
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('client_id, business_name')
      .eq('client_id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found', details: clientError?.message },
        { status: 404 }
      );
    }

    // Create user in Supabase Auth (auto-confirm for onboarded clients)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (authError) {
      // Handle duplicate email
      if (authError.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create account', details: authError.message },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Link user to client
    const { error: linkError } = await supabase
      .from('client_users')
      .insert({
        user_id: userId,
        client_id: clientId,
        email,
        phone: phone || null,
        full_name: fullName || null,
        role: 'owner',
        status: 'active',
      });

    if (linkError) {
      // Rollback: delete the auth user if linking fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to link user to client', details: linkError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        userId,
        email,
        clientId,
        businessName: clientData.business_name,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
