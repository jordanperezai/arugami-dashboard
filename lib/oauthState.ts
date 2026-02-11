import { createHmac, timingSafeEqual } from 'crypto';

export type OAuthStatePayload = {
  returnTo: string;
  clientId: string;
  provider: string;
  timestamp: number;
  nonce: string;
};

function getStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) {
    throw new Error('Missing OAUTH_STATE_SECRET (required to sign OAuth state).');
  }
  return secret;
}

function sign(input: string): string {
  return createHmac('sha256', getStateSecret()).update(input).digest('base64url');
}

export function createOAuthState(payload: OAuthStatePayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyOAuthState(token: string): OAuthStatePayload {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    throw new Error('Invalid state format.');
  }

  const expected = sign(encodedPayload);
  const sigOk =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!sigOk) {
    throw new Error('Invalid state signature.');
  }

  const json = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  return JSON.parse(json) as OAuthStatePayload;
}

export function normalizeReturnTo(returnTo: string | null): string {
  if (!returnTo) return '/onboarding';
  if (!returnTo.startsWith('/')) return '/onboarding';
  if (returnTo.startsWith('//')) return '/onboarding';
  return returnTo;
}

