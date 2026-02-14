import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@zordon/database';
import { verifyWelcomeToken } from '@/lib/welcome-token';

/**
 * Verify a welcome token and return client information
 *
 * GET /api/welcome/verify?token=xxx
 *
 * Success: { isValid: true, clientId: "xxx", businessName: "Cubita Cafe" }
 * Error: { isValid: false, error: "Invalid or expired token" }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { isValid: false, error: 'No token provided' },
      { status: 400 }
    );
  }

  try {
    // Verify the token and extract payload
    const { clientId, businessName: tokenBusinessName } = await verifyWelcomeToken(token);

    // Look up the client in the database
    const supabase = getSupabaseServiceClient();
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('client_id, business_name, status')
      .eq('client_id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { isValid: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check if client is in a valid status for onboarding
    if (client.status === 'churned' || client.status === 'suspended') {
      return NextResponse.json(
        { isValid: false, error: 'This account is no longer active' },
        { status: 403 }
      );
    }

    // Check if a user already exists for this client (prevent duplicate signups)
    const { data: existingUser } = await supabase
      .from('client_users')
      .select('user_id')
      .eq('client_id', clientId)
      .eq('role', 'owner')
      .single();

    if (existingUser) {
      return NextResponse.json({
        isValid: true,
        alreadyOnboarded: true,
        clientId: client.client_id,
        businessName: client.business_name || tokenBusinessName || 'Your Business',
      });
    }

    return NextResponse.json({
      isValid: true,
      clientId: client.client_id,
      businessName: client.business_name || tokenBusinessName || 'Your Business',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid or expired link';
    return NextResponse.json(
      { isValid: false, error: message },
      { status: 400 }
    );
  }
}
