import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import ClientHeader from '@/app/components/layout/ClientHeader';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const basePlan = products.find((product) => product.name === 'Base');
  const plusPlan = products.find((product) => product.name === 'Plus');

  const basePrice = prices.find((price) => price.productId === basePlan?.id);
  const plusPrice = prices.find((price) => price.productId === plusPlan?.id);

  return (
    <div className="bg-black text-white min-h-screen">
      <ClientHeader showNavigation={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Our pricing is simple<br />with no hidden fees</h1>
          <p className="text-lg text-gray-300">
            Cancel any <span className="text-blue-400">time!</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            name={basePlan?.name || 'Base'}
            price={basePrice?.unitAmount || 800}
            interval={basePrice?.interval || 'month'}
            trialDays={basePrice?.trialPeriodDays || 14}
            features={[
              'Unlimited Usage',
              'Unlimited Team Members',
              'Email Support',
            ]}
            priceId={basePrice?.id}
            variant="basic"
          />
          <PricingCard
            name={plusPlan?.name || 'Plus'}
            price={plusPrice?.unitAmount || 1200}
            interval={plusPrice?.interval || 'month'}
            trialDays={plusPrice?.trialPeriodDays || 14}
            features={[
              'Everything in Base, and:',
              'Multiple Agencies',
              'CRM Integration',
            ]}
            priceId={plusPrice?.id}
            variant="premium"
          />
        </div>
      </main>
    </div>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  variant,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  variant: 'basic' | 'premium';
}) {
  return (
    <div className={`rounded-2xl p-8 relative overflow-hidden flex flex-col h-full ${
      variant === 'basic' 
        ? 'bg-gray-700' 
        : 'bg-black border border-gray-800'
    }`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          {name} {variant === 'premium' && <span className="ml-2 text-blue-400">💎</span>}
        </h2>
        <p className="text-right text-4xl font-bold text-white mb-2">
          £{price / 100}
        </p>
        <p className="text-right text-gray-300">per {interval}</p>
      </div>
      
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-white mb-4">Features</h4>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-200">
              <Check className="h-5 w-5 text-white mr-3 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton variant={variant as "basic" | "premium"} />
      </form>
    </div>
  );
}