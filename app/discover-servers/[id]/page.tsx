'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Import the sample data from the parent page to maintain consistency
const SAMPLE_SERVERS = [
  {
    id: '1',
    name: 'GANGIO Official',
    description: 'The official server for GANGIO, a gaming communication platform where gamers unite!',
    icon: '/assets/logo.png',
    banner: '/assets/gangiobear-wymsical-forest.png',
    memberCount: 2169731,
    onlineCount: 100237,
    categories: ['Gaming', 'Social', 'Official'],
    verified: true,
    created: 'January 2nd, 2020',
    language: 'English',
    features: [
      'Exclusive GANGIO events',
      'Early access to new features',
      'Direct communication with devs',
      'Community game nights',
      'Official announcements'
    ]
  },
  {
    id: '2',
    name: 'Esports Central',
    description: 'The ultimate destination for esports news, tournament info, and finding teams for competitive play.',
    icon: '/assets/gangiobear-gaming.png',
    banner: '/assets/gangiobear-gaming.png',
    memberCount: 1435268,
    onlineCount: 69413,
    categories: ['Gaming', 'Esports', 'Competitive'],
    verified: true,
    created: 'March 15th, 2021',
    language: 'English',
    features: [
      'Tournament announcements',
      'Team recruitment',
      'Coaching sessions',
      'VOD reviews',
      'Competitive matchmaking'
    ]
  },
  {
    id: '3',
    name: 'GameDev Hub',
    description: 'Connect with game developers, share your projects, get feedback, and collaborate on game jams.',
    icon: '/assets/gangiobear-witch-transparent.png',
    banner: '/assets/gangiobear-witch-transparent.png',
    memberCount: 782346,
    onlineCount: 37300,
    categories: ['Game Development', 'Creative', 'Technology'],
    verified: false,
    created: 'June 7th, 2021',
    language: 'English',
    features: [
      'Game jam events',
      'Portfolio showcases',
      'Code reviews',
      'Asset sharing',
      'Industry networking'
    ]
  },
  {
    id: '4',
    name: 'RPG Adventurers',
    description: 'Find your party for RPG games, discuss fantasy worlds, share character builds, and join campaigns.',
    icon: '/assets/GangBearHelp-transparent.png',
    banner: '/assets/GangBearHelp-transparent.png',
    memberCount: 567941,
    onlineCount: 28676,
    categories: ['RPG', 'Gaming', 'Fantasy'],
    verified: false,
    created: 'October 23rd, 2021',
    language: 'English',
    features: [
      'Character build guides',
      'Party finder',
      'Campaign organization',
      'Lore discussions',
      'Voice-enabled game sessions'
    ]
  },
  {
    id: '5',
    name: 'Mobile Legends',
    description: 'The largest community for Mobile Legends players. Strategy guides, team recruitment, and tournaments.',
    icon: '/assets/gangiobear-mobile.png',
    banner: '/assets/gangiobear-mobile.png',
    memberCount: 1204708,
    onlineCount: 85294,
    categories: ['Mobile Gaming', 'MOBA', 'Competitive'],
    verified: true,
    created: 'February 11th, 2021',
    language: 'English',
    features: [
      'Hero guides',
      'Team matchmaking',
      'Tournament organization',
      'Meta discussions',
      'Live match analysis'
    ]
  },
  {
    id: '6',
    name: 'FPS Masters',
    description: 'Improve your aim, learn tactics, and find squads for your favorite first-person shooter games.',
    icon: '/assets/gangiobear-gaming.png',
    banner: '/assets/gangiobear-gaming.png',
    memberCount: 936077,
    onlineCount: 55175,
    categories: ['FPS', 'Gaming', 'Competitive'],
    verified: false,
    created: 'May 30th, 2021',
    language: 'English',
    features: [
      'Aim training workshops',
      'Strategy discussions',
      'Squad matchmaking',
      'Tournament organization',
      'VOD reviews'
    ]
  },
  {
    id: '7',
    name: 'Minecraft Universe',
    description: 'Everything Minecraft! Build showcases, survival tips, redstone tutorials, and server recruitment.',
    icon: '/assets/gangiobear-witch-transparent.png',
    banner: '/assets/gangiobear-witch-transparent.png',
    memberCount: 1560708,
    onlineCount: 96434,
    categories: ['Minecraft', 'Building', 'Survival'],
    verified: true,
    created: 'July 19th, 2020',
    language: 'English',
    features: [
      'Build competitions',
      'Redstone workshops',
      'Survival challenges',
      'Mod discussions',
      'Server listings'
    ]
  },
  {
    id: '8',
    name: 'Anime Gamers',
    description: 'For fans of anime-style games and JRPGs. Discuss your favorite titles, characters, and upcoming releases.',
    icon: '/assets/gangiobear-wymsical-forest-transparent.png',
    banner: '/assets/gangiobear-wymsical-forest-transparent.png',
    memberCount: 687941,
    onlineCount: 32676,
    categories: ['Anime', 'JRPG', 'Gaming'],
    verified: false,
    created: 'November 3rd, 2021',
    language: 'English',
    features: [
      'Game discussions',
      'Character analyses',
      'Fan art sharing',
      'Group watch parties',
      'Release countdowns'
    ]
  },
];

