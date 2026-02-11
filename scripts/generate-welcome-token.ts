/**
 * Generate a welcome token for testing
 *
 * Usage: npx tsx scripts/generate-welcome-token.ts <clientId> [businessName]
 *
 * Example: npx tsx scripts/generate-welcome-token.ts abc-123 "Cubita Cafe"
 */

import { SignJWT } from 'jose';

const SECRET_KEY = process.env.WELCOME_TOKEN_SECRET;

if (!SECRET_KEY) {
  console.error('Error: WELCOME_TOKEN_SECRET environment variable is not set');
  console.error('Add it to your .env.local file');
  process.exit(1);
}

const clientId = process.argv[2];
const businessName = process.argv[3];

if (!clientId) {
  console.error('Usage: npx tsx scripts/generate-welcome-token.ts <clientId> [businessName]');
  console.error('Example: npx tsx scripts/generate-welcome-token.ts abc-123 "Cubita Cafe"');
  process.exit(1);
}

async function generateToken() {
  const secret = new TextEncoder().encode(SECRET_KEY);

  const payload: Record<string, unknown> = { clientId };
  if (businessName) {
    payload.businessName = businessName;
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  console.log('\n✅ Welcome token generated!\n');
  console.log('Token:', token);
  console.log('\nWelcome URL:');
  console.log(`http://localhost:3001/welcome?token=${token}`);
  console.log('\nProduction URL:');
  console.log(`https://app.arugami.com/welcome?token=${token}`);
}

generateToken();
