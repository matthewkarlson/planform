import { Button } from '@/components/ui/button';
import { EyeOff, ArrowRight, Zap, CircleUserRound } from 'lucide-react';
import { Terminal } from './terminal';
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
              Test your ideas against real AI agents in a matter of seconds. Iterate faster with feedback
              from a wide range of perspectives. All summarized in a single dashboard.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="https://vercel.com/templates/next.js/next-js-saas-starter"
                  target="_blank"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg rounded-full"
                  >
                  Start Iterating
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
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Zap className="h-6 w-6" />
              </div>
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Actionable Feedback
                </h2>
                <p className="mt-2 text-base text-gray-500">
                Using state of the art Agentic Analysis, we do a deep dive into what is and isnt going to work with your idea.
                So you can avoid costly mistakes and focus on what works.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CircleUserRound className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                100+ Perspectives
                </h2>
                <p className="mt-2 text-base text-gray-500">
                We check against 100+ perspectives to ensure your idea lands with the people who matter.
                From potential customers to industry experts, we've got you covered.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <EyeOff className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                Never Stored
                </h2>
                <p className="mt-2 text-base text-gray-500">
                Your ideas are yours alone. We never store your ideas, the arena forgets them as soon as they leave.
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
              Ready to enter the Arena?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
              The beta for Idea Arena is now open. Sign up and submit your idea.
              Stop watching from the sidelines, your ideas are the start of something great.
              See you in the Arena.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a href="https://github.com/nextjs/saas-starter" target="_blank">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg rounded-full"
                >
                Enter the Arena
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