// Format numbers to K/M format
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Finding similar servers based on categories
const getSimilarServers = (currentServer: any, allServers: any[]) => {
  if (!currentServer || !allServers.length) return [];
  
  // Filter servers that share at least one category with the current server
  // but exclude the current server itself
  return allServers
    .filter(server => 
      server.id !== currentServer.id && 
      server.categories.some((category: string) => 
        currentServer.categories.includes(category)
      )
    )
    .slice(0, 3); // Return only top 3 similar servers
};

export default function ServerDetails({ params }: { params: { id: string } }) {
  const [server, setServer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [similarServers, setSimilarServers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchServerDetails = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be an API call
        // For now, we're using the sample data
        const foundServer = SAMPLE_SERVERS.find(s => s.id === params.id);
        
        if (foundServer) {
          setServer(foundServer);
          // Find similar servers
          const similar = getSimilarServers(foundServer, SAMPLE_SERVERS);
          setSimilarServers(similar);
        } else {
          setError('Server not found');
        }
      } catch (err) {
        setError('Failed to load server details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-400">Loading server details...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/gangiobear-witch-transparent.png" alt="Error" className="w-24 h-24 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error || 'Server not found'}</p>
          <button 
            onClick={() => router.push('/discover-servers')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md text-white hover:from-emerald-600 hover:to-teal-600 transition-colors"
          >
            Back to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/assets/logo.png" alt="GANGIO" className="h-10 w-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              GANGIO
            </span>
          </Link>
          
          <div className="flex space-x-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Login
            </button>
            
            <button 
              onClick={() => router.push('/signup')}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>
      
      <main className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <nav className="flex text-sm text-gray-400">
              <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/discover-servers" className="hover:text-emerald-400 transition-colors">Discover Servers</Link>
              <span className="mx-2">›</span>
              <span className="text-emerald-400">{server.name}</span>
            </nav>
          </div>
          
          {/* Server Banner */}
          <div className="relative h-64 rounded-t-xl overflow-hidden mb-0">
            <img 
              src={server.banner} 
              alt={`${server.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
          </div>
          
          {/* Server Info Section */}
          <motion.div 
            className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-b-xl rounded-t-none p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Server Icon */}
              <div className="flex-shrink-0 -mt-16 md:-mt-20 mb-4 md:mb-0 md:mr-6 z-10">
                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-gray-800 bg-gray-700 rounded-full overflow-hidden">
                  <img 
                    src={server.icon} 
                    alt={server.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center flex-wrap">
                  <h1 className="text-3xl font-bold mr-3">{server.name}</h1>
                  {server.verified && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-2 mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                    <span className="text-emerald-400">{formatNumber(server.onlineCount)} online</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{formatNumber(server.memberCount)} members</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">Created {server.created}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {server.categories.map((category: string, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6">{server.description}</p>
                
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors"
                >
                  Join Server
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Server Features */}
          <motion.div 
            className="mt-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-6">Server Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {server.features?.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Member Activity */}
          <motion.div 
            className="mt-8 bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-6">Member Activity</h2>
            <div className="flex flex-wrap gap-8">
              <div className="flex-1 min-w-[150px]">
                <div className="text-3xl font-bold text-white mb-1">{formatNumber(server.memberCount)}</div>
                <div className="text-gray-400">Total Members</div>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{formatNumber(server.onlineCount)}</div>
                <div className="text-gray-400">Online Now</div>
              </div>
              
              <div className="flex-1 min-w-[150px]">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  {Math.round((server.onlineCount / server.memberCount) * 100)}%
                </div>
                <div className="text-gray-400">Activity Rate</div>
              </div>
            </div>
          </motion.div>
          
          {/* Similar Servers */}
          {similarServers.length > 0 && (
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold mb-6">Similar Servers You Might Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarServers.map((similarServer) => (
                  <motion.div
                    key={similarServer.id}
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/30 transition-all"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-emerald-500/30">
                            <img 
                              src={similarServer.icon} 
                              alt={similarServer.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">{similarServer.name}</h3>
                            {similarServer.verified && (
                              <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                              <span>{formatNumber(similarServer.onlineCount)} online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{similarServer.description}</p>
                    </div>
                    
                    <Link 
                      href={`/discover-servers/${similarServer.id}`} 
                      className="block bg-gray-700/50 hover:bg-emerald-500/20 text-center py-3 font-medium text-sm text-emerald-400 transition-colors"
                    >
                      View Server
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Back Button */}
          <div className="mt-12 text-center">
            <button 
              onClick={() => router.push('/discover-servers')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Back to Discover
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-16 py-10 bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <img src="/assets/logo.png" alt="GANGIO" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  GANGIO
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate communication platform for gamers.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Download</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Nitro</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Status</a></li>
                <li><a href="/discover-servers" className="text-gray-400 hover:text-emerald-400 transition-colors">Discover Servers</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Branding</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Newsroom</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Safety</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">Developers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2023 GANGIO. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm mb-2">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm mb-2">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm mb-2">
                Cookie Settings
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm mb-2">
                Guidelines
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 