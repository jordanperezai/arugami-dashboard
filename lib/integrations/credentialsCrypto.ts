import { createDecipheriv, createCipheriv, randomBytes } from 'crypto';

type EncryptedPayloadV1 = {
  v: 1;
  alg: 'aes-256-gcm';
  iv: string; // base64
  tag: string; // base64
  data: string; // base64
};

function getEncryptionKey(): Buffer {
  const raw = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('Missing INTEGRATIONS_ENCRYPTION_KEY (expected 32-byte base64 key).');
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('Invalid INTEGRATIONS_ENCRYPTION_KEY (expected 32-byte base64 key).');
  }

  return key;
}

export function encryptIntegrationCredentials(value: unknown): EncryptedPayloadV1 {
  const key = getEncryptionKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64'),
  };
}

export function decryptIntegrationCredentials(payload: EncryptedPayloadV1): unknown {
  const key = getEncryptionKey();

  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const data = Buffer.from(payload.data, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);

  return JSON.parse(plaintext.toString('utf8'));
}

