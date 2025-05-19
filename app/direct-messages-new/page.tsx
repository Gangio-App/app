'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom, Chat, RoomAudioRenderer, LayoutContextProvider } from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { FiMessageSquare, FiSend, FiSmile, FiImage, FiPaperclip, FiMoreVertical } from 'react-icons/fi';

// Types
interface Friend {
  id: string;
  name: string;
  email: string;
  image?: string;
  avatarUrl?: string;
  steamAvatarUrl?: string;
}

// Custom Chat Container - a styled wrapper around LiveKit's Chat component
const CustomChatContainer: React.FC<{ selectedFriend: Friend | null }> = ({ selectedFriend }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center bg-gray-800/30 backdrop-blur-sm">
        {selectedFriend && (
          <>
            <div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden border-2 border-gray-700/70">
              <Image
                src={selectedFriend.avatarUrl || selectedFriend.steamAvatarUrl || selectedFriend.image || '/default-avatar.png'}
                alt={selectedFriend.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{selectedFriend.name}</h3>
              <p className="text-xs text-gray-400">Online • Secure LiveKit Chat</p>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
              <FiMoreVertical className="text-gray-400" />
            </button>
          </>
        )}
      </div>
      
      {/* LiveKit Chat component wrapped in custom styling */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-900/70 to-gray-800/70 backdrop-blur-sm">
        <div className="h-full overflow-hidden">
          <style jsx global>{
            `
            /* Custom styling for LiveKit Chat */
            .lk-chat {
              background: transparent !important;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .lk-chat-messages {
              flex: 1;
              padding: 1rem;
              overflow-y: auto;
            }
            .lk-chat-entry {
              margin-bottom: 0.75rem;
              background: rgba(55, 65, 81, 0.5) !important;
              border-radius: 0.5rem !important;
              padding: 0.75rem !important;
              border: none !important;
            }
            .lk-chat-entry[data-local="true"] {
              background: rgba(5, 150, 105, 0.4) !important;
            }
            .lk-chat-entry[data-local="true"] .lk-chat-entry-metadata {
              justify-content: flex-end;
            }
            .lk-chat-entry[data-local="true"] .lk-chat-entry-content {
              justify-content: flex-end;
            }
            .lk-chat-entry-bubble {
              background: transparent !important;
              padding: 0 !important;
              border: none !important;
            }
            .lk-chat-form {
              background: rgba(31, 41, 55, 0.5) !important;
              padding: 0.75rem !important;
              border-top: 1px solid rgba(75, 85, 99, 0.5) !important;
            }
            .lk-chat-form-input {
              background: rgba(55, 65, 81, 0.5) !important;
              border-radius: 0.5rem !important;
              border: none !important;
              color: white !important;
            }
            .lk-chat-form-button {
              background: rgb(5, 150, 105) !important;
              border-radius: 9999px !important;
              width: 2.5rem !important;
              height: 2.5rem !important;
            }
            .lk-chat-form-button:hover {
              background: rgb(4, 120, 87) !important;
            }
            .lk-chat-form-button:disabled {
              background: rgba(75, 85, 99, 0.5) !important;
              opacity: 0.7;
            }
            `
          }</style>
          <Chat />
        </div>
      </div>
    </div>
  );
};

const DirectMessagesNewPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Initialize authentication variables
  useEffect(() => {
    let userId: string | null = null;
    let token: string | null = null;

    // First try NextAuth session
    if (session?.user?.id) {
      userId = session.user.id;
      console.log('Using NextAuth session for authentication');
    } 
    // Then try localStorage
    else if (typeof window !== 'undefined') {
      const localUserStr = localStorage.getItem('currentUser');
      if (localUserStr) {
        try {
          const localUserData = JSON.parse(localUserStr);
          userId = localUserData?.id || null;
          if (userId) {
            // Check for authToken first (used in other parts of the app)
            token = localStorage.getItem('authToken');
            // If not found, try 'token' as fallback
            if (!token) {
              token = localStorage.getItem('token');
            }
            console.log('Using localStorage for authentication, userId:', userId);
            console.log('Auth token found:', !!token);
          }
        } catch (e) {
          console.error('Failed to parse currentUser from localStorage:', e);
        }
      }
    }

    setCurrentUser(userId ? { id: userId } : null);
    setAuthToken(token);
  }, [session]);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    // Use either NextAuth session or JWT auth
    const userId = session?.user?.id || currentUser?.id;
    if (!userId) {
      console.log('Cannot fetch friends: No user ID available');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Fetching friends for user: ${userId}`);
      
      // Prepare headers
      const headers: any = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('Using Bearer token for friends API request');
      }
      
      const response = await axios.get(`/api/friends?userId=${userId}`, { headers });
      console.log(`Fetched ${response.data.length} friends`);
      setFriends(response.data);
    } catch (err: any) {
      console.error('Error fetching friends:', err);
      setError(err.response?.data?.error || 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, currentUser?.id, authToken]);

  // Get LiveKit token when a friend is selected
  const getLivekitToken = useCallback(async (friendId: string) => {
    // Use either NextAuth session or JWT auth
    const userId = session?.user?.id || currentUser?.id;
    const userName = session?.user?.name || currentUser?.name || 'User';
    
    if (!userId) {
      console.error('Cannot get LiveKit token: No user ID available');
      return;
    }
    
    try {
      // Create a unique room name for this direct message conversation
      // Sort the IDs to ensure the same room name regardless of who initiates
      const participants = [userId, friendId].sort();
      const roomName = `dm-${participants[0]}-${participants[1]}`;
      
      console.log(`Getting LiveKit token for room: ${roomName}, user: ${userId}`);
      
      // Prepare headers
      const headers: any = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
        console.log('Using Bearer token for LiveKit token request');
      }
      
      const response = await axios.get(
        `/api/livekit/token?roomName=${roomName}&userId=${userId}&userName=${encodeURIComponent(userName)}`,
        { headers }
      );
      
      console.log('LiveKit token received successfully');
      setLivekitToken(response.data.token);
    } catch (err: any) {
      console.error('Error getting LiveKit token:', err);
      setError(err.response?.data?.error || 'Failed to get chat token');
    }
  }, [session?.user, currentUser, authToken]);

  // Handle friend selection
  const handleSelectFriend = async (friend: Friend) => {
    setSelectedFriend(friend);
    await getLivekitToken(friend.id);
  };

  // Fetch friends on component mount
  useEffect(() => {
    // Check authentication status
    if (status === 'loading') {
      console.log('NextAuth session is still loading');
      return; // Still loading, don't redirect yet
    }
    
    // Check if we have a user ID from either auth method
    const hasUserId = session?.user?.id || currentUser?.id;
    
    if (hasUserId) {
      console.log('User is authenticated, fetching friends');
      fetchFriends();
    } else if (status === 'unauthenticated' && !currentUser?.id) {
      console.log('No authentication found, redirecting to login');
      setLoading(false);
      router.push('/login');
    }
  }, [status, session?.user?.id, currentUser?.id, fetchFriends, router]);

  // Debug authentication status
  useEffect(() => {
    console.log('Authentication status:', {
      nextAuth: status,
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.id,
      hasAuthToken: !!authToken
    });
  }, [status, session, currentUser, authToken]);

  // Handle leave chat
  const handleLeaveChat = () => {
    setSelectedFriend(null);
    setLivekitToken(null);
  };

  // Get avatar URL for a friend
  const getAvatarUrl = (friend: Friend) => {
    return friend.avatarUrl || friend.steamAvatarUrl || friend.image || '/default-avatar.png';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (loading) {
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
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Universal Sidebar */}
      <UniversalSidebarNew />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Friends sidebar */}
        <div className="w-72 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 flex flex-col">
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-xl font-bold flex items-center">
              <FiMessageSquare className="mr-2 text-emerald-500" />
              Direct Messages
            </h2>
            <p className="text-sm text-gray-400">Select a friend to start chatting</p>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {friends.length === 0 && !loading ? (
              <div className="p-6 text-center text-gray-400 mt-10">
                <div className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="text-2xl text-emerald-500" />
                </div>
                <p className="mb-3">No friends found</p>
                <Link href="/friends" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium hover:underline mt-2 inline-block">
                  Add Friends
                </Link>
              </div>
            ) : (
              <ul className="p-2">
                {friends.map((friend) => (
                  <motion.li 
                    key={friend.id}
                    className={`p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer flex items-center mb-1 transition-all ${selectedFriend?.id === friend.id ? 'bg-gray-700/70 shadow-lg' : ''}`}
                    onClick={() => handleSelectFriend(friend)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden border-2 border-gray-700/70">
                      <Image
                        src={getAvatarUrl(friend)}
                        alt={friend.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-xs text-gray-400 truncate">{friend.email}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-700/50">
            <Link 
              href="/dashboard" 
              className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-600/70 rounded-lg text-center block transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-850/30 backdrop-blur-sm">
          {selectedFriend && livekitToken ? (
            <LiveKitRoom
              token={livekitToken}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
              connect={true}
              data-lk-theme="default"
            >
              <LayoutContextProvider>
                <CustomChatContainer selectedFriend={selectedFriend} />
                <RoomAudioRenderer />
              </LayoutContextProvider>
            </LiveKitRoom>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <div className="text-center max-w-md p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMessageSquare className="text-4xl text-emerald-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">Select a friend to start chatting</h3>
                <p className="text-gray-400 mb-6">Your messages will be private and secure with LiveKit's end-to-end encryption</p>
                <Link 
                  href="/friends" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600/80 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <FiMessageSquare className="mr-2" />
                  Find Friends to Chat With
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessagesNewPage;
