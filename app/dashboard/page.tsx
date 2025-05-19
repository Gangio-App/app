'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, getCollection } from '@/lib/db';
import { redirect } from 'next/navigation';
import { FriendModal } from '@/components/ui/FriendModal';
import { WikiModal } from '@/components/ui/WikiModal';
import { DonateModal } from '@/components/ui/DonateModal';
import { FriendsContainer } from '@/components/FriendsContainer';
import { JoinServerModal } from '@/components/JoinServerModal';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { SteamPlayerSummary, SteamGame, formatPlaytime, getSteamGameImageUrl } from '@/lib/steamApi';
import { useTranslations } from '@/hooks/useTranslations';

// Icons
import { FiPlus, FiUsers, FiMessageSquare, FiSettings, FiBook, FiStar, FiTrendingUp, FiCpu, FiClock, FiExternalLink } from 'react-icons/fi';
import { BiGame, BiJoystick, BiWorld, BiRocket, BiTrophy } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';
import { SiSteam } from 'react-icons/si';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      // Redirect to landing page if not logged in
      router.push('/');
      return;
    }
    
    // Simulate loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced loading time
    
    return () => clearTimeout(timeout);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div 
          className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!currentUser) {
    return null; // This shouldn't happen due to the redirect, but just in case
  }

  return <UserHomePage user={currentUser} />;
}

