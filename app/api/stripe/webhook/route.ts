import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';
import { getUserByStripeCustomerId } from '@/lib/db/queries';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === 'payment') {
        // Handle one-time payment
        const customerId = session.customer as string;
        
        if (customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          
          if (user) {
            // Get line items to find product information
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const item = lineItems.data[0];
            
            if (item && item.price) {
              const priceId = typeof item.price === 'string' ? item.price : item.price.id;
              const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
              
              if (price.product && typeof price.product !== 'string' && !('deleted' in price.product && price.product.deleted)) {
                const product = price.product;
                
                // Determine number of runs based on plan name
                let remainingRuns = 0;
                if (product.name === 'Centurion') {
                  remainingRuns = 5;
                } else if (product.name === 'Imperator') {
                  remainingRuns = 15;
                } else if (product.name.toLowerCase().includes('recruit')) {
                  remainingRuns = 1;
                }

                console.log(`Setting remaining runs to ${remainingRuns} for plan ${product.name}`);

                // Update user with the product information
                await db
                  .update(users)
                  .set({
                    stripeProductId: product.id,
                    planName: product.name,
                    subscriptionStatus: 'active',
                    remainingRuns: remainingRuns,
                    updatedAt: new Date(),
                  })
                  .where(eq(users.id, user.id));
              }
            }
          }
        }
      } else if (session.mode === 'subscription') {
        // Keep subscription handling for backward compatibility
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await handleSubscriptionChange(subscription);
        }
      }
      break;
    
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
