'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PusherJsClient from 'pusher-js';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { UniversalSidebarNew } from './UniversalSidebarNew';

// Dynamically import components to avoid SSR issues
const ServerListContainer = dynamic(() => import('./ServersList').then(mod => ({ default: mod.ServerListContainer })), { ssr: false });
const MembersListContainer = dynamic(() => import('./MembersList').then(mod => ({ default: mod.MembersListContainer })), { ssr: false });
const ChatRoom = dynamic(() => import('./ChatRoom').then(mod => ({ default: mod.ChatRoom })), { ssr: false });
const LiveKitContainer = dynamic(() => import('./LiveKitContainer').then(mod => ({ default: mod.default })), { ssr: false });
const ServerSettingsButton = dynamic(() => import('./ServerSettingsButton').then(mod => ({ default: mod.ServerSettingsButton })), { ssr: false });
const ServerBanner = dynamic(() => import('./ServerBanner').then(mod => ({ default: mod.ServerBanner })), { ssr: false });
const ChannelModal = dynamic(() => import('./ChannelModal').then(mod => ({ default: mod.ChannelModal })), { ssr: false });
const AccountPanel = dynamic(() => import('./settings/AccountPanel').then(mod => ({ default: mod.default })), { ssr: false });
const ChannelListModal = dynamic(() => import('./ChannelListModal').then(mod => ({ default: mod.ChannelListModal })), { ssr: false });

interface ChannelProps {
  serverId: string;
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
  serverId: string;
  categoryId: string;
  type: 'text' | 'voice' | 'video';
  position: number;
  icon?: string; // Custom icon URL
}

interface Category {
  id: string;
  name: string;
  serverId: string;
  position: number;
}

interface Server {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  isOfficial?: boolean;
  ownerId: string;
  defaultChannelId?: string;
  channels?: Channel[];
  categories?: Category[];
  members?: any[];
}

interface User {
  id: string;
  name: string;
  discriminator: string;
  avatarUrl?: string;
}

interface UserPermissions {
  hasAccess: boolean;
  isOwner: boolean;
  roles: string[];
  permissions: string[];
}

// Update type definitions
interface ChatRoomProps {
  channelId: string;
  serverId: string;
  currentUser: User | null;
  channelName: string;
  pusherClient: PusherJsClient | null;
  pusherSocketId: string | null;
}

interface ServerSettingsButtonProps {
  serverId: string;
  isOwner: boolean;
}

interface ServerBannerProps {
  name: string;
  banner?: string;
  isOfficial: boolean;
  height: string;
}

interface ChannelModalProps {
  serverId: string;
  onClose: () => void;
  onChannelCreated: (channelId: string) => void;
}