function UserHomePage({ user }: { user: any }) {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinServerModal, setShowJoinServerModal] = useState(false);
  const [showFriendsContainer, setShowFriendsContainer] = useState(false);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('home');
  const [steamData, setSteamData] = useState<SteamPlayerSummary | null>(null);
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const serversPerPage = 9;
  const router = useRouter();
  const { t } = useTranslations();

  // Function to fetch Steam data for the user
  const fetchSteamData = async () => {
    if (!user) return;
    
    try {
      setLoadingSteam(true);
      // Add timestamp for cache busting and user ID for authentication
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/steam/profile?userId=${user.id}&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          // Add authorization header with user ID
          'Authorization': `Bearer ${user.id}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSteamData(data);
        console.log('Fetched Steam data:', data);
      } else if (response.status !== 404) {
        // 404 means no Steam ID connected, which is fine
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error fetching Steam data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching Steam data:', error);
    } finally {
      setLoadingSteam(false);
    }
  };

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        // Make sure we pass the userId as a URL parameter with timestamp for cache busting
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/servers?userId=${user.id}&t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server response error: ${response.status}`, errorText);
          throw new Error(`Failed to fetch servers: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        // The API returns an array directly
        const serverArray = Array.isArray(data) ? data : [];
        setServers(serverArray);
        console.log('Fetched servers:', serverArray);
      } catch (error) {
        console.error('Error fetching servers:', error);
        setServers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchServers();
    fetchSteamData(); // Fetch Steam data when component mounts
  }, [user]);

  const handleCreateServer = () => {
    router.push('/create-server');
  };

  const handleJoinServer = () => {
    setShowJoinServerModal(true);
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  const toggleFriendsContainer = () => {
    setShowFriendsContainer(prev => !prev);
  };

  const toggleWikiModal = () => {
    setShowWikiModal(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Sidebar */}
      <UniversalSidebarNew 
        activeServerId={activeCategory}
        onServerClick={handleServerClick}
        onCreateServer={handleCreateServer}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm rounded-tl-xl rounded-bl-xl overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-gray-800/70 to-gray-900/70 p-6 rounded-xl border border-gray-700/50 shadow-lg">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    {t('dashboard.welcomeBack', { name: user.name })}
                  </span>
                </h1>
                <p className="text-gray-300">{t('app.tagline')}</p>
              </div>
              <div className="relative w-24 h-24 hidden md:block">
                <Image 
                  src="/assets/welcome.png" 
                  alt="Welcome" 
                  width={96} 
                  height={96} 
                  className="object-contain"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div 
                  className="h-12 w-12 rounded-full border-t-3 border-b-3 border-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.length > 0 ? (
                  servers
                    .slice((currentPage - 1) * serversPerPage, currentPage * serversPerPage)
                    .map(server => (
                    <motion.div 
                      key={server.id}
                      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 border border-gray-700/50 transition-all duration-300"
                      onClick={() => handleServerClick(server.id)}
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mr-4 overflow-hidden border border-emerald-500/30">
                          {server.icon ? (
                            <img 
                              src={server.icon.startsWith('data:') ? server.icon : `/api/servers/${server.id}/icon`} 
                              alt={server.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = server.name.substring(0, 2).toUpperCase();
                              }}
                            />
                          ) : (
                            <span className="text-xl font-bold text-emerald-400">{server.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{server.name}</h3>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${server.ownerId === user.id ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <p className="text-sm text-gray-400">{server.ownerId === user.id ? 'Owner' : 'Member'}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                        {server.description || 'No description available.'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <FiUsers className="mr-1" /> {Math.floor(Math.random() * 20) + 2} {t('friends.title').toLowerCase()}
                        </span>
                        <span className="flex items-center">
                          <FiMessageSquare className="mr-1" /> {Math.floor(Math.random() * 10) + 1} {t('messages.title').toLowerCase()}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-10 text-center border border-gray-700/30 shadow-lg">
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <IoGameControllerOutline className="w-10 h-10 text-emerald-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{t('dashboard.noServerActivity')}</h3>
                    <p className="text-gray-400 mb-6">{t('dashboard.noServerActivity')}</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <motion.button 
                        onClick={handleCreateServer}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 flex items-center justify-center shadow-lg shadow-emerald-600/20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiPlus className="mr-2" /> {t('dashboard.createServer')}
                      </motion.button>
                      <motion.button 
                        onClick={handleJoinServer}
                        className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center border border-gray-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiUsers className="mr-2" /> {t('dashboard.joinServer')}
                      </motion.button>
                    </div>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {servers.length > serversPerPage && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      &laquo; Prev
                    </button>
                    
                    {Array.from({ length: Math.ceil(servers.length / serversPerPage) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(servers.length / serversPerPage)))}
                      disabled={currentPage === Math.ceil(servers.length / serversPerPage)}
                      className={`px-3 py-1 rounded-md ${currentPage === Math.ceil(servers.length / serversPerPage) ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                      Next &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <HiOutlineSparkles className="mr-2 text-emerald-400" /> {t('dashboard.quickActions')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.button 
                  onClick={toggleWikiModal}
                  className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex items-center border border-gray-700/50"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <FiBook className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold mb-1">Wiki</span>
                    <span className="text-sm text-gray-400">Learn about Gangio features</span>
                  </div>
                </motion.button>
                <motion.button 
                  onClick={handleCreateServer}
                  className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex items-center border border-gray-700/50"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <FiPlus className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold mb-1">{t('dashboard.createServer')}</span>
                    <span className="text-sm text-gray-400">{t('app.tagline')}</span>
                  </div>
                </motion.button>
                <motion.button 
                  onClick={handleJoinServer}
                  className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex items-center border border-gray-700/50"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <BiJoystick className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold mb-1">{t('dashboard.joinServer')}</span>
                    <span className="text-sm text-gray-400">{t('dashboard.joinServer')}</span>
                  </div>
                </motion.button>
                <motion.button 
                  onClick={() => router.push('/friends')}
                  className="p-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 flex items-center border border-gray-700/50"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                    <FiUsers className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold mb-1">{t('dashboard.findFriends')}</span>
                    <span className="text-sm text-gray-400">{t('friends.addFriend')}</span>
                  </div>
                </motion.button>
              </div>
            </div>
            
            {/* Recent Activity Section */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiClock className="mr-2 text-emerald-400" /> {t('dashboard.recentActivity')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center">
                      <FiUsers className="mr-2 text-emerald-400" /> {t('dashboard.onlineFriends')}
                    </h3>
                    <button 
                      className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                      onClick={toggleFriendsContainer}
                    >
                      {t('dashboard.viewAll')}
                    </button>
                  </div>
                  <div className="text-center py-4 text-gray-400">
                    {t('dashboard.noOnlineFriends')}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center">
                      <FiMessageSquare className="mr-2 text-emerald-400" /> {t('dashboard.pendingRequests')}
                    </h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                      {t('dashboard.viewAll')}
                    </button>
                  </div>
                  <div className="text-center py-4 text-gray-400">
                    {t('dashboard.noPendingRequests')}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center">
                      <FiTrendingUp className="mr-2 text-emerald-400" /> {t('dashboard.serverActivity')}
                    </h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                      {t('dashboard.viewAll')}
                    </button>
                  </div>
                  <div className="text-center py-4 text-gray-400">
                    {t('dashboard.noServerActivity')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showJoinServerModal && (
        <JoinServerModal 
          isOpen={showJoinServerModal} 
          onClose={() => setShowJoinServerModal(false)} 
        />
      )}
      
      {showFriendsContainer && (
        <FriendsContainer 
          isOpen={showFriendsContainer} 
          onClose={() => setShowFriendsContainer(false)} 
        />
      )}
      
      {showWikiModal && (
        <WikiModal 
          isOpen={showWikiModal} 
          onClose={() => setShowWikiModal(false)} 
        />
      )}
    </div>
  );
}
