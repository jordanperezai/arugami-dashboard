import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseServiceClient } from '@/utils/supabase';

/**
 * Create a Stripe Checkout session for the $449/mo founding rate subscription
 *
 * POST /api/stripe/create-checkout-session
 * Body: { clientId: string, token: string }
 *
 * Returns: { url: string } - The Stripe Checkout URL to redirect to
 */
export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();

  try {
    const { clientId, token } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Welcome token is required' },
        { status: 400 }
      );
    }

    // Verify the client exists and get their info
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('client_id, business_name, stripe_customer_id')
      .eq('client_id', clientId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found', details: clientError?.message },
        { status: 404 }
      );
    }

    // Build the app URL for redirects
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

    // Create or retrieve Stripe customer
    let customerId = clientData.stripe_customer_id;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        name: clientData.business_name,
        metadata: {
          client_id: clientId,
        },
      });
      customerId = customer.id;

      // Save the customer ID to our database
      await supabase
        .from('clients')
        .update({ stripe_customer_id: customerId })
        .eq('client_id', clientId);
    }

    // Create a Stripe Checkout session
    // Using embedded mode would require more setup, so we use redirect mode
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
            unit_amount: 44900, // $449.00 founding rate in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/welcome?token=${encodeURIComponent(token)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/welcome?token=${encodeURIComponent(token)}&canceled=true`,
      metadata: {
        client_id: clientId,
      },
      subscription_data: {
        metadata: {
          client_id: clientId,
        },
      },
      // Enable billing address collection
      billing_address_collection: 'required',
      // Allow promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err: unknown) {
    console.error('Stripe checkout session error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: message },
      { status: 500 }
    );
  }
}
