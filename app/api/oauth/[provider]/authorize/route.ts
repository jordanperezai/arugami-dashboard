import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl, OAuthProvider } from '../../../../../lib/oauth-config';
import { createOAuthState, normalizeReturnTo } from '../../../../../lib/oauthState';
import { randomUUID } from 'crypto';

/**
 * GET /api/oauth/[provider]/authorize
 * 
 * Redirects user to the OAuth provider's authorization page.
 * 
 * Query params:
 * - returnTo: Where to redirect after OAuth completes (default: /onboarding)
 * - clientId: The arugami client ID (for multi-tenant)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider as OAuthProvider;
  const searchParams = request.nextUrl.searchParams;
  
  const returnTo = normalizeReturnTo(searchParams.get('returnTo'));
  const clientId = searchParams.get('clientId') || 'unknown';
  
  // Build redirect URI (where provider sends user back)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const redirectUri = `${baseUrl}/api/oauth/${provider}/callback`;
  
  const nonce = randomUUID();
  let state: string;
  try {
    state = createOAuthState({
      returnTo,
      clientId,
      provider,
      timestamp: Date.now(),
      nonce,
    });
  } catch (error) {
    console.error('OAuth state signing failed:', error);
    return NextResponse.redirect(
      new URL(`${returnTo}?error=oauth_state_unconfigured&provider=${provider}`, baseUrl)
    );
  }
  
  // Generate the authorization URL
  const authUrl = generateAuthUrl(provider, redirectUri, state);
  
  if (!authUrl) {
    // Provider not configured — show friendly error
    return NextResponse.redirect(
      new URL(`${returnTo}?error=provider_not_configured&provider=${provider}`, baseUrl)
    );
  }
  
  // Redirect to provider's OAuth page
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('oauth_state_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });
  return response;
}
