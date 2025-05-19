'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Sample server data for demonstration
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
  },
  {
    id: '2',
    name: 'Esports Central',
    description: 'The ultimate destination for esports news, tournament info, and finding teams for competitive play.',
    icon: '/assets/gangiobear-gaming.png',
    memberCount: 1435268,
    onlineCount: 69413,
    categories: ['Gaming', 'Esports', 'Competitive'],
    verified: true,
    created: 'March 15th, 2021',
    language: 'English',
  },
  {
    id: '3',
    name: 'GameDev Hub',
    description: 'Connect with game developers, share your projects, get feedback, and collaborate on game jams.',
    icon: '/assets/gangiobear-witch-transparent.png',
    memberCount: 782346,
    onlineCount: 37300,
    categories: ['Game Development', 'Creative', 'Technology'],
    verified: false,
    created: 'June 7th, 2021',
    language: 'English',
  },
  {
    id: '4',
    name: 'RPG Adventurers',
    description: 'Find your party for RPG games, discuss fantasy worlds, share character builds, and join campaigns.',
    icon: '/assets/GangBearHelp-transparent.png',
    memberCount: 567941,
    onlineCount: 28676,
    categories: ['RPG', 'Gaming', 'Fantasy'],
    verified: false,
    created: 'October 23rd, 2021',
    language: 'English',
  },
  {
    id: '5',
    name: 'Mobile Legends',
    description: 'The largest community for Mobile Legends players. Strategy guides, team recruitment, and tournaments.',
    icon: '/assets/gangiobear-mobile.png',
    memberCount: 1204708,
    onlineCount: 85294,
    categories: ['Mobile Gaming', 'MOBA', 'Competitive'],
    verified: true,
    created: 'February 11th, 2021',
    language: 'English',
  },
  {
    id: '6',
    name: 'FPS Masters',
    description: 'Improve your aim, learn tactics, and find squads for your favorite first-person shooter games.',
    icon: '/assets/gangiobear-gaming.png',
    memberCount: 936077,
    onlineCount: 55175,
    categories: ['FPS', 'Gaming', 'Competitive'],
    verified: false,
    created: 'May 30th, 2021',
    language: 'English',
  },
  {
    id: '7',
    name: 'Minecraft Universe',
    description: 'Everything Minecraft! Build showcases, survival tips, redstone tutorials, and server recruitment.',
    icon: '/assets/gangiobear-witch-transparent.png',
    memberCount: 1560708,
    onlineCount: 96434,
    categories: ['Minecraft', 'Building', 'Survival'],
    verified: true,
    created: 'July 19th, 2020',
    language: 'English',
  },
  {
    id: '8',
    name: 'Anime Gamers',
    description: 'For fans of anime-style games and JRPGs. Discuss your favorite titles, characters, and upcoming releases.',
    icon: '/assets/gangiobear-wymsical-forest-transparent.png',
    memberCount: 687941,
    onlineCount: 32676,
    categories: ['Anime', 'JRPG', 'Gaming'],
    verified: false,
    created: 'November 3rd, 2021',
    language: 'English',
  },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Category options
const CATEGORIES = [
  'All',
  'Gaming',
  'Entertainment',
  'Education',
  'Science & Tech',
  'Music',
  'Art',
  'Social',
  'Esports',
  'Anime',
];

export default function DiscoverServers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredServers, setFilteredServers] = useState(SAMPLE_SERVERS);
  const router = useRouter();

  useEffect(() => {
    // Filter servers based on search term and category
    const results = SAMPLE_SERVERS.filter((server) => {
      const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           server.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || server.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredServers(results);
  }, [searchTerm, selectedCategory]);

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
      
      <main className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Community</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover servers where you can connect with gamers who share your interests, from casual gaming to competitive esports.
            </p>
          </motion.div>
          
          {/* Search and Filters */}
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700/50 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search servers..." 
                    className="w-full py-3 px-4 pl-10 bg-gray-700/50 rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64">
                <select 
                  className="w-full py-3 px-4 bg-gray-700/50 rounded-lg border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Server Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServers.map((server, index) => (
              <motion.div
                key={server.id}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden hover:border-emerald-500/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                whileHover={{ y: -5 }}
              >
                {server.banner && (
                  <div className="h-32 w-full relative overflow-hidden">
                    <img 
                      src={server.banner} 
                      alt={server.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden border-2 border-emerald-500/30">
                        <img 
                          src={server.icon} 
                          alt={server.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-xl font-semibold">{server.name}</h3>
                        {server.verified && (
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
                          <span>{formatNumber(server.onlineCount)} online</span>
                        </div>
                        <span>•</span>
                        <span>{formatNumber(server.memberCount)} members</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{server.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {server.categories.map((category, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <div>Created: {server.created}</div>
                    <div>Language: {server.language}</div>
                  </div>
                </div>
                
                <Link href={`/discover-servers/${server.id}`} className="block bg-gray-700/50 hover:bg-emerald-500/20 text-center py-3 font-medium text-sm text-emerald-400 transition-colors">
                  View Server
                </Link>
              </motion.div>
            ))}
          </div>
          
          {filteredServers.length === 0 && (
            <div className="text-center py-16">
              <img src="/assets/gangiobear-witch-transparent.png" alt="No results" className="w-24 h-24 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No servers found</h3>
              <p className="text-gray-400">Try adjusting your search terms or category filter.</p>
            </div>
          )}
          
          {/* Pre-footer banner */}
          <motion.div 
            className="mt-20 py-16 px-8 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-70">
              <img src="/assets/gangiobear-gaming.png" alt="GANGIO Gaming" className="w-full h-full object-contain" />
            </div>
            
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl font-bold mb-4">Create Your Own Server</h2>
              <p className="text-gray-300 mb-8">
                Ready to build your own gaming community? Create a server in just a few clicks and invite your friends to join.
              </p>
              <button 
                onClick={() => router.push('/signup')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          </motion.div>
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
              © 2025 GANGIO. All rights reserved.
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