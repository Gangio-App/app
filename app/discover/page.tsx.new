'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { JoinServerModal } from '@/components/JoinServerModal';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiSearch, FiFilter, FiTrendingUp, FiStar, FiUsers } from 'react-icons/fi';
import { BiGame, BiWorld, BiRocket } from 'react-icons/bi';

interface DiscoverServer {
  id: string;
  name: string;
  description: string;
  icon?: string;
  memberCount: number;
  tags?: string[];
  isVerified?: boolean;
  isPartnered?: boolean;
  createdAt: string;
}

export default function DiscoverPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allServers, setAllServers] = useState<DiscoverServer[]>([]);
  const [filteredServers, setFilteredServers] = useState<DiscoverServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
    
    // Fetch discover servers
    fetchServers();
  }, [router]);

  useEffect(() => {
    // Filter servers based on search query and category
    if (allServers.length > 0) {
      let filtered = [...allServers];
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(server => 
          server.name.toLowerCase().includes(query) || 
          server.description.toLowerCase().includes(query) ||
          (server.tags && server.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      }
      
      // Apply category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(server => 
          server.tags && server.tags.includes(selectedCategory)
        );
      }
      
      setFilteredServers(filtered);
    }
  }, [searchQuery, selectedCategory, allServers]);
  
  const fetchServers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all servers directly from the database collection
      const response = await fetch('/api/servers/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch servers');
      }
      
      const data = await response.json();
      setAllServers(data.servers || []);
      setFilteredServers(data.servers || []);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleJoinServer = (serverId: string) => {
    setSelectedServerId(serverId);
    setShowJoinModal(true);
  };
  
  const handleJoinSuccess = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };
  
  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'music', name: 'Music' },
    { id: 'education', name: 'Education' },
    { id: 'science', name: 'Science & Tech' },
    { id: 'art', name: 'Art & Creative' },
    { id: 'community', name: 'Community' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <UniversalSidebarNew onServerClick={handleServerClick} />
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <UniversalSidebarNew onServerClick={handleServerClick} />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header with enhanced animations */}
        <motion.div 
          className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <HiOutlineSparkles className="text-emerald-500 text-2xl" />
              <h1 className="text-3xl font-bold">Discover Servers</h1>
            </div>
            <p className="text-gray-400 mb-6 pl-1">Find communities to join and connect with others</p>
          </motion.div>
          
          {/* Enhanced search bar with animation */}
          <motion.div 
            className="relative max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="absolute left-3 top-3.5 text-gray-400">
              <FiSearch className="h-5 w-5" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for servers..."
              className="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-700 hover:border-gray-600 transition-all shadow-md"
            />
          </motion.div>
          
          {/* Categories with enhanced styling and animations */}
          <motion.div 
            className="mt-6 flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === category.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedCategory(category.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                {category.id === 'all' && <FiFilter className="text-xs" />}
                {category.id === 'gaming' && <BiGame className="text-xs" />}
                {category.id === 'music' && <FiStar className="text-xs" />}
                {category.id === 'education' && <FiTrendingUp className="text-xs" />}
                {category.id === 'science' && <BiRocket className="text-xs" />}
                {category.id === 'art' && <BiWorld className="text-xs" />}
                {category.id === 'community' && <FiUsers className="text-xs" />}
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Server grid with enhanced animations */}
        <motion.div 
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredServers.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1, 1.05, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-medium mb-2">No servers found</h3>
                <p className="text-gray-400 max-w-lg">
                  {searchQuery 
                    ? `No servers match "${searchQuery}". Try a different search or category.` 
                    : "No servers found in this category. Try another one."}
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredServers.map((server, index) => (
                  <motion.div
                    key={server.id}
                    className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 8px 10px -6px rgba(16, 185, 129, 0.2)' }}
                    layout
                  >
                    {/* Server banner/icon */}
                    <div className="h-32 bg-gradient-to-r from-gray-700 to-gray-800 relative flex items-center justify-center overflow-hidden">
                      {server.icon ? (
                        <img 
                          src={server.icon} 
                          alt={server.name} 
                          className="h-full w-full object-cover transition-all duration-200 hover:scale-105"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-2xl font-bold text-white">
                          {server.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex space-x-1">
                        {server.isVerified && (
                          <div className="bg-blue-500 rounded-full p-1" title="Verified Server">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {server.isPartnered && (
                          <div className="bg-purple-500 rounded-full p-1" title="Partnered Server">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Created date as small badge */}
                      {server.createdAt && (
                        <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded text-gray-300 backdrop-blur-sm">
                          {new Date(server.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white">{server.name}</h3>
                        <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded border border-emerald-600/30 font-medium">
                          {server.memberCount} {server.memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{server.description}</p>
                      
                      {/* Tags */}
                      {server.tags && server.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {server.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-700/70 px-2 py-1 rounded-full text-gray-300 border border-gray-600/50">
                              #{tag}
                            </span>
                          ))}
                          {server.tags.length > 3 && (
                            <span className="text-xs bg-gray-700/70 px-2 py-1 rounded-full text-gray-300 border border-gray-600/50">
                              +{server.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleJoinServer(server.id)}
                          className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors font-medium"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Join Server
                        </motion.button>
                        <motion.button
                          onClick={() => window.open(`/servers/${server.id}/preview`, '_blank')}
                          className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          title="Preview Server"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Join Server Modal */}
      {showJoinModal && (
        <JoinServerModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}
