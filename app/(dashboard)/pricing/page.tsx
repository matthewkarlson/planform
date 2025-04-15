import { checkoutAction } from '@/lib/payments/actions';
import { Check, Zap } from 'lucide-react';
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

  // Get product IDs by name
  const centurionPlan = products.find((p) => p.name === 'Centurion');
  const imperatorPlan = products.find((p) => p.name === 'Imperator');
  const recruitPlan = products.find((p) => p.name === 'Recruit');

  // Get prices for each product
  const centurionPrice = prices.find(
    (p) => p.productId === centurionPlan?.id
  );
  const imperatorPrice = prices.find(
    (p) => p.productId === imperatorPlan?.id
  );
  const recruitPrice = prices.find(
    (p) => p.productId === recruitPlan?.id
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-3">Arena Run Bundles</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Purchase premium run bundles to test your ideas. All premium plans include the same advanced features - 
          choose based on how many ideas you want to test.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <PricingCardFree 
          name="Free Trial"
          description="Try the Arena with one free run"
          features={[
            'Basic scoring',
            'Results summary',
            'Core feedback'
          ]}
          runs="1"
        />

        <PricingCardPaid
          name="Centurion"
          description="5 premium Arena runs with all advanced features"
          price={centurionPrice?.unitAmount || 4900}
          features={[
            'Full in-depth insights',
            'Save and compare results',
            'Detailed agent feedback',
            'Idea validation report',
            'Premium agent analysis'
          ]}
          runs="5"
          priceId={centurionPrice?.id}
          popular={true}
        />

        <PricingCardPaid
          name="Imperator"
          description="15 premium Arena runs with all advanced features"
          price={imperatorPrice?.unitAmount || 9900}
          features={[
            'Full in-depth insights',
            'Save and compare results',
            'Detailed agent feedback',
            'Idea validation report',
            'Premium agent analysis',
          ]}
          runs="15"
          priceId={imperatorPrice?.id}
          popular={false}
        />
      </div>
    </main>
  );
}

function PricingCardPaid({
  name,
  description,
  price,
  features,
  runs,
  priceId,
  popular,
}: {
  name: string;
  description: string;
  price: number | null;
  features: string[];
  runs: string;
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
        ${((price || 0) / 100).toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 mb-2">One-time payment</p>
      
      <div className="flex items-center mb-4 mt-2">
        <div className="bg-orange-100 rounded-full p-2 mr-3">
          <Zap className="h-4 w-4 text-orange-500" />
        </div>
        <span className="text-lg font-semibold">{runs} Arena Runs</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      
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
  description,
  features,
  runs
}: {
  name: string;
  description: string;
  features: string[];
  runs: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 flex flex-col h-full">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-4xl font-bold text-gray-900 mb-2">
        Free
      </p>
      <p className="text-sm text-gray-600 mb-2">No credit card required</p>
      
      <div className="flex items-center mb-4 mt-2">
        <div className="bg-orange-100 rounded-full p-2 mr-3">
          <Zap className="h-4 w-4 text-orange-500" />
        </div>
        <span className="text-lg font-semibold">{runs} Arena Run</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      
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