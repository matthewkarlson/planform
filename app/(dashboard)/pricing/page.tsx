import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  // Find the specific product IDs for Centurion and Imperator
  const centurionPlan = products.find((product) => product.name === 'Centurion');
  const imperatorPlan = products.find((product) => product.name === 'Imperator');

  // Find the associated prices for each product
  const centurionPrice = prices.find((price) => price.productId === centurionPlan?.id);
  const imperatorPrice = prices.find((price) => price.productId === imperatorPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">Choose Your Bundle</h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCardFree
          name="Recruit"
          features={[
            'One Arena run',
            'Basic scoring',
            'Results summary',
          ]}
        />
        <PricingCardOneOff
          name="Centurion"
          price={4900}
          features={[
            '5 Arena runs',
            'Full in-depth insights',
            'Save and compare results',
            'Detailed agent feedback',
            'Idea validation report',
          ]}
          priceId={centurionPrice?.id}
          popular
        />
        <PricingCardOneOff
          name="Imperator"
          price={9900}
          features={[
            '15 Arena runs',
            'Everything in Centurion',
            'Custom niche agents',
            'Industry-specific analysis',
            'Profitability optimization',
            'Priority support',
          ]}
          priceId={imperatorPrice?.id}
        />
      </div>
    </main>
  );
}

function PricingCardOneOff({
  name,
  price,
  features,
  priceId,
  popular,
}: {
  name: string;
  price: number;
  features: string[];
  priceId?: string;
  popular?: boolean;
}) {
  return (
    <div className={`rounded-lg border ${popular ? 'border-orange-500 shadow-lg ring-1 ring-orange-500' : 'border-gray-200'} p-6 relative flex flex-col h-full`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
          MOST POPULAR
        </div>
      )}
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-4xl font-bold text-gray-900 mb-2">
        ${price / 100}
      </p>
      <p className="text-sm text-gray-600 mb-6">One-time payment</p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction} className="mt-auto">
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton variant={popular ? "default" : "outline"} />
      </form>
    </div>
  );
}

function PricingCardFree({
  name,
  features,
}: {
  name: string;
  features: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 flex flex-col h-full">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-4xl font-bold text-gray-900 mb-2">
        Free
      </p>
      <p className="text-sm text-gray-600 mb-6">No credit card required</p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link href="/arena">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}