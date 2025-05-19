'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { FiMessageSquare, FiPlus, FiUser, FiUsers } from 'react-icons/fi';

// Friend interface to match with the friends page
interface Friend {
  id: string;
  name: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'idle' | 'dnd';
  discriminator?: string;
}

export default function DirectMessagesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const router = useRouter();
  
  // Fetch friends from the API
  const fetchFriends = useCallback(async () => {
    if (sessionStatus !== 'authenticated' || !session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/friends?userId=${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      
      const data = await response.json();
      setFriends(Array.isArray(data) ? data : []);
      console.log('Friends loaded:', data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, sessionStatus]);
  
  // Load unread message counts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // For each friend, check if there are unread messages
      const allUnreadCounts: Record<string, number> = {};
      
      // Iterate through localStorage for dm_last_read_* keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dm_last_read_')) {
          const friendId = key.replace('dm_last_read_', '');
          const lastReadTimestamp = parseInt(localStorage.getItem(key) || '0', 10);
          
          // Check if there's a corresponding unread count key
          const unreadCountKey = `dm_unread_count_${friendId}`;
          const unreadCount = parseInt(localStorage.getItem(unreadCountKey) || '0', 10);
          
          if (unreadCount > 0) {
            allUnreadCounts[friendId] = unreadCount;
          }
        }
      }
      
      setUnreadCounts(allUnreadCounts);
    }
  }, []);

  // Initial load - fetch friends
  useEffect(() => {
    // Check authentication status
    if (sessionStatus === 'loading') {
      return; // Still loading, don't redirect yet
    }
    
    // Only fetch friends when authenticated
    if (sessionStatus === 'authenticated' && session?.user?.id) {
      fetchFriends();
    } else {
      // Instead of redirecting immediately, check if we might be using localStorage auth
      const localUser = localStorage.getItem('currentUser');
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          if (userData?.id) {
            // Use localStorage user data for friends API call
            fetch(`/api/friends?userId=${userData.id}`)
              .then(res => res.json())
              .then(data => {
                setFriends(Array.isArray(data) ? data : []);
                setIsLoading(false);
              })
              .catch(err => {
                console.error('Error fetching friends with localStorage auth:', err);
                setIsLoading(false);
              });
          } else {
            setIsLoading(false);
          }
        } catch (e) {
          console.error('Error parsing currentUser from localStorage:', e);
          setIsLoading(false);
        }
      } else {
        // No authentication found - don't redirect, just show empty state
        setIsLoading(false);
      }
    }
  }, [sessionStatus, fetchFriends, router, session?.user?.id]);

  // Handle starting a direct message with a friend
  const handleStartDirectMessage = (friendId: string) => {
    // Don't require session to navigate - allow navigation regardless of auth state
    // This way both next-auth and localStorage auth methods will work
    router.push(`/direct-messages/${friendId}`);
  };
  
  // Handle clicking on the 'Add Friends' button
  const handleAddFriendsClick = () => {
    router.push('/friends');
  };

  // Get status color based on friend status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Use the UniversalSidebarNew component for consistent navigation */}
      <UniversalSidebarNew />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center">
              <FiMessageSquare className="mr-2" /> Direct Messages
            </h1>
            <button 
              onClick={handleAddFriendsClick}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-md text-sm flex items-center transition-colors"
            >
              <FiPlus className="mr-1" /> Add Friends
            </button>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <motion.div
                    key={friend.id}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700/50 hover:border-emerald-500/50 transition-all"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="relative flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden">
                            {friend.avatarUrl ? (
                              <Image 
                                src={friend.avatarUrl} 
                                alt={friend.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-emerald-600">
                                <FiUser className="text-white text-xl" />
                              </div>
                            )}
                          </div>
                          <div 
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-white">{friend.name}</h3>
                            {unreadCounts[friend.id] > 0 && (
                              <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {unreadCounts[friend.id]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 capitalize">{friend.status || 'offline'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-5">
                        <button
                          onClick={() => handleStartDirectMessage(friend.id)}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md flex items-center justify-center transition-colors relative"
                        >
                          <FiMessageSquare className="mr-2" /> Message
                          {unreadCounts[friend.id] > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                              {unreadCounts[friend.id]}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Friends Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">Add some friends to start messaging</p>
                  <button 
                    onClick={handleAddFriendsClick}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white flex items-center mx-auto"
                  >
                    <FiPlus className="mr-2" /> Add Friends
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}