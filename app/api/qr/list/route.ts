export const dynamic = 'force-dynamic';

/**
 * GET /api/qr/list
 *
 * List all QR codes for the authenticated user's client.
 * Includes scan counts and data URLs for display.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { generateQRDataUrl } from '../../../../lib/qr';

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

export async function GET(request: Request) {
  try {
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

    // Fetch all QR codes for this client
    const { data: qrCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[QR List] Fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch QR codes' },
        { status: 500 }
      );
    }

    // Generate data URLs for each QR code
    const qrCodesWithDataUrls = await Promise.all(
      (qrCodes || []).map(async (qr) => ({
        id: qr.id,
        shortCode: qr.short_code,
        label: qr.label,
        destinationUrl: qr.destination_url,
        funnelType: qr.funnel_type,
        isActive: qr.is_active,
        scanCount: qr.scan_count,
        createdAt: qr.created_at,
        dataUrl: await generateQRDataUrl(qr.short_code, baseUrl),
      }))
    );

    return NextResponse.json({
      success: true,
      qrCodes: qrCodesWithDataUrls,
    });
  } catch (error) {
    console.error('[QR List] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/qr/list
 *
 * Update a QR code (toggle active status, update label, etc.)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();

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

    // Build update object (only allow certain fields)
    const updateData: Record<string, unknown> = {};
    if (typeof body.isActive === 'boolean') updateData.is_active = body.isActive;
    if (typeof body.label === 'string') updateData.label = body.label;
    if (typeof body.destinationUrl === 'string') {
      try {
        const normalized = normalizeDestinationUrlInput(body.destinationUrl);
        new URL(normalized);
        updateData.destination_url = normalized;
      } catch {
        return NextResponse.json(
          { error: 'Invalid destination URL format' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the QR code (RLS ensures user can only update their client's codes)
    const { data: qrCode, error: updateError } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', body.id)
      .eq('client_id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('[QR List PATCH] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update QR code' },
        { status: 500 }
      );
    }

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

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
      },
    });
  } catch (error) {
    console.error('[QR List PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
