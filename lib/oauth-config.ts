/**
 * OAuth Configuration for Third-Party Integrations
 * 
 * Each provider needs:
 * - clientId: From provider's developer dashboard
 * - clientSecret: From provider's developer dashboard (keep in env vars)
 * - authorizeUrl: Where to redirect user to authorize
 * - tokenUrl: Where to exchange code for token
 * - scopes: What permissions we need
 */

export type OAuthProvider = 'clover' | 'toast' | 'square' | 'mailchimp' | 'google' | 'facebook';

export interface OAuthConfig {
  provider: OAuthProvider;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  // These come from env vars
  clientId: string;
  clientSecret: string;
}

// Base URLs for each provider
const PROVIDER_URLS = {
  clover: {
    // Clover sandbox vs production
    sandbox: {
      authorize: 'https://sandbox.dev.clover.com/oauth/authorize',
      token: 'https://sandbox.dev.clover.com/oauth/token',
    },
    production: {
      authorize: 'https://www.clover.com/oauth/authorize',
      token: 'https://www.clover.com/oauth/token',
    },
  },
  toast: {
    authorize: 'https://ws-api.toasttab.com/authentication/v1/authentication/oauth2/authorize',
    token: 'https://ws-api.toasttab.com/authentication/v1/authentication/oauth2/token',
  },
  square: {
    authorize: 'https://connect.squareup.com/oauth2/authorize',
    token: 'https://connect.squareup.com/oauth2/token',
  },
  mailchimp: {
    authorize: 'https://login.mailchimp.com/oauth2/authorize',
    token: 'https://login.mailchimp.com/oauth2/token',
  },
  google: {
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
  },
  facebook: {
    authorize: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
};

// Scopes needed for each provider
const PROVIDER_SCOPES: Record<OAuthProvider, string[]> = {
  clover: ['MERCHANT_R', 'ORDERS_R', 'PAYMENTS_R', 'CUSTOMERS_R'],
  toast: ['orders.read', 'restaurants.read', 'labor.read'],
  square: ['MERCHANT_PROFILE_READ', 'ORDERS_READ', 'PAYMENTS_READ', 'CUSTOMERS_READ'],
  mailchimp: ['lists', 'campaigns'],
  google: ['https://www.googleapis.com/auth/business.manage'],
  facebook: ['email', 'public_profile'],
};

/**
 * Get OAuth config for a provider
 */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig | null {
  const isProduction = process.env.NODE_ENV === 'production';
  
  switch (provider) {
    case 'clover': {
      const urls = isProduction ? PROVIDER_URLS.clover.production : PROVIDER_URLS.clover.sandbox;
      return {
        provider: 'clover',
        name: 'Clover',
        authorizeUrl: urls.authorize,
        tokenUrl: urls.token,
        scopes: PROVIDER_SCOPES.clover,
        clientId: process.env.CLOVER_CLIENT_ID || '',
        clientSecret: process.env.CLOVER_CLIENT_SECRET || '',
      };
    }
    case 'toast':
      return {
        provider: 'toast',
        name: 'Toast',
        authorizeUrl: PROVIDER_URLS.toast.authorize,
        tokenUrl: PROVIDER_URLS.toast.token,
        scopes: PROVIDER_SCOPES.toast,
        clientId: process.env.TOAST_CLIENT_ID || '',
        clientSecret: process.env.TOAST_CLIENT_SECRET || '',
      };
    case 'square':
      return {
        provider: 'square',
        name: 'Square',
        authorizeUrl: PROVIDER_URLS.square.authorize,
        tokenUrl: PROVIDER_URLS.square.token,
        scopes: PROVIDER_SCOPES.square,
        clientId: process.env.SQUARE_CLIENT_ID || '',
        clientSecret: process.env.SQUARE_CLIENT_SECRET || '',
      };
    case 'mailchimp':
      return {
        provider: 'mailchimp',
        name: 'Mailchimp',
        authorizeUrl: PROVIDER_URLS.mailchimp.authorize,
        tokenUrl: PROVIDER_URLS.mailchimp.token,
        scopes: PROVIDER_SCOPES.mailchimp,
        clientId: process.env.MAILCHIMP_CLIENT_ID || '',
        clientSecret: process.env.MAILCHIMP_CLIENT_SECRET || '',
      };
    case 'google':
      return {
        provider: 'google',
        name: 'Google Business',
        authorizeUrl: PROVIDER_URLS.google.authorize,
        tokenUrl: PROVIDER_URLS.google.token,
        scopes: PROVIDER_SCOPES.google,
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      };
    case 'facebook':
      return {
        provider: 'facebook',
        name: 'Facebook & Instagram',
        authorizeUrl: PROVIDER_URLS.facebook.authorize,
        tokenUrl: PROVIDER_URLS.facebook.token,
        scopes: PROVIDER_SCOPES.facebook,
        clientId: process.env.FACEBOOK_CLIENT_ID || '',
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      };
    default:
      return null;
  }
}

/**
 * Generate the OAuth authorization URL
 */
export function generateAuthUrl(
  provider: OAuthProvider,
  redirectUri: string,
  state: string
): string | null {
  const config = getOAuthConfig(provider);
  if (!config || !config.clientId) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: state, // For CSRF protection + passing data back
  });

  // Provider-specific params
  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${config.authorizeUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  merchant_id?: string; // Clover-specific
} | null> {
  const config = getOAuthConfig(provider);
  if (!config || !config.clientId || !config.clientSecret) return null;

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(`OAuth token exchange failed for ${provider}:`, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`OAuth token exchange error for ${provider}:`, error);
    return null;
  }
}

/**
 * Check which providers are configured (have credentials)
 */
export function getConfiguredProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = ['clover', 'toast', 'square', 'mailchimp', 'google', 'facebook'];
  return providers.filter(p => {
    const config = getOAuthConfig(p);
    return config && config.clientId && config.clientSecret;
  });
}

/**
 * Tools that use OAuth (vs Browser-Use)
 */
export const OAUTH_TOOLS = ['clover', 'toast', 'square', 'mailchimp', 'doordash', 'vagaro', 'fresha', 'schedulicity', 'stripe', 'quickbooks', 'calendly'];

/**
 * Tools that require Browser-Use skills (social media)
 */
export const BROWSER_USE_TOOLS = ['instagram', 'google', 'facebook'];

/**
 * Check if a tool uses OAuth
 */
export function isOAuthTool(toolId: string): boolean {
  return OAUTH_TOOLS.includes(toolId);
}
