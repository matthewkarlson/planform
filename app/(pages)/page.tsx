import { Button } from '@/components/ui/button';
import { Download, ArrowRight, BarChart2, Target, Users, RefreshCw, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
              Turn Site Visits
                <span className="block text-indigo-600">Into Sales</span>
              </h1>
              <p className="text-xs font-bold mt-7 text-gray-700 tracking-tight sm:text-lg md:text-xl">
                Built for marketing agencies that want more leads without more manual work.
              </p>
              <p className="mt-3 text-base text-gray-500 sm:mt-7 sm:text-xl lg:text-lg xl:text-xl">
                Your "Book a free consultation" button is costing you sales. We bridge the gap between leads visiting your site and booking a call - 
                With personalised growth plans built from your real offerings and services.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link
                  href="/planform"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full shadow-lg text-indigo-700 border-indigo-300 hover:bg-indigo-50"
                  >
                    Replace your consultation form
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 lg:col-span-6">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/book-call-no.png"
                  alt="Planform.ai Dashboard"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-700 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                Personalized Plans That Actually Convert
                </h2>
                <p className="mt-2 text-base text-gray-500">
Don't let leads walk away. We turn your real services into a tailored plan that gives visitors a reason to book a call—based on exactly what you offer.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-700 text-white">
                <Target className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                 Tailored to Your Agency, Not a Template
                </h2>
                <p className="mt-2 text-base text-gray-500">
No generic audits. Your tool is fully customized to your services, language, and offers—so every visitor gets a plan that feels like it came from you.


                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-700 text-white">
                <Download className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                From Site Visit to Booked Call—Fast 
                </h2>
                <p className="mt-2 text-base text-gray-500">
Most leads bounce before they ever talk to you. Planform bridges the gap with instant value—so they book faster and show up ready to buy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Booking a call is a big step.
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Stop letting your leads bounce off your site because they aren't ready to book a call.
                With our powerful lead magnet, leads get to move gradually from site visitor, to lead, to customer.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/planform">
                <Button
                  size="lg"
                  className="text-lg rounded-full bg-indigo-700 hover:bg-indigo-800 text-white"
                >
                  Fix your funnel
                <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How Planform Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How Planform.ai Works
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
              Transform your website visitors into qualified leads and paying clients with 
              our AI-powered personalized growth plans.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-lg font-medium text-gray-500">The Growth Plan Process</span>
            </div>
          </div>
          
          <div className="mt-12 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="relative">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 mb-4 mx-auto">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Capture Lead Information</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Your prospects answer a few key questions about their business needs and goals through our streamlined questionnaire.
              </p>
              <div className="hidden lg:block absolute top-6 right-0 w-16 h-1 bg-indigo-100"></div>
            </div>
            
            <div className="relative mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 mb-4 mx-auto">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Generate Custom Plans</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Our AI instantly creates a tailored growth plan using your actual services, matching their needs with your specific offerings.
              </p>
              <div className="hidden lg:block absolute top-6 right-0 w-16 h-1 bg-indigo-100"></div>
            </div>
            
            <div className="relative mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 mb-4 mx-auto">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Convert More Clients</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Leads receive their professional growth plan immediately, priming them for a successful sales conversation when they book their call.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/planform">
              <Button className="text-lg rounded-full bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-6">
              Convert More Clients
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to know about improving your lead conversion process
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-indigo-700 mr-2 flex-shrink-0 mt-0.5" />
                <span>How do the personalized growth plans work?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Planform.ai takes your actual services and offerings and matches them to your prospect's 
                specific needs based on their questionnaire responses. The AI analyzes their business goals, 
                challenges, and priorities to create a custom plan that showcases exactly how your services 
                can help them achieve their objectives.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-indigo-700 mr-2 flex-shrink-0 mt-0.5" />
                <span>How long does it take to implement Planform on my site?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Setup is quick and straightforward. After you add your services and customize your questionnaire, 
                you can embed Planform.ai on your website in minutes. Our team also offers optional assistance 
                with integration to ensure a seamless experience for your visitors.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-indigo-700 mr-2 flex-shrink-0 mt-0.5" />
                <span>Will this replace my consultation booking system?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Planform.ai complements your existing booking system rather than replacing it. It adds a valuable 
                step in your sales funnel that converts more visitors into qualified leads. After receiving their 
                personalized plan, prospects are directed to your booking system to schedule a call, but now they're 
                much more likely to follow through and become clients.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-indigo-700 mr-2 flex-shrink-0 mt-0.5" />
                <span>How does this improve my conversion rates?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Most websites ask visitors to book a call immediately, which is a high-commitment action many aren't 
                ready for. Planform.ai creates an intermediate step where visitors receive immediate value (their custom plan) 
                while you capture their information. This approach typically increases lead generation by 35-50% and improves 
                consultation show-up rates by over 80%.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-indigo-700 mr-2 flex-shrink-0 mt-0.5" />
                <span>Can I customize the look and feel of the questionnaire?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Absolutely! Planform.ai is fully customizable to match your brand's colors, fonts, and overall aesthetic. 
                You can also tailor the questions, add your logo, and customize the format of the growth plans to ensure 
                a consistent brand experience for your prospects.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/planform">
              <Button
                size="lg"
                className="rounded-full bg-indigo-700 hover:bg-indigo-800 text-white"
              >
                Get Started with Planform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
