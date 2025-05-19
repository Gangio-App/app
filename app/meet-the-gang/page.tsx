import React from 'react';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Simple component that doesn't rely on client-side features
export default function MeetTheGangPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-6">
            Meet the GANG
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The colorful characters behind Gangio who bring personality and fun to our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Fufu */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative h-64 w-full">
              <Image 
                src="/assets/mascots/fufu.png" 
                alt="Fufu" 
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                Fufu
              </h3>
              <p className="text-emerald-500 font-medium mb-4">Leader</p>
              <p className="text-gray-300">The visionary leader of the GANG, Fufu brings everyone together with strategic thinking and boundless enthusiasm.</p>
            </div>
          </div>

          {/* Kazek */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative h-64 w-full">
              <Image 
                src="/assets/mascots/kazek.png" 
                alt="Kazek" 
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                Kazek
              </h3>
              <p className="text-emerald-500 font-medium mb-4">Tech Wizard</p>
              <p className="text-gray-300">The brilliant mind behind our technology, Kazek solves complex problems with innovative solutions.</p>
            </div>
          </div>

          {/* Fela */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative h-64 w-full">
              <Image 
                src="/assets/mascots/fela.png" 
                alt="Fela" 
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                Fela
              </h3>
              <p className="text-emerald-500 font-medium mb-4">Creative Director</p>
              <p className="text-gray-300">With an eye for design and aesthetics, Fela ensures everything looks and feels perfect.</p>
            </div>
          </div>

          {/* Bobby */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-300">
            <div className="relative h-64 w-full">
              <Image 
                src="/assets/mascots/bobby.png" 
                alt="Bobby" 
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
                Bobby
              </h3>
              <p className="text-emerald-500 font-medium mb-4">Community Manager</p>
              <p className="text-gray-300">The friendly face of our community, Bobby makes sure everyone feels welcome and heard.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-xl p-8 border border-emerald-800/30">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-4">The GANG Story</h2>
          <p className="text-gray-300 mb-4">
            Born from a shared passion for gaming and community, our mascots represent the diverse talents and personalities that make up the Gangio team.
          </p>
          <p className="text-gray-300 mb-4">
            Led by Fufu, this dynamic group works together to create the best possible platform for gamers and communities worldwide. Each member brings their unique skills and perspective to the table.
          </p>
          <p className="text-gray-300">
            Whether you're chatting with friends, joining a server, or exploring new communities, the GANG is there to make your experience better.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
