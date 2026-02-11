/**
 * QR Code Generation Utility
 *
 * Generates QR codes as data URLs for display and download.
 * QR codes point to the tracking redirect endpoint (/api/qr/[code]/r).
 */

import QRCode from 'qrcode';

const DEFAULT_QR_OPTIONS: QRCode.QRCodeToDataURLOptions = {
  width: 512,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
  errorCorrectionLevel: 'M',
};

function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:3001';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function getDefaultBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
}

/**
 * Generate the tracking URL for a QR code
 */
export function getQRTrackingUrl(shortCode: string, baseUrl?: string): string {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl || getDefaultBaseUrl());
  return `${resolvedBaseUrl}/api/qr/${shortCode}/r`;
}

/**
 * Generate a QR code as a data URL (base64 PNG)
 *
 * @param shortCode - The unique short code for this QR
 * @param baseUrl - Optional base URL override for the tracking endpoint origin
 * @param options - Optional QR code styling options
 * @returns Data URL string (data:image/png;base64,...)
 */
export async function generateQRDataUrl(
  shortCode: string,
  baseUrl?: string,
  options?: Partial<QRCode.QRCodeToDataURLOptions>
): Promise<string> {
  const trackingUrl = getQRTrackingUrl(shortCode, baseUrl);

  return QRCode.toDataURL(trackingUrl, {
    ...DEFAULT_QR_OPTIONS,
    ...options,
  });
}

/**
 * Generate a QR code as a buffer (for server-side image generation)
 *
 * @param shortCode - The unique short code for this QR
 * @param baseUrl - Optional base URL override for the tracking endpoint origin
 * @param options - Optional QR code styling options
 * @returns Buffer containing PNG image data
 */
export async function generateQRBuffer(
  shortCode: string,
  baseUrl?: string,
  options?: Partial<QRCode.QRCodeToBufferOptions>
): Promise<Buffer> {
  const trackingUrl = getQRTrackingUrl(shortCode, baseUrl);

  return QRCode.toBuffer(trackingUrl, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
    type: 'png',
    ...options,
  });
}

/**
 * Generate a unique short code for a QR code
 * Format: 8 alphanumeric characters (collision-resistant)
 */
export function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate a short code format
 */
export function isValidShortCode(code: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(code);
}
