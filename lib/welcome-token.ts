import { SignJWT, jwtVerify, errors } from 'jose';

const SECRET_KEY = process.env.WELCOME_TOKEN_SECRET;

function getSecretKey(): Uint8Array {
  if (!SECRET_KEY) {
    throw new Error('WELCOME_TOKEN_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(SECRET_KEY);
}

export interface WelcomeTokenPayload {
  clientId: string;
  businessName?: string;
}

/**
 * Generate a welcome token for a client
 * Use this when onboarding a new client - include the token in their welcome link
 *
 * @param clientId - The client's UUID from the database
 * @param businessName - Optional business name to include in the token
 * @param expiresIn - Token expiry (default: 7 days)
 * @returns JWT token string
 */
export async function generateWelcomeToken(
  clientId: string,
  businessName?: string,
  expiresIn: string = '7d'
): Promise<string> {
  const payload: Record<string, unknown> = { clientId };
  if (businessName) {
    payload.businessName = businessName;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

/**
 * Verify a welcome token and extract the payload
 *
 * @param token - The JWT token from the URL
 * @returns The decoded payload with clientId
 * @throws Error if token is invalid or expired
 */
export async function verifyWelcomeToken(token: string): Promise<WelcomeTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (!payload.clientId || typeof payload.clientId !== 'string') {
      throw new Error('Invalid token payload: missing clientId');
    }

    return {
      clientId: payload.clientId,
      businessName: typeof payload.businessName === 'string' ? payload.businessName : undefined,
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new Error('Welcome link has expired');
    }
    if (error instanceof errors.JWTInvalid) {
      throw new Error('Invalid welcome link');
    }
    throw error;
  }
}
