import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { getSupabaseServiceClient } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getSupabaseServiceClient();

    const { data: clientUser, error: clientUserError } = await db
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .eq('client_id', clientId)
      .single();

    if (clientUserError || !clientUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: clientData, error: clientError } = await db
      .from('clients')
      .select('client_id, business_name, stripe_customer_id')
      .eq('client_id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

    let customerId = clientData.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: clientData.business_name,
        metadata: { client_id: clientId },
      });

      customerId = customer.id;

      await db
        .from('clients')
        .update({ stripe_customer_id: customerId })
        .eq('client_id', clientId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The Intelligent Grid',
              description: 'AI-powered business automation for local businesses',
            },
            unit_amount: 44900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?billing=success&launch=concierge`,
      cancel_url: `${appUrl}/dashboard?billing=canceled`,
      metadata: { client_id: clientId },
      subscription_data: {
        metadata: { client_id: clientId },
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create checkout session', details: message }, { status: 500 });
  }
}
