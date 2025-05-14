// src/app/api/create-stripe-checkout/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { priceId, userId } = body; // Assuming userId is sent from the frontend

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // In a real application, you would fetch the Stripe Customer ID
    // associated with the userId from your database.
    // For this example, we'll assume the user object on the frontend
    // might have a stripeCustomerId property.
    // If the user doesn't have a Stripe Customer ID yet, you would create one here
    // and store it in your database before creating the checkout session.
    // const customerId = user?.stripeCustomerId; // Example if passing user object

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // If you have a customer ID, uncomment the line below:
      // customer: customerId,
      // If creating a new customer for this session, Stripe can handle it:
      // customer_email: user?.email, // Example if passing user object with email

      success_url: `${request.headers.get('origin')}/dashboard/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ checkoutUrl: session.url });

  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
