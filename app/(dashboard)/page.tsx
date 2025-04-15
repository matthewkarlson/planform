import { Button } from '@/components/ui/button';
import { Download, ArrowRight, BarChart2, Target, Users } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Test Your Ideas
                <span className="block text-orange-500">Faster Than Ever</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Get comprehensive feedback on your business ideas from diverse AI personas. 
                Analyze market opportunities, identify competitors, and receive actionable 
                recommendations to refine your concept.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="/arena"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                    Test Your Idea
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
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
                Detailed Idea Assessment
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Share your business concept with key details like revenue strategy, 
                core problem, and value proposition. Get an executive summary with 
                strengths, weaknesses, competitive landscape, and specific recommendations
                to improve your idea.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="/arena">
                <Button
                  size="lg"
                  className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Start Your Analysis
                  <BarChart2 className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
