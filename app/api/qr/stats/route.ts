/**
 * GET /api/qr/stats
 *
 * Get QR code analytics for the authenticated user's client.
 * Returns aggregate stats and per-code breakdown.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
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

    // Fetch all QR codes with their scan counts
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, short_code, label, funnel_type, scan_count, is_active, created_at')
      .eq('client_id', clientId)
      .order('scan_count', { ascending: false });

    if (qrError) {
      console.error('[QR Stats] Fetch error:', qrError);
      return NextResponse.json(
        { error: 'Failed to fetch QR stats' },
        { status: 500 }
      );
    }

    // Calculate time ranges
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Fetch scan data for time-based analytics
    const qrCodeIds = (qrCodes || []).map(qr => qr.id);

    let scansLast7Days = 0;
    let scansLast30Days = 0;
    let deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0 };
    let recentScans: Array<{
      qrCodeId: string;
      qrLabel: string;
      scannedAt: string;
      deviceType: string;
    }> = [];

    if (qrCodeIds.length > 0) {
      // Get scans in last 30 days for breakdown
      const { data: scans } = await supabase
        .from('qr_scans')
        .select('qr_code_id, scanned_at, device_type')
        .in('qr_code_id', qrCodeIds)
        .gte('scanned_at', thirtyDaysAgo.toISOString())
        .order('scanned_at', { ascending: false });

      if (scans) {
        scans.forEach(scan => {
          const scanDate = new Date(scan.scanned_at);

          // 30-day count
          scansLast30Days++;

          // 7-day count
          if (scanDate >= sevenDaysAgo) {
            scansLast7Days++;
          }

          // Device breakdown
          const device = scan.device_type as 'mobile' | 'tablet' | 'desktop';
          if (device && deviceBreakdown[device] !== undefined) {
            deviceBreakdown[device]++;
          }
        });

        // Get recent scans with labels
        const qrLabelMap = new Map((qrCodes || []).map(qr => [qr.id, qr.label]));
        recentScans = scans.slice(0, 10).map(scan => ({
          qrCodeId: scan.qr_code_id,
          qrLabel: qrLabelMap.get(scan.qr_code_id) || 'Unknown',
          scannedAt: scan.scanned_at,
          deviceType: scan.device_type || 'unknown',
        }));
      }
    }

    // Calculate totals
    const totalScans = (qrCodes || []).reduce((sum, qr) => sum + qr.scan_count, 0);
    const activeQRCodes = (qrCodes || []).filter(qr => qr.is_active).length;
    const totalQRCodes = (qrCodes || []).length;

    // Per-code stats
    const perCodeStats = (qrCodes || []).map(qr => ({
      id: qr.id,
      shortCode: qr.short_code,
      label: qr.label,
      funnelType: qr.funnel_type,
      scanCount: qr.scan_count,
      isActive: qr.is_active,
      createdAt: qr.created_at,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalScans,
        scansLast7Days,
        scansLast30Days,
        totalQRCodes,
        activeQRCodes,
        deviceBreakdown,
        perCodeStats,
        recentScans,
      },
    });
  } catch (error) {
    console.error('[QR Stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
