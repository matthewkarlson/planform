import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Debug logging - log the entire session object
    console.log('Retrieved Stripe session:', JSON.stringify(session, null, 2));

    // Get the customer ID
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;
    
    console.log('Extracted customerId:', customerId);
    console.log('Session customer object:', session.customer);
    
    // If no customerId is found, create a customer for this user
    if (!customerId) {
      console.log('No customer ID found, attempting to process without it');
      // Get the user ID from the client reference
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.log('No client_reference_id found in session');
        throw new Error("No user ID found in session's client_reference_id.");
      }
      
      console.log('Using client_reference_id as userId:', userId);
      
      // Get the user
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(userId)))
        .limit(1);

      if (userResult.length === 0) {
        console.log('User not found with ID:', userId);
        throw new Error('User not found in database.');
      }

      const user = userResult[0];
      console.log('Found user:', user);
      
      // Update user with subscription information from session data
      await db.update(users)
        .set({
          // We'll set stripeCustomerId later when available
          isPremium: true,
          remainingRuns: 1
        })
        .where(eq(users.id, Number(userId)));

      // Set user session
      await setSession(user);
      
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Get the user ID from the client reference
    const userId = session.client_reference_id;
    if (!userId) {
      console.log('No client_reference_id found in session');
      throw new Error("No user ID found in session's client_reference_id.");
    }

    console.log('Using client_reference_id as userId:', userId);

    // Get line items directly with expanded product
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    console.log('Retrieved line items:', lineItems.data);
    
    if (lineItems.data.length === 0) {
      console.log('No line items found in session');
      throw new Error("No line items found in the checkout session.");
    }
    
    const item = lineItems.data[0];
    if (!item.price) {
      console.log('No price found in first line item');
      throw new Error("No price found in line item.");
    }
    
    // Get the price and product details
    const priceId = typeof item.price === 'string' ? item.price : item.price.id;
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    console.log('Retrieved price details, product info available:', !!price.product);
    
    if (!price.product || typeof price.product === 'string') {
      console.log('Product information not available or is just an ID');
      throw new Error("Could not retrieve product information.");
    }
    
    const product = price.product;
    console.log('Product information:', product);
    
    // Check if it's an active product or deleted product
    if ('deleted' in product && product.deleted) {
      console.log('Product is marked as deleted');
      throw new Error("Product has been deleted.");
    }

    // Get the user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    if (userResult.length === 0) {
      console.log('User not found with ID:', userId);
      throw new Error('User not found in database.');
    }

    const user = userResult[0];
    console.log('Found user:', user);

    // Update user with subscription information
    let remainingRuns = user.remainingRuns || 0;

    // Determine number of runs based on plan name
    if (product.name === 'Centurion') {
      remainingRuns = remainingRuns + 5;
    } else if (product.name === 'Imperator') {
      remainingRuns = remainingRuns + 15;
    } else if (product.name.toLowerCase().includes('recruit')) {
      remainingRuns = remainingRuns + 1;
    }

    console.log(`Setting remaining runs to ${remainingRuns} for plan ${product.name}`);

    await db.update(users)
      .set({
        stripeCustomerId: customerId,
        isPremium: true,
        remainingRuns: remainingRuns
      })
      .where(eq(users.id, Number(userId)));

    // Set user session
    await setSession(user);
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
