export const dynamic = 'force-dynamic';

/**
 * POST /api/qr/generate
 *
 * Create a new QR code for the authenticated user's client.
 * Returns the generated QR code data URL and short code.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { generateShortCode, generateQRDataUrl } from '../../../../lib/qr';
import type { FunnelType } from '../../../../lib/qr';

interface CreateQRRequest {
  label: string;
  destinationUrl: string;
  funnelType: FunnelType;
}

function normalizeDestinationUrlInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

function getBaseUrlFromRequest(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host') || url.host;
  const proto = forwardedProto || url.protocol.replace(':', '');

  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    const body: CreateQRRequest = await request.json();

    // Validate required fields
    if (!body.label || !body.destinationUrl || !body.funnelType) {
      return NextResponse.json(
        { error: 'Missing required fields: label, destinationUrl, funnelType' },
        { status: 400 }
      );
    }

    // Validate URL format
    const normalizedDestinationUrl = normalizeDestinationUrlInput(body.destinationUrl);
    try {
      new URL(normalizedDestinationUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid destination URL format' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const baseUrl = getBaseUrlFromRequest(request);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's client
    const { data: clientUsers, error: clientUserError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .limit(1);

    if (clientUserError || !clientUsers?.[0]) {
      return NextResponse.json(
        { error: 'No client found for user' },
        { status: 404 }
      );
    }

    const clientId = clientUsers[0].client_id;

    // Generate unique short code (retry if collision)
    let shortCode = generateShortCode();
    let retries = 3;

    while (retries > 0) {
      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_code', shortCode)
        .limit(1);

      if (!existing || existing.length === 0) {
        break; // Code is unique
      }

      shortCode = generateShortCode();
      retries--;
    }

    if (retries === 0) {
      return NextResponse.json(
        { error: 'Failed to generate unique short code' },
        { status: 500 }
      );
    }

    // Create QR code record
    const { data: qrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        client_id: clientId,
        short_code: shortCode,
        label: body.label,
        destination_url: normalizedDestinationUrl,
        funnel_type: body.funnelType,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[QR Generate] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create QR code' },
        { status: 500 }
      );
    }

    // Generate the QR code image as data URL
    const dataUrl = await generateQRDataUrl(shortCode, baseUrl);

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        shortCode: qrCode.short_code,
        label: qrCode.label,
        destinationUrl: qrCode.destination_url,
        funnelType: qrCode.funnel_type,
        isActive: qrCode.is_active,
        scanCount: qrCode.scan_count,
        createdAt: qrCode.created_at,
        dataUrl,
      },
    });
  } catch (error) {
    console.error('[QR Generate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
