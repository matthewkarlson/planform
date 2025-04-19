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
              Start Anywhere. Improve Relentlessly. 
                <span className="block text-orange-500">Build Something Great.</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Most startups fail because they're based on bad ideas. Yours doesn't have to be. We validate and 
              analyse your idea based on frameworks from the top startup accelerators and VC firms.
              </p>
              <p className="mt-3 text-base text-black sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Don't waste time and money building something nobody wants.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link
                  href="/waitlist"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full shadow-lg"
                  >
                  Turn Your Ideas into Champions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 lg:col-span-6">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/idea_arena_hero.png"
                  alt="Idea Arena Dashboard"
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
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Multi-Persona Analysis
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Receive feedback from diverse viewpoints including venture capitalists, 
                  product managers, marketing directors, consumers, and industry experts. 
                  Each provides ratings and actionable suggestions.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Target className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Competitor Analysis
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Identify your top competitors, understand market saturation, 
                  and discover opportunities for differentiation. Get concrete insights
                  on positioning your idea in the current market landscape.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Download className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Exportable Results
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Save your analysis as a well-structured markdown document. 
                  No need to create an account or store data - simply download
                  your comprehensive report with all insights and recommendations.
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
              It Doesn't Matter Where You Start
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
              It Matters Where You End Up. Idea Arena iterates on your ideas until they're worth your time and energy. We take from a rough outline to a polished idea with 
              clear and actionable steps so you can build something great.
              </p>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
              The sooner you start, the quicker you improve.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/waitlist">
                <Button
                  size="lg"
                  className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                Start Iterating Now
                  <BarChart2 className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Iterative Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Turn Good Ideas Into Great Ones
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500">
              The difference between success and failure often comes down to iteration. 
              Our platform helps you refine your concepts through targeted feedback loops.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-lg font-medium text-gray-500">The Refinement Process</span>
            </div>
          </div>
          
          <div className="mt-12 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="relative">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500 mb-4 mx-auto">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Test Your Idea</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Enter your business concept with all the key details. Our AI personas will analyze every aspect.
              </p>
              <div className="hidden lg:block absolute top-6 right-0 w-16 h-1 bg-orange-100"></div>
            </div>
            
            <div className="relative mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500 mb-4 mx-auto">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Review Insights</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Get a comprehensive analysis including market positioning, competitor insights, and specific improvement recommendations.
              </p>
              <div className="hidden lg:block absolute top-6 right-0 w-16 h-1 bg-orange-100"></div>
            </div>
            
            <div className="relative mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-500 mb-4 mx-auto">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center mb-4">Refine & Retest</h3>
              <p className="text-base text-gray-500 text-center mb-4">
                Apply the suggestions to refine your idea, then test again to see how your changes improved your score.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/waitlist">
              <Button className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-6">
                Start Iterating Now
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
              Everything you need to know about improving your business ideas
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How does the multi-persona analysis work?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Your idea is evaluated by AI personas representing different stakeholders: 
                venture capitalists, product managers, marketing directors, average consumers, 
                industry experts, and more. Each provides ratings and personalized feedback 
                based on their unique perspective.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Do I need to create an account to use the Arena?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Yes, a simple account is required to track your remaining runs. However, we don't 
                permanently store your ideas or analysis results. You can export your results as 
                markdown files for your records.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>What kind of ideas can I test in the Arena?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                You can test any business idea, product concept, or service offering. The system 
                works best when you provide details about your target audience, core problem being 
                solved, unique value proposition, and revenue strategy. The more information you 
                provide, the more specific and valuable the feedback will be.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How accurate is the competitor analysis?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Our system performs real-time web searches to identify actual competitors in your 
                market space. It evaluates market saturation, identifies key players, analyzes their 
                approaches, and suggests positioning strategies based on current market conditions. 
                This provides a realistic snapshot of the competitive landscape your idea would face.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 flex items-start">
                <CheckCircle className="h-6 w-6 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>How many times can I refine and retest my idea?</span>
              </h3>
              <p className="mt-2 text-gray-500 ml-8">
                Each test counts as one run from your account's allotment. We encourage the 
                iterative process of refinement, as ideas typically improve significantly after 
                2-3 rounds of feedback and adjustments. You can purchase additional runs if needed 
                from the pricing page.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/waitlist">
              <Button
                size="lg"
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Test Your First Idea
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
