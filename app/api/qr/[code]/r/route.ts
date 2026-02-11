/**
 * GET /api/qr/[code]/r
 *
 * PUBLIC endpoint - handles QR code scans.
 * 1. Looks up QR code by short_code
 * 2. Records scan in qr_scans table
 * 3. Increments scan_count on qr_code
 * 4. If funnel triggers GHL: creates contact + opportunity
 * 5. Redirects to destination_url
 *
 * This endpoint is unauthenticated - anyone scanning the QR can hit it.
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSupabaseServiceClient } from '@/utils/supabase';
import { shouldTriggerGHL, getDefaultOpportunityName, type FunnelType } from '../../../../../lib/qr';
import { getGHLClient } from '../../../../../lib/ghl';

interface RouteParams {
  params: {
    code: string;
  };
}

function normalizeDestinationUrl(
  destinationUrl: string,
  clientWebsite: string | null,
  requestUrl: string
): string {
  const trimmed = (destinationUrl || '').trim();
  if (!trimmed) return new URL('/', requestUrl).toString();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  if (trimmed.startsWith('/')) {
    const website = (clientWebsite || '').trim();
    if (website) {
      const normalizedWebsite = website.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return new URL(trimmed, `https://${normalizedWebsite}`).toString();
    }
    return new URL(trimmed, requestUrl).toString();
  }

  return `https://${trimmed}`;
}

/**
 * Detect device type from user agent
 */
function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|opera mobi/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Get approximate location from IP (placeholder - would use MaxMind or similar in production)
 */
async function getApproximateLocation(ip: string): Promise<{ city?: string; region?: string; country?: string } | null> {
  // In production, this would call a geolocation API
  // For now, return null to indicate we don't have location data
  // TODO: Integrate MaxMind GeoIP2 or similar service
  return null;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { code } = params;

  try {
    // Use service client to bypass RLS (this is a public endpoint)
    const supabase = getSupabaseServiceClient();

    // Look up QR code by short_code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*, clients(*)')
      .eq('short_code', code)
      .single();

    if (qrError || !qrCode) {
      console.error('[QR Redirect] QR code not found:', code);
      // Redirect to a generic 404 page or the main site
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if QR code is active
    if (!qrCode.is_active) {
      console.log('[QR Redirect] QR code is inactive:', code);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Get request metadata
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || null;
    const deviceType = getDeviceType(userAgent);

    // Get approximate location (async, but don't block redirect)
    const locationPromise = ip ? getApproximateLocation(ip) : Promise.resolve(null);

    // Start GHL operations in parallel if needed
    let ghlContactId: string | null = null;
    let ghlOpportunityId: string | null = null;

    const funnelType = qrCode.funnel_type as FunnelType;
    const client = qrCode.clients;
    const clientWebsite =
      typeof (client as any)?.website === 'string' ? (client as any).website : null;

    if (shouldTriggerGHL(funnelType) && client) {
      const ghlClient = getGHLClient(client);

      if (ghlClient) {
        try {
          // Get funnel pipeline mapping for this client
          const { data: mapping } = await supabase
            .from('funnel_pipeline_mapping')
            .select('ghl_pipeline_id, ghl_stage_id')
            .eq('client_id', client.client_id)
            .eq('funnel_type', funnelType)
            .single();

          if (mapping) {
            // Create a new contact (anonymous scan)
            const contactResult = await ghlClient.createContact({
              source: `QR Scan - ${qrCode.label}`,
              tags: ['qr-scan', funnelType],
            });

            if (contactResult) {
              ghlContactId = contactResult.contactId;

              // Create opportunity in the pipeline
              const oppResult = await ghlClient.createOpportunity({
                contactId: ghlContactId,
                pipelineId: mapping.ghl_pipeline_id,
                pipelineStageId: mapping.ghl_stage_id,
                name: getDefaultOpportunityName(funnelType, qrCode.label),
                source: 'QR Code Scan',
              });

              if (oppResult) {
                ghlOpportunityId = oppResult.opportunityId;
              }
            }
          } else {
            console.log('[QR Redirect] No pipeline mapping for funnel type:', funnelType);
          }
        } catch (ghlError) {
          // Log but don't block the redirect
          console.error('[QR Redirect] GHL error:', ghlError);
        }
      }
    }

    // Wait for location (don't block if it fails)
    const location = await locationPromise.catch(() => null);

    // Record the scan (fire and forget - don't block redirect)
    supabase
      .from('qr_scans')
      .insert({
        qr_code_id: qrCode.id,
        device_type: deviceType,
        user_agent: userAgent.substring(0, 500), // Truncate long UAs
        ip_address: ip,
        approximate_location: location,
        ghl_contact_id: ghlContactId,
        ghl_opportunity_id: ghlOpportunityId,
      })
      .then(({ error }) => {
        if (error) console.error('[QR Redirect] Failed to record scan:', error);
      });

    // Increment scan count (fire and forget)
    supabase
      .from('qr_codes')
      .update({ scan_count: qrCode.scan_count + 1 })
      .eq('id', qrCode.id)
      .then(({ error }) => {
        if (error) console.error('[QR Redirect] Failed to update scan count:', error);
      });

    // Redirect to destination URL
    const destinationUrl = normalizeDestinationUrl(qrCode.destination_url, clientWebsite, request.url);
    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error('[QR Redirect] Error:', error);
    // On error, redirect to main site rather than showing an error
    return NextResponse.redirect(new URL('/', request.url));
  }
}
