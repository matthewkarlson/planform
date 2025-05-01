'use client';

import { Button } from '@/components/ui/button';
import { Download, ArrowRight, Target, Users, RefreshCw, CheckCircle, DraftingCompass, Camera, FileSpreadsheet, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import bg from '@/public/planform_hero_bg.png';
import demopn from '@/public/website_analysis_demo.png';
import ClientHeader from '@/app/components/layout/ClientHeader';

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <ClientHeader />
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={bg}
            alt="Hero Background"
            fill
            priority
            quality={100}
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                Turn Site Visits
                <span className="block text-white mt-2">Into Sales</span>
              </h1>
              <p className="mt-8 text-xl text-gray-300">
                Most visitors bounce before they ever talk to you. Planform captures them with a personalized marketing plan tied to your actual services—so you stop leaving money on the table.
              </p>
              <div className="mt-10">
                <Link href="/pricing">
                  <Button
                    size="lg"
                    className="text-white bg-blue-500 hover:bg-blue-600 rounded-full px-8 py-6 text-lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 relative">
              {/* This is where the 3D cube is positioned in the image - it's part of the background image */}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - New Design */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <h3 className="text-4xl font-bold mb-6">
                Capture, Craft, Close 
                <span className="block mt-2">your growth engine in</span>
                <span className="block mt-2">three easy clicks</span>
              </h3>
              
              {/* This is where the placeholder for the image would be */}
              <Image src={demopn} alt="Hero Background" className="rounded-lg" />
            </div>
            
            {/* Right Column - Steps */}
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-lg bg-blue-500 flex-shrink-0 flex items-center justify-center">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-3">Capture Lead Information</h4>
                  <p className="text-gray-300">
                    Your prospects answer a few key questions about their business needs and goals through our streamlined questionnaire.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-lg bg-gray-800 flex-shrink-0 flex items-center justify-center">
                  <FileSpreadsheet className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-3">Delight Your Clients</h4>
                  <p className="text-gray-300">
                    Our AI instantly creates a tailored growth plan and a personalised website analysis for your site visitors, matching their needs with your specific offerings.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-lg bg-blue-900 flex-shrink-0 flex items-center justify-center">
                  <Award className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-3">Convert</h4>
                  <p className="text-gray-300">
                    Leads receive their professional growth plan immediately, priming them for a successful sales conversation when they book their call.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">Why Your Current Funnel Is Losing You Leads</h2>
          <p className="text-lg text-gray-300 mb-4">
            Most agency sites rely on "Book a Free Consultation" CTAs. That's too much, too soon—and your best leads bounce.
          </p>
          <p className="text-lg text-gray-300 mb-6">
            Planform fixes that with:
          </p>
          <div className="space-y-3 mb-8">
            <p className="flex items-start text-lg text-gray-300">
              <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>A custom growth plan built from your services</span>
            </p>
            <p className="flex items-start text-lg text-gray-300">
              <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>Instant feedback on their website to hook attention</span>
            </p>
            <p className="flex items-start text-lg text-gray-300">
              <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>Zero manual work for you or your team</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">You'll Get the Most Value From Planform If:</h2>
          <div className="space-y-3 mb-8">
            <p className="flex items-start text-lg text-gray-300">
              <Target className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>You're manually doing audits or proposals to qualify leads</span>
            </p>
            <p className="flex items-start text-lg text-gray-300">
              <Target className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>You know traffic's coming in—but few book calls</span>
            </p>
            <p className="flex items-start text-lg text-gray-300">
              <Target className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>You want to look bigger and more professional without hiring more staff</span>
            </p>
            <p className="flex items-start text-lg text-gray-300">
              <Target className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
              <span>You're tired of "free consultation" CTAs that lead nowhere</span>
            </p>
          </div>
          <div className="mt-8 flex justify-center lg:justify-end">
            <Link href="/pricing">
              <Button
                size="lg"
                className="text-lg rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Fix your funnel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 bg-gray-900 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                🧠 Personalized Plans That Convert
                </h2>
                <p className="mt-2 text-base text-gray-300">
                We turn your services into a custom plan that helps visitors understand exactly how you'll help them—and why they should book with you.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Target className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                🎛 Tailored to Your Agency
                </h2>
                <p className="mt-2 text-base text-gray-300">
                No templates. Planform uses your real offers, packages, and brand language—so every plan feels like you wrote it.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <Download className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-white">
                📈 From Visit to Call in One Click
                </h2>
                <p className="mt-2 text-base text-gray-300">
                Forget PDFs, forms, or follow-up emails. Your visitors get value instantly, and your team gets qualified leads ready to talk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
            <p className="text-xl italic text-gray-200 mb-4">
              "We added a Growth Plan CTA to our site with Planform and saw 3x more qualified leads in the first two weeks."
            </p>
            <div className="flex items-center">
              <div>
                <p className="font-medium text-white">Jordan M.</p>
                <p className="text-sm text-gray-400">Founder at Lightbridge Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-300">
              Everything you need to know about improving your lead conversion process
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-white flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How do the personalized growth plans work?</span>
              </h3>
              <p className="mt-2 text-gray-300 ml-8">
                Planform.ai takes your actual services and offerings and matches them to your prospect's 
                specific needs based on their questionnaire responses. The AI analyzes their business goals, 
                challenges, and priorities to create a custom plan that showcases exactly how your services 
                can help them achieve their objectives.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-white flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How long does it take to implement Planform on my site?</span>
              </h3>
              <p className="mt-2 text-gray-300 ml-8">
                Setup is quick and straightforward. After you add your services and customize your questionnaire, 
                you can embed Planform.ai on your website in minutes. We'll help you get up and running so you can 
                start converting more leads - fast. 
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-white flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Will this replace my consultation booking system?</span>
              </h3>
              <p className="mt-2 text-gray-300 ml-8">
                Planform.ai complements your existing booking system rather than replacing it. It adds a valuable 
                step in your sales funnel that converts more visitors into qualified leads. After receiving their 
                personalized plan, prospects are directed to your booking system to schedule a call, but now they're 
                much more likely to follow through and become clients.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-white flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How does this improve my conversion rates?</span>
              </h3>
              <p className="mt-2 text-gray-300 ml-8">
                Most websites ask visitors to book a call immediately, which is a high-commitment action many aren't 
                ready for. Planform.ai creates an intermediate step where visitors receive immediate value (their custom plan) 
                while you capture their information. This approach typically increases lead generation by 35-50% and improves 
                consultation show-up rates by over 80%.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-white flex items-start">
                <CheckCircle className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Can I customize the look and feel of the questionnaire?</span>
              </h3>
              <p className="mt-2 text-gray-300 ml-8">
                Absolutely! Planform.ai is fully customizable to match your brand's colors, fonts, and overall aesthetic. 
                You can also tailor the questions, add your logo, and customize the format of the growth plans to ensure 
                a consistent brand experience for your prospects.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/pricing">
              <Button
                size="lg"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Get Started with Planform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <section id="cta" className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Be One of the First Agencies to Use This</h2>
          <p className="text-xl text-gray-300 mb-2">
            Planform is in private beta for small, fast-moving agencies.
          </p>
          <p className="text-xl text-gray-300 mb-8">
            We're opening 2 more pilot spots this week.
          </p>
          
          <Link href="/pricing">
            <Button
              size="lg"
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-xl"
            >
              Try Planform Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">(Takes 5 mins to install. No dev needed.)</p>
        </div>
      </section>
    </main>
  );
}
