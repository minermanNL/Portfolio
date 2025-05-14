// src/app/api/stripe-webhook/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string // You will need to add this to your .env.local file
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed!', checkoutSession);
      // TODO: Fulfill the purchase, provision the user's subscription
      // You can find information like customer ID, subscription ID, and plan
      // in the checkoutSession object.
      // For example: checkoutSession.customer, checkoutSession.subscription
      break;
    case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        console.log('Subscription created!', subscriptionCreated);
        // TODO: Update user's subscription status in your database
        // Link the subscription to your user record.
        // subscriptionCreated.customer, subscriptionCreated.id, subscriptionCreated.items.data[0].price.id
        break;
    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object as Stripe.Subscription;
      console.log('Subscription updated!', subscriptionUpdated);
      // TODO: Handle subscription changes (e.g., plan changes, payment issues)
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      console.log('Subscription deleted!', subscriptionDeleted);
      // TODO: Handle subscription cancellation
      // Remove the user's access to paid features.
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true }, { status: 200 });
}
