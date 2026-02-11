import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, OAuthProvider } from '../../../../../lib/oauth-config';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { normalizeReturnTo, verifyOAuthState } from '../../../../../lib/oauthState';
import { encryptIntegrationCredentials } from '../../../../../lib/integrations/credentialsCrypto';
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * Get a friendly display name for an integration
 */
function getDisplayName(provider: string, merchantId?: string): string {
  const names: Record<string, string> = {
    clover: 'Clover POS',
    toast: 'Toast POS',
    square: 'Square POS',
    mailchimp: 'Mailchimp',
    google: 'Google Business Profile',
    facebook: 'Facebook & Instagram',
  };
  
  const baseName = names[provider] || provider;
  
  // For Clover, include merchant ID for clarity
  if (provider === 'clover' && merchantId) {
    return `${baseName}`;
  }
  
  return baseName;
}

/**
 * GET /api/oauth/[provider]/callback
 * 
 * Handles the OAuth callback from the provider.
 * Exchanges code for token, stores it, and redirects back to app.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as OAuthProvider;
  const searchParams = request.nextUrl.searchParams;
  
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const error = searchParams.get('error');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const nonceCookie = request.cookies.get('oauth_state_nonce')?.value ?? null;

  const withClearedNonce = (response: NextResponse) => {
    response.cookies.set('oauth_state_nonce', '', { path: '/', maxAge: 0 });
    return response;
  };
  
  // Handle OAuth errors
  if (error) {
    console.error(`OAuth error for ${provider}:`, error);
    return withClearedNonce(NextResponse.redirect(
      new URL(`/onboarding?error=oauth_denied&provider=${provider}`, baseUrl)
    ));
  }
  
  // Validate required params
  if (!code || !stateParam) {
    return withClearedNonce(NextResponse.redirect(
      new URL(`/onboarding?error=missing_params&provider=${provider}`, baseUrl)
    ));
  }
  
  // Decode state
  let state: {
    returnTo: string;
    clientId: string;
    provider: string;
    timestamp: number;
    nonce: string;
  };
  
  try {
    state = verifyOAuthState(stateParam);
  } catch {
    return withClearedNonce(NextResponse.redirect(
      new URL(`/onboarding?error=invalid_state&provider=${provider}`, baseUrl)
    ));
  }

  const returnTo = normalizeReturnTo(state.returnTo);
  if (state.provider !== provider) {
    return withClearedNonce(NextResponse.redirect(
      new URL(`${returnTo}?error=state_provider_mismatch&provider=${provider}`, baseUrl)
    ));
  }

  if (!nonceCookie || state.nonce !== nonceCookie) {
    return withClearedNonce(NextResponse.redirect(
      new URL(`${returnTo}?error=invalid_state_nonce&provider=${provider}`, baseUrl)
    ));
  }
  
  // Check timestamp (prevent replay attacks — 10 minute window)
  if (Date.now() - state.timestamp > 10 * 60 * 1000) {
    return withClearedNonce(NextResponse.redirect(
      new URL(`${returnTo}?error=expired_state&provider=${provider}`, baseUrl)
    ));
  }
  
  // Exchange code for token
  const redirectUri = `${baseUrl}/api/oauth/${provider}/callback`;
  const tokenData = await exchangeCodeForToken(provider, code, redirectUri);
  
  if (!tokenData) {
    return withClearedNonce(NextResponse.redirect(
      new URL(`${returnTo}?error=token_exchange_failed&provider=${provider}`, baseUrl)
    ));
  }
  
  // Store token in database
  const supabase = getSupabaseServiceClient();
  
  // Determine client_id
  // If 'onboarding' or 'unknown', get the first client (for demo purposes)
  let clientId = state.clientId;
  
  if (clientId === 'onboarding' || clientId === 'unknown') {
    // For demo: get the first client (Cubita)
    const { data: clients } = await supabase
      .from('clients')
      .select('client_id')
      .limit(1);
    
    if (clients && clients.length > 0) {
      clientId = clients[0].client_id;
    }
  }
  
  // Prepare credentials for secure storage
  const credentials = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_in: tokenData.expires_in || null,
    merchant_id: tokenData.merchant_id || null, // Clover-specific
    connected_at: new Date().toISOString(),
  };

  let encryptedCredentials: Json;
  try {
    encryptedCredentials = encryptIntegrationCredentials(credentials) as unknown as Json;
  } catch (encryptionError) {
    console.error('Failed to encrypt OAuth credentials:', encryptionError);
    return withClearedNonce(NextResponse.redirect(
      new URL(`${returnTo}?error=credentials_encrypt_failed&provider=${provider}`, baseUrl)
    ));
  }
  
  // Upsert the integration (update if exists, insert if not)
  const { error: upsertError } = await supabase
    .from('integrations')
    .upsert({
      client_id: clientId,
      integration_type: provider,
      display_name: getDisplayName(provider, tokenData.merchant_id),
      credentials_encrypted: encryptedCredentials,
      status: 'active',
      last_health_check: new Date().toISOString(),
      health_check_message: 'Connected successfully',
    }, {
      onConflict: 'client_id,integration_type',
    });
  
  if (upsertError) {
    console.error(`Failed to store ${provider} integration:`, upsertError);
    // Continue anyway — the connection worked, just storage failed
  }
  
  console.log(`✅ OAuth successful for ${provider}:`, {
    clientId,
    hasAccessToken: !!tokenData.access_token,
    hasRefreshToken: !!tokenData.refresh_token,
    merchantId: tokenData.merchant_id,
    stored: !upsertError,
  });
  
  // Redirect back to onboarding with success
  // Include connected tool in URL so onboarding can update state
  const successUrl = new URL(returnTo, baseUrl);
  successUrl.searchParams.set('connected', provider);
  
  // For Clover, also pass merchant_id
  if (tokenData.merchant_id) {
    successUrl.searchParams.set('merchant_id', tokenData.merchant_id);
  }
  
  return withClearedNonce(NextResponse.redirect(successUrl));
}
