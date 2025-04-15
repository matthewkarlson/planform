import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  // Regular user with default 1 run
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
      },
    ])
    .returning();

  console.log('Initial user created with default 1 run.');

  // Free user with 0 runs
  const freeUserEmail = 'free@test.com';
  const freeUserPassword = 'password123';
  const freeUserPasswordHash = await hashPassword(freeUserPassword);

  await db
    .insert(users)
    .values([
      {
        email: freeUserEmail,
        passwordHash: freeUserPasswordHash,
        remainingRuns: 0,
      },
    ]);

  console.log('Free user created with 0 runs.');

  // Premium user with 0 runs
  const premiumUserEmail = 'premium@test.com';
  const premiumUserPassword = 'password123';
  const premiumUserPasswordHash = await hashPassword(premiumUserPassword);

  // Create a real Stripe customer
  const stripeCustomer = await stripe.customers.create({
    email: premiumUserEmail,
    name: 'Premium Test User',
    metadata: {
      isTestUser: 'true'
    }
  });

  console.log(`Created Stripe customer with ID: ${stripeCustomer.id}`);

  await db
    .insert(users)
    .values([
      {
        email: premiumUserEmail,
        name: 'Premium User',
        passwordHash: premiumUserPasswordHash,
        isPremium: true,
        remainingRuns: 0,
        stripeCustomerId: stripeCustomer.id,
      },
    ]);

  console.log('Premium user created with 0 runs.');

  // Create Stripe products and prices
  // await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
