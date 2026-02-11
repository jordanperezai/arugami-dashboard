import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { getSupabaseServiceClient } from '@/utils/supabase';
import Stripe from 'stripe';

/**
 * Handle Stripe webhook events
 *
 * POST /api/stripe/webhook
 *
 * Events handled:
 * - checkout.session.completed: Payment successful, activate subscription
 * - invoice.payment_failed: Payment failed, may need to notify client
 * - customer.subscription.deleted: Subscription canceled
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: 'Invalid signature', details: message },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.metadata?.client_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!clientId) {
          console.error('No client_id in checkout session metadata');
          break;
        }

        console.log(`Payment completed for client ${clientId}`);

        // Update client with Stripe IDs and activate
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            stripe_customer_id: customerId,
            status: 'active',
            mrr_cents: 44900, // $449.00 founding rate
          })
          .eq('client_id', clientId);

        if (updateError) {
          console.error('Failed to update client:', updateError);
        }

        // Log for debugging - in production you might store subscription_id
        console.log(`Subscription ${subscriptionId} created for customer ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`Payment failed for customer ${customerId}`);

        // Find the client by stripe_customer_id
        const { data: clientData } = await supabase
          .from('clients')
          .select('client_id, business_name')
          .eq('stripe_customer_id', customerId)
          .single();

        if (clientData) {
          console.log(`Payment failed for ${clientData.business_name} (${clientData.client_id})`);
          // Stripe's dunning system will handle retries automatically
          // You could add additional notifications here (email, SMS, etc.)
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`Subscription canceled for customer ${customerId}`);

        // Find the client and update their status
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            status: 'churned',
            mrr_cents: 0,
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('Failed to update client status:', updateError);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`Invoice paid for customer ${customerId}`);
        // Good for tracking successful renewals
        break;
      }

      default:
        // Log unhandled events for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook handler error:', message);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: message },
      { status: 500 }
    );
  }
}

// In Next.js App Router, the body is not automatically parsed
// so we don't need the old Pages Router config.
// The request.text() call above gives us the raw body needed for Stripe signature verification.