export default function Channel({ serverId, channelId }: ChannelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channelsByCategory, setChannelsByCategory] = useState<Record<string, Channel[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showChannelListModal, setShowChannelListModal] = useState(false);
  const [showMobileMembersList, setShowMobileMembersList] = useState(false); // New state for mobile members list
  
  // Pusher state
  const [pusherClient, setPusherClient] = useState<PusherJsClient | null>(null);
  const [pusherSocketId, setPusherSocketId] = useState<string | null>(null);

  const router = useRouter();

  // Pusher Client Initialization and Management Effect
  useEffect(() => {
    if (!currentUser) {
      if (pusherClient) {
        console.log('[Pusher] Disconnecting: No current user.');
        pusherClient.disconnect();
        setPusherClient(null);
        setPusherSocketId(null);
      }
      return;
    }

    if (!pusherClient && currentUser && process.env.NEXT_PUBLIC_PUSHER_APP_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.log('[Pusher] Initializing client...');
      const client = new PusherJsClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: '/api/pusher/auth',
        // If your auth endpoint needs user-specific data, pass it here or modify auth logic
        // auth: { params: { userId: currentUser.id } } 
      });

      client.connection.bind('connected', () => {
        console.log('[Pusher] Connected. Socket ID:', client.connection.socket_id);
        setPusherSocketId(client.connection.socket_id);
      });

      client.connection.bind('error', (err: any) => {
        console.error('[Pusher] Connection Error:', err);
        if (err.error?.data?.code === 4004) {
          console.error('[Pusher] Error 4004: App not found or cluster mismatch. Check PUSHER_APP_ID and NEXT_PUBLIC_PUSHER_CLUSTER.');
        }
        // Potentially set error state to inform user or retry logic
      });

      client.connection.bind('disconnected', () => {
        console.log('[Pusher] Disconnected.');
        setPusherSocketId(null);
        // PusherJS attempts to reconnect automatically by default.
        // You might want to setPusherClient(null) if you want to force re-initialization 
        // on next currentUser change, but typically not needed.
      });
      
      setPusherClient(client);
    }

    // Cleanup function for when the component unmounts or currentUser changes
    return () => {
      // This check ensures we only try to disconnect if the client was initialized by this effect instance
      // and specifically if currentUser is becoming null or component is truly unmounting with an active client.
      if (pusherClient && (!currentUser || (currentUser && pusherClient.connection.state !== 'disconnected'))) {
         // The second part of the OR condition above might be too aggressive if component unmounts for other reasons.
         // Simpler: if pusherClient exists and we are cleaning up, disconnect.
         // However, if currentUser is still valid, and this is just a re-render based cleanup, 
         // we might not want to disconnect.
         // The dependency array [currentUser, pusherClient] (if pusherClient was added)
         // or just [currentUser] means this cleanup runs if currentUser changes.
         // If currentUser becomes null, the top block handles disconnect.
         // If component unmounts, this cleanup must run.
      }
    };
  }, [currentUser]); // Primary dependency is currentUser

  // Effect for unmounting the component itself, ensuring pusher disconnects.
  useEffect(() => {
    return () => {
      if (pusherClient) {
        console.log('[Pusher] Channel component unmounting, disconnecting client.');
        pusherClient.disconnect();
        // setPusherClient(null); // Not strictly necessary as component is gone
        // setPusherSocketId(null);
      }
    };
  }, [pusherClient]); // This effect runs only if the pusherClient instance itself changes or on unmount

  // Check user authentication
  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setError('Invalid user data. Please log in again.');
        setCurrentUser(null);
      }
    } else {
      setError('You must be logged in to view this page');
      setCurrentUser(null);
    }
  }, [router]);

  // Fetch server info and validate access
  useEffect(() => {
    if (!serverId || !currentUser) {
      if (!currentUser && !loading) {
        return;
      }
      return;
    }

    const fetchServerAndValidateAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // Add authorization header with userId for better authentication
        const headers = {
          'Authorization': `Bearer ${currentUser.id}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };

        // Validate server access with proper authentication
        console.log(`[Channel Component] Checking access for server: ${serverId} with userId: ${currentUser.id}`);
        const accessRes = await fetch(`/api/servers/${serverId}/access-check?userId=${currentUser.id}&_t=${timestamp}`, {
          headers,
          cache: 'no-store'
        });
        
        if (!accessRes.ok) {
          console.error(`[Channel Component] Server access check failed with status: ${accessRes.status}`);
          try {
            // Try to get more detailed error information from the response
            const errorData = await accessRes.text();
            console.error('[Channel Component] Server access error details:', errorData);
          } catch (textError) {
            console.error('[Channel Component] Could not parse error response:', textError);
          }
          
          if (accessRes.status === 403) {
            throw new Error('You do not have access to this server');
          } else if (accessRes.status === 404) {
            throw new Error('Server not found');
          } else if (accessRes.status === 401) {
            throw new Error('Authentication required. Please log in again.');
          } else {
            throw new Error(`Failed to validate server access (Status: ${accessRes.status})`);
          }
        }
        
        const accessData = await accessRes.json();
        if (!accessData.hasAccess) {
          setError('You do not have access to this server');
          setLoading(false);
          return;
        }

        setUserPermissions(accessData);

        // Fetch server details with proper authentication
        console.log(`[Channel Component] Fetching server details for: ${serverId}`);
        const serverRes = await fetch(`/api/servers/${serverId}?userId=${currentUser.id}&_t=${timestamp}`, {
          headers,
          cache: 'no-store'
        });
        
        if (!serverRes.ok) {
          throw new Error('Failed to fetch server details');
        }
        
        const serverData = await serverRes.json();
        console.log('[Channel Component] Fetched Server Data:', serverData);
        setServer(serverData.server);

        // Initialize expanded categories
        const initialExpandedState: Record<string, boolean> = {};
        if (serverData.server.categories) {
          serverData.server.categories.forEach((category: Category) => {
            initialExpandedState[category.id] = true;
          });
          setExpandedCategories(initialExpandedState);
        }

        // Group channels by category
        if (serverData.server.channels && serverData.server.categories) {
          // Organize channels by category
          const channelMap: Record<string, Channel[]> = {};
          
          // Ensure we have valid arrays to work with
          const validCategories = Array.isArray(serverData.server.categories) ? serverData.server.categories : [];
          const validChannels = Array.isArray(serverData.server.channels) ? 
            serverData.server.channels.filter((c: any) => c && typeof c === 'object') : [];
          
          // Initialize categories
          validCategories.forEach((category: Category) => {
            if (category && category.id) {
              channelMap[category.id] = [];
            }
          });
          
          // Add uncategorized category
          channelMap['uncategorized'] = [];
          
          // Sort channels into categories
          validChannels.forEach((channel: Channel) => {
            // Skip invalid channels
            if (!channel) return;
            
            if (channel.categoryId && channelMap[channel.categoryId]) {
              channelMap[channel.categoryId].push(channel);
            } else {
              channelMap['uncategorized'].push(channel);
            }
          });
          
          // Sort channels by position within each category
          Object.keys(channelMap).forEach(categoryId => {
            channelMap[categoryId].sort((a: Channel, b: Channel) => (a.position || 0) - (b.position || 0));
          });
          
          console.log('[Channel Component] Grouped Channels by Category:', channelMap);
          setChannelsByCategory(channelMap);
        } else {
           console.warn('[Channel Component] Server data missing channels or categories for grouping.');
        }

        // Fetch channel details
        if (channelId) {
          const currentChannelDetails = serverData.server.channels?.find((ch: Channel) => ch.id === channelId);
          if (currentChannelDetails) {
            setChannel(currentChannelDetails);
            
            if (currentChannelDetails.type === 'voice' || currentChannelDetails.type === 'video') {
            try {
              const roomName = `chat_${serverId}_${channelId}`;
              const tokenRes = await fetch(`/api/livekit-token?roomName=${encodeURIComponent(roomName)}&participantName=${encodeURIComponent(currentUser.name || currentUser.id)}`);
              if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                setLivekitToken(tokenData.token);
              } else {
                console.error('Failed to fetch LiveKit token:', tokenRes.statusText);
              }
              } catch (error) {
                console.error('Error fetching LiveKit token:', error);
              }
            } else {
              setLivekitToken(null);
            }
          } else {
             console.warn(`Channel with ID ${channelId} not found in server details.`)
             setError(`Channel not found. Please select a valid channel.`);
          }
        } else if (serverData.server.defaultChannelId) {
          router.push(`/servers/${serverId}/channels/${serverData.server.defaultChannelId}`);
        } else if (serverData.server.channels && serverData.server.channels.length > 0) {
          const firstChannel = serverData.server.channels.sort((a: Channel,b: Channel) => (a.position || 0) - (b.position || 0))[0];
          router.push(`/servers/${serverId}/channels/${firstChannel.id}`);
        } else {
          console.log("No channels found in this server.");
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load channel data');
      } finally {
        setLoading(false);
      }
    };

    fetchServerAndValidateAccess();
  }, [serverId, channelId, currentUser, router]);

  // Channel data is now handled in the fetchServerAndValidateAccess function

  const handleChannelCreated = (newChannel: Channel) => {
    setChannelsByCategory(prev => {
      const updated = { ...prev };
      const categoryKey = newChannel.categoryId || 'uncategorized';
      if (!updated[categoryKey]) {
        updated[categoryKey] = [];
      }
      updated[categoryKey] = [...updated[categoryKey], newChannel].sort((a,b) => (a.position || 0) - (b.position || 0));
      return updated;
    });
    
    setServer(prevServer => {
      if (!prevServer) return null;
      return {
        ...prevServer,
        channels: [...(prevServer.channels || []), newChannel].sort((a,b) => (a.position || 0) - (b.position || 0))
      };
    });

    router.push(`/servers/${serverId}/channels/${newChannel.id}`);
    setShowChannelModal(false);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const canCreateChannel = () => {
    if (!currentUser || !server || !userPermissions) return false;
    return userPermissions.isOwner || 
           userPermissions.permissions.includes('MANAGE_CHANNELS') || 
           userPermissions.permissions.includes('ADMINISTRATOR');
  };

  const getChannelIcon = (channel: Channel) => {
    // Ensure channel is defined
    if (!channel) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // If channel has a custom icon, use it
    if (channel.icon) {
      return (
        <div className="h-4 w-4 flex-shrink-0 relative overflow-hidden rounded-full">
          <Image 
            src={channel.icon} 
            alt={channel.name} 
            width={16} 
            height={16} 
            className="object-cover"
          />
        </div>
      );
    }

    // Otherwise use default icons based on channel type
    switch (channel.type) {
      case 'voice':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default: // text channel
        // Check if it's a specific type of text channel by name
        if (channel.name.includes('announcement')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          );
        } else if (channel.name.includes('welcome')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          );
        } else if (channel.name.includes('rules')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
          );
        } else {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          );
        }
    }
  };

  const renderChannelContent = () => {
    if (!channel) return null;
    
    if (channel.type === 'voice' || channel.type === 'video') {
      if (!livekitToken) {
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-900/80">
            <p className="text-gray-400">Loading voice/video channel...</p>
          </div>
        );
      }
      
      return (
        <LiveKitContainer
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gangio-1iknik3h.livekit.cloud"}
          token={livekitToken}
          roomName={`chat_${serverId}_${channelId}`}
          onLeave={() => {
            console.log("User left the call");
          }}
        />
      );
    }
    
    return (
      <ChatRoom
        channelId={channelId} 
        serverId={serverId} 
        currentUser={currentUser}
        channelName={channel.name}
        pusherClient={pusherClient} 
        pusherSocketId={pusherSocketId} 
      />
    );
  };

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="bg-red-500/20 rounded-lg p-6 max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Channel not found</h2>
          <p className="mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                if (serverId) {
                  // Try to go to the server page to select a channel
                  router.push(`/servers/${serverId}`);
                } else {
                  router.push('/dashboard');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Go to Server
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !server || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div 
          className="h-20 w-20 rounded-full border-t-4 border-b-4 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <div className="flex-shrink-0">
        <UniversalSidebarNew 
          activeServerId={serverId}
          onServerClick={(newServerId) => router.push(`/servers/${newServerId}`)}
          onCreateServer={() => router.push('/create-server')}
        />
      </div>

      <div className="w-60 bg-gray-800 flex flex-col border-r border-gray-700/60 shadow-lg flex-shrink-0">
        <div className="h-[50px] px-3 border-b border-gray-700/60 flex items-center justify-between flex-shrink-0 shadow-md">
          <h2 className="font-bold text-lg text-white truncate">{server?.name || 'Loading...'}</h2>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowChannelListModal(true)}
              className="p-1.5 rounded-md bg-gray-700/50 text-gray-300 hover:text-emerald-400 hover:bg-emerald-800/30 transition-all duration-200"
              title="Channel List"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 00.75.75v4.5a.75.75 0 001.5 0v-4.5a.75.75 0 00.75-.75zM2 16.5a.75.75 0 00.75.75h14.5a.75.75 0 000-1.5H2.75A.75.75 0 012 16.5z" clipRule="evenodd" />
              </svg>
            </motion.button>
            {userPermissions && (
              <ServerSettingsButton
                serverId={serverId}
                isOwner={userPermissions.isOwner}
              />
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 py-2 px-1.5 space-y-1 custom-scrollbar">
          {server?.categories?.sort((a, b) => (a.position || 0) - (b.position || 0)).map((category) => (
            <div key={category.id} className="mb-1">
              <div 
                className="px-2 py-1.5 flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 uppercase font-semibold cursor-pointer group rounded-md hover:bg-white/10 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-3.5 w-3.5 mr-1 transform transition-transform duration-150 ${expandedCategories[category.id] ? 'rotate-90' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="tracking-wider">{category.name}</span>
                </div>
                
                {canCreateChannel() && (
                  <button 
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-400 transition-all duration-150 p-0.5 rounded hover:bg-gray-700"
                    title="Create Channel in this category"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowChannelModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <AnimatePresence initial={false}>
              {expandedCategories[category.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-px mt-1 ml-2"
                  >
                  {(channelsByCategory[category.id] || []).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => router.push(`/servers/${serverId}/channels/${c.id}`)}
                      className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-all duration-100 ease-in-out
                        ${c.id === channelId 
                          ? 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/40'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-white/10' 
                        }`
                      }
                    >
                      <span className={`mr-2 flex-shrink-0 ${c.id === channelId ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`}>
                        {getChannelIcon(c)}
                      </span>
                      <span className="truncate text-sm font-medium">{c.name}</span>
                    </div>
                  ))}
                  </motion.div>
              )}
              </AnimatePresence>
            </div>
          ))}
          
          {channelsByCategory['uncategorized'] && channelsByCategory['uncategorized'].length > 0 && (
                <div className="mb-1">
                    <div 
                        className="px-2 py-1.5 flex items-center justify-between text-xs text-gray-400 hover:text-gray-200 uppercase font-semibold cursor-pointer group rounded-md hover:bg-white/10 transition-colors"
                        onClick={() => toggleCategory('uncategorized')}
                    >
                        <div className="flex items-center">
                             <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-3.5 w-3.5 mr-1 transform transition-transform duration-150 ${expandedCategories['uncategorized'] ? 'rotate-90' : ''}`} 
                                viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            <span className="tracking-wider">Uncategorized</span>
                        </div>
                         {canCreateChannel() && (
                          <button 
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-400 transition-all duration-150 p-0.5 rounded hover:bg-gray-700"
                            title="Create Channel (Uncategorized)"
                            onClick={(e) => { e.stopPropagation(); setShowChannelModal(true); }}
                          ><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                        )}
                    </div>
                     <AnimatePresence initial={false}>
                        {expandedCategories['uncategorized'] && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="space-y-px mt-1 ml-2">
                            {channelsByCategory['uncategorized'].map((c) => (
                                 <div key={c.id} onClick={() => router.push(`/servers/${serverId}/channels/${c.id}`)}
                                    className={`group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-all duration-100 ease-in-out ${c.id === channelId ? 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-600/40' : 'text-gray-400 hover:text-gray-100 hover:bg-white/10'}`}>
                                    <span className={`mr-2 flex-shrink-0 ${c.id === channelId ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`}>{getChannelIcon(c)}</span>
                                    <span className="truncate text-sm font-medium">{c.name}</span>
                                </div>
                            ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>

        <div className="mt-auto bg-black/40 backdrop-blur-sm p-2.5 flex items-center border-t border-white/10 shadow-md_top">
          <div className="w-9 h-9 rounded-full bg-gray-700 mr-2.5 flex-shrink-0 flex items-center justify-center text-white font-bold shadow-md overflow-hidden ring-1 ring-gray-600">
            {currentUser?.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt={currentUser.name || 'User'} width={36} height={36} className="object-cover" />
            ) : (
              <span className="text-sm">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden mr-1.5">
            <div className="text-sm font-semibold truncate text-white">{currentUser?.name}</div>
            <div className="text-xs text-gray-400 truncate">#{currentUser?.discriminator}</div>
          </div>
          
          <button 
            className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
            title="User Settings"
            onClick={() => setShowUserSettingsModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0-1.82.33z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col bg-gray-700/30 overflow-hidden">
          {server?.banner && (
             <div className="flex-shrink-0">
                <ServerBanner 
                  name={server.name} 
                  banner={server.banner} 
                  isOfficial={server.isOfficial || false}
                  height="100px"
                />
             </div>
          )}
          
          {channel && (
            <div className="h-[50px] px-4 border-b border-gray-700/50 flex items-center flex-shrink-0 shadow-sm bg-gray-800/40">
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="text-gray-300">
                  {getChannelIcon(channel)}
                </span>
                <h3 className="font-semibold text-white text-base">{channel.name}</h3>
              </div>
              {/* Members List Toggle Button - visible only on mobile */}
              <button 
                onClick={() => setShowMobileMembersList(!showMobileMembersList)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle members list"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            {renderChannelContent()}
          </div>
        </main>

        {/* Desktop Members List */}
        {channel && (channel.type === 'text' || channel.type === 'voice' || channel.type === 'video') && (
          <aside className="hidden md:flex w-60 bg-gray-800/80 backdrop-blur-sm border-l border-gray-700/60 flex-col shadow-lg_left flex-shrink-0 overflow-y-auto custom-scrollbar">
            <MembersListContainer serverId={serverId} />
          </aside>
        )}
      </div>

      {/* Mobile Members List - Modal/Overlay */}
      <AnimatePresence>
        {showMobileMembersList && channel && (channel.type === 'text' || channel.type === 'voice' || channel.type === 'video') && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-64 bg-gray-800/95 backdrop-blur-md shadow-xl z-40 md:hidden border-l border-gray-700/50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Members</h3>
              <button onClick={() => setShowMobileMembersList(false)} className="text-gray-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <MembersListContainer serverId={serverId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {showChannelModal && (
        <ChannelModal 
          serverId={serverId}
          onClose={() => setShowChannelModal(false)}
          onChannelCreated={handleChannelCreated}
        />
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showChannelListModal && server && (
        <ChannelListModal
          isOpen={showChannelListModal}
          onClose={() => setShowChannelListModal(false)}
          serverId={serverId}
          categories={Array.isArray(server.categories) ? server.categories : []}
          channels={Array.isArray(server.channels) ? server.channels : []}
          onChannelClick={(channelId) => router.push(`/servers/${serverId}/channels/${channelId}`)}
          isOwner={userPermissions?.isOwner || false}
        />
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showUserSettingsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700/70"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-700/70 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">User Settings</h2>
              <button 
                onClick={() => setShowUserSettingsModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
              <div className="p-1 overflow-y-auto custom-scrollbar">
              <AccountPanel />
            </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
} 