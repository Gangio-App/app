'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { JoinServerModal } from '@/components/JoinServerModal';
import { FriendsContainer } from '@/components/FriendsContainer';
import { WikiModal } from '@/components/ui/WikiModal';
import ThreeBackground from '@/components/ui/ThreeBackground';
import { UniversalSidebar } from '@/components/UniversalSidebar';
import NavigationBar from '@/components/NavigationBar';

// Define the interface for the user prop
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinServerModal, setShowJoinServerModal] = useState(false);
  const [showFriendsContainer, setShowFriendsContainer] = useState(false);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
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
        const serverArray = Array.isArray(data) ? data : [];
        setServers(serverArray);
        console.log('Fetched servers:', serverArray);
      } catch (error) {
        console.error('Error fetching servers:', error);
        setServers([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.id) {
      fetchServers();
    }
  }, [user?.id]);

  const handleCreateServer = () => {
    router.push('/create-server');
  };

  const handleJoinServer = () => {
    setShowJoinServerModal(true);
  };

  const handleStartDirectMessage = (friendId: string) => {
    router.push(`/direct-messages?friendId=${friendId}`);
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      <NavigationBar currentUser={user} onLogout={onLogout} />
      
      <div className="flex flex-1 pt-16">
        <ThreeBackground preset="dashboard" />
        
        <UniversalSidebar
          activeServerId="home"
          onCreateServer={handleCreateServer}
          onServerClick={handleServerClick}
        />
        
        <motion.div 
          className="flex-1 flex items-center justify-center p-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm p-10 rounded-xl shadow-2xl border border-gray-700/50 text-center mb-10"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.7, type: 'spring' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Welcome, {user.name}!
            </motion.h1>
            
            <motion.p 
              className="text-gray-400 mb-8 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              What would you like to do today?
            </motion.p>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <motion.button
                onClick={handleCreateServer}
                className="flex flex-col items-center p-6 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Create a Server</h3>
                <p className="text-sm text-gray-400">Start your own community</p>
              </motion.button>
              
              <motion.button
                onClick={handleJoinServer}
                className="flex flex-col items-center p-6 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Join a Server</h3>
                <p className="text-sm text-gray-400">Enter an invite code</p>
              </motion.button>
            </motion.div>

            <motion.div 
              className="mt-8 pt-8 border-t border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <h3 className="text-lg font-medium mb-4">Quick Access</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  className="flex flex-col items-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setShowFriendsContainer(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 mb-2 flex items-center justify-center cursor-pointer text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">
                    Friends
                  </span>
                </motion.button>
                
                <motion.button
                  className="flex flex-col items-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setShowWikiModal(true)}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 mb-2 flex items-center justify-center cursor-pointer text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">
                    Wiki
                  </span>
                </motion.button>
              </div>
            </motion.div>
            
            {servers.length > 0 && (
              <motion.div 
                className="mt-8 pt-8 border-t border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.9 }}
              >
                <h3 className="text-lg font-medium mb-4">Your Servers</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {servers.slice(0, 5).map((server, i) => (
                    <motion.div 
                      key={server.id}
                      className="w-16 flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.0 + (i * 0.1) }}
                      whileHover={{ y: -5 }}
                      onClick={() => router.push(`/servers/${server.id}`)}
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 flex items-center justify-center cursor-pointer">
                        {server.icon ? (
                          <img 
                            src={server.icon} 
                            alt={server.name} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-semibold">
                            {server.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-300 truncate w-full text-center">
                        {server.name}
                      </span>
                    </motion.div>
                  ))}
                  
                  {servers.length > 5 && (
                    <motion.div 
                      className="w-16 flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-700 mb-2 flex items-center justify-center cursor-pointer text-gray-400">
                        +{servers.length - 5}
                      </div>
                      <span className="text-xs text-gray-300 truncate w-full text-center">
                        More
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {showFriendsContainer && (
        <FriendsContainer 
          onClose={() => setShowFriendsContainer(false)} 
          onStartChat={handleStartDirectMessage}
        />
      )}
      {showWikiModal && <WikiModal isOpen={showWikiModal} onClose={() => setShowWikiModal(false)} />}
      {showJoinServerModal && (
        <JoinServerModal 
          isOpen={showJoinServerModal} 
          onClose={() => setShowJoinServerModal(false)} 
          onSuccess={(serverId) => router.push(`/servers/${serverId}`)}
        />
      )}
    </div>
  );
} 