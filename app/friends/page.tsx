'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import Pusher from 'pusher-js';
import { 
  NEXT_PUBLIC_PUSHER_APP_KEY, 
  NEXT_PUBLIC_PUSHER_CLUSTER 
} from '@/app/env';

// Icons
import { FiPlus, FiUsers, FiMessageSquare, FiCheck, FiX, FiSend, FiClock } from 'react-icons/fi';
import { BiUser } from 'react-icons/bi';
import { HiOutlineSparkles } from 'react-icons/hi';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatarUrl?: string;
  discriminator?: string;
}

interface FriendRequest {
  id: string;
  name: string;
  avatarUrl?: string;
  discriminator?: string;
  requestId?: string;
}

interface ApiRequest {
  _id?: string;
  id?: string;
  senderId?: string;
  recipientId?: string;
  user?: {
    id: string;
    name: string;
    discriminator?: string;
    avatarUrl?: string;
  };
}

export default function FriendsPage() {
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
    }, 500);
    
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

  return <FriendsContent user={currentUser} />;
}

function FriendsContent({ user }: { user: any }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const router = useRouter();
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any | null>(null);

  useEffect(() => {
    fetchFriendsData();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && NEXT_PUBLIC_PUSHER_APP_KEY && NEXT_PUBLIC_PUSHER_CLUSTER) {
      if (!pusherRef.current) {
        pusherRef.current = new Pusher(NEXT_PUBLIC_PUSHER_APP_KEY, {
          cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
          authEndpoint: '/api/pusher/auth',
          auth: {
            headers: {
            }
          }
        });
      }

      const channelName = `private-user-${user.id}`;
      if (channelRef.current?.name !== channelName) {
        if (channelRef.current) {
          pusherRef.current.unsubscribe(channelRef.current.name);
        }
        channelRef.current = pusherRef.current.subscribe(channelName);

        channelRef.current.bind('pusher:subscription_succeeded', () => {
          console.log(`Successfully subscribed to Pusher channel: ${channelName}`);
        });

        channelRef.current.bind('pusher:subscription_error', (status: any) => {
          console.error(`Pusher subscription error for ${channelName}:`, status);
          toast.error(`Real-time connection error: ${status.status}. Check console.`);
        });

        channelRef.current.bind('incoming_friend_request', (data: any) => {
          console.log('Received incoming_friend_request event:', data);
          const newRequest: FriendRequest = {
            id: data.sender.id,
            name: data.sender.name || 'Unknown User',
            avatarUrl: data.sender.avatarUrl,
            discriminator: data.sender.discriminator,
            requestId: data.requestId 
          };
          setIncomingRequests((prevRequests) => {
            if (!prevRequests.find(req => req.requestId === newRequest.requestId)) {
              return [newRequest, ...prevRequests];
            }
            return prevRequests;
          });
          toast.info(`New friend request from ${newRequest.name}`);
        });
      }
    }

    return () => {
      if (pusherRef.current && channelRef.current) {
        console.log('Unsubscribing from Pusher channel:', channelRef.current.name);
        pusherRef.current.unsubscribe(channelRef.current.name);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isLoading && friends.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0) {
      setActiveTab('add');
    }
  }, [isLoading, friends, incomingRequests, outgoingRequests]);

  const fetchFriendsData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching friends data for user:', user.id);
      
      const friendsResponse = await fetch(`/api/friends?userId=${user.id}`);
      if (!friendsResponse.ok) {
        throw new Error('Failed to fetch friends');
      }
      const friendsData = await friendsResponse.json();
      console.log('Friends data:', friendsData);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      
      const incomingResponse = await fetch(`/api/friends/requests?userId=${user.id}&type=received`);
      if (!incomingResponse.ok) {
        throw new Error('Failed to fetch incoming friend requests');
      }
      const incomingData = await incomingResponse.json();
      console.log('Incoming friend requests:', incomingData);
      
      if (incomingData.requests && Array.isArray(incomingData.requests)) {
        const formattedRequests = incomingData.requests.map((request: ApiRequest) => {
          console.log('Processing incoming request:', request);
          return {
            id: request.user?.id || request.senderId || '',
            name: request.user?.name || 'Unknown User',
            discriminator: request.user?.discriminator,
            avatarUrl: request.user?.avatarUrl,
            requestId: request._id || request.id
          };
        });
        console.log('Formatted incoming requests:', formattedRequests);
        setIncomingRequests(formattedRequests);
      } else {
        console.log('No incoming requests found');
        setIncomingRequests([]);
      }
      
      const outgoingResponse = await fetch(`/api/friends/requests?userId=${user.id}&type=sent`);
      if (!outgoingResponse.ok) {
        throw new Error('Failed to fetch outgoing friend requests');
      }
      const outgoingData = await outgoingResponse.json();
      console.log('Outgoing friend requests:', outgoingData);
      
      if (outgoingData.requests && Array.isArray(outgoingData.requests)) {
        const formattedRequests = outgoingData.requests.map((request: ApiRequest) => {
          console.log('Processing outgoing request:', request);
          return {
            id: request.user?.id || request.recipientId || '',
            name: request.user?.name || 'Unknown User',
            discriminator: request.user?.discriminator,
            avatarUrl: request.user?.avatarUrl,
            requestId: request._id || request.id
          };
        });
        console.log('Formatted outgoing requests:', formattedRequests);
        setOutgoingRequests(formattedRequests);
      } else {
        console.log('No outgoing requests found');
        setOutgoingRequests([]);
      }
    } catch (err) {
      console.error('Error fetching friends data:', err);
      toast.error('Failed to load friends data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateUsername = (input: string): boolean => {
    const regex = /^.+#\d{4}$/;
    
    if (!input.trim()) {
      setInputError('Username cannot be empty');
      return false;
    }
    
    if (!regex.test(input)) {
      setInputError('Username must be in the format username#0000');
      return false;
    }
    
    setInputError('');
    return true;
  };

  const handleAddFriend = async () => {
    if (!validateUsername(username)) {
      return;
    }
    
    try {
      setIsAddingFriend(true);
      
      const [name, discriminator] = username.split('#');
      
      const findResponse = await fetch(`/api/users/find?identifier=${encodeURIComponent(username.trim())}`);
      
      if (!findResponse.ok) {
        const errorData = await findResponse.json();
        setInputError(errorData.error || 'User not found');
        return;
      }
      
      const foundUser = await findResponse.json();
      
      if (foundUser.id === user.id) {
        setInputError('You cannot add yourself as a friend');
        return;
      }
      
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: foundUser.id,
        }),
      });
      
      const data = await response.json();
      console.log('Friend request response:', data);
      
      if (!response.ok) {
        setInputError(data.error || 'Failed to add friend');
        return;
      }
      
      setUsername('');
      toast.success('Friend request sent!');
      
      const tempRequest: FriendRequest = {
        id: foundUser.id,
        name: foundUser.name || foundUser.id,
        discriminator: foundUser.discriminator,
        avatarUrl: foundUser.avatarUrl,
        requestId: `${user.id}_${foundUser.id}`,
      };
      
      setOutgoingRequests(prev => [...prev, tempRequest]);
      
      setActiveTab('pending');
      
      setTimeout(() => {
        fetchFriendsData();
      }, 1000);
    } catch (error) {
      console.error('Error adding friend:', error);
      setInputError('An error occurred while processing your request');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends/requests`, { 
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          senderId: friendId,      // The user who sent the request
          recipientId: user.id     // The current user accepting the request
        }),
      });
      
      if (response.ok) {
        toast.success('Friend request accepted');
        fetchFriendsData(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to accept friend request');
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      toast.error('An error occurred while accepting the friend request');
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends/requests?senderId=${friendId}&recipientId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Friend request rejected');
        fetchFriendsData(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to reject friend request');
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      toast.error('An error occurred while rejecting the friend request');
    }
  };

  const handleCancelFriendRequest = async (friendId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends/requests?senderId=${user.id}&recipientId=${friendId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Friend request canceled');
        fetchFriendsData(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to cancel friend request');
      }
    } catch (err) {
      console.error('Error canceling friend request:', err);
      toast.error('An error occurred while canceling the friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends?userId=${user.id}&friendId=${friendId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Friend removed');
        fetchFriendsData(); // Refresh the data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      toast.error('An error occurred while removing the friend');
    }
  };

  const handleStartChat = (friendId: string) => {
    router.push(`/direct-messages?friendId=${friendId}`);
  };

  const getStatusColor = (status: string) => {
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <UniversalSidebarNew 
        activeServerId="friends"
        onServerClick={(id) => router.push(`/servers/${id}`)}
        onCreateServer={() => router.push('/create-server')}
      />
      
      <div className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm rounded-tl-xl rounded-bl-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none z-0" style={{ 
          backgroundImage: `url('/assets/gangio-friends-mushroom.png')`, 
          backgroundPosition: 'right center', 
          backgroundRepeat: 'no-repeat',
          backgroundSize: '60% auto',
          opacity: 0.15
        }}></div>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col w-full max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-8 bg-gray-900/70 backdrop-blur-md rounded-xl border border-gray-800/50 shadow-xl">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Friends</h1>
                  <p className="text-sm md:text-base text-gray-400 mt-1">Manage your friends and requests</p>
                </div>
                <div className="relative w-16 h-16 md:w-24 md:h-24">
                  <Image 
                    src="/assets/gangiobear-friends.png" 
                    alt="Friends" 
                    width={96} 
                    height={96} 
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <div className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6 gap-1 md:gap-0">
                      <TabsTrigger value="all" className="text-xs md:text-sm">All Friends</TabsTrigger>
                      <TabsTrigger value="online" className="text-xs md:text-sm">Online</TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs md:text-sm">Pending</TabsTrigger>
                      <TabsTrigger value="add" className="text-xs md:text-sm">Add Friend</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div 
                          className="h-12 w-12 rounded-full border-t-3 border-b-3 border-emerald-500"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    ) : friends.length > 0 ? (
                      <div className="space-y-3">
                        {friends.map(friend => (
                          <motion.div 
                            key={friend.id}
                            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center">
                              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-base md:text-lg font-medium mr-3 md:mr-4 flex-shrink-0">
                                {friend.avatarUrl ? (
                                  <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full rounded-full" />
                                ) : (
                                  friend.name.charAt(0).toUpperCase()
                                )}
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-gray-800`}></div>
                              </div>
                              <div className="min-w-0 overflow-hidden">
                                <div className="font-medium text-sm md:text-base flex items-center">
                                  <span className="truncate">{friend.name}</span>
                                  {friend.discriminator && (
                                    <span className="text-xs text-gray-400 ml-1 flex-shrink-0">#{friend.discriminator}</span>
                                  )}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400 capitalize">{friend.status}</div>
                              </div>
                            </div>
                            <div className="flex space-x-2 justify-end">
                              <Button 
                                onClick={() => handleStartChat(friend.id)}
                                variant="secondary"
                                size="sm"
                                className="flex items-center text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                              >
                                <FiMessageSquare className="mr-1" />
                                <span className="hidden md:inline">Message</span>
                              </Button>
                              <Button 
                                onClick={() => handleRemoveFriend(friend.id)}
                                variant="danger"
                                size="sm"
                                className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                              >
                                <FiX className="md:mr-1" />
                                <span className="hidden md:inline">Remove</span>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <FiUsers className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Friends Yet</h3>
                        <p className="text-gray-400 mb-4">Add some friends to get started!</p>
                        <Button onClick={() => setActiveTab('add')} variant="primary" className="mx-auto">
                          <FiPlus className="mr-2" />
                          Add Friend
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="online" className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div 
                          className="h-12 w-12 rounded-full border-t-3 border-b-3 border-emerald-500"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    ) : friends.filter(f => f.status === 'online').length > 0 ? (
                      <div className="space-y-3">
                        {friends.filter(f => f.status === 'online').map(friend => (
                          <motion.div 
                            key={friend.id}
                            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center">
                              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-base md:text-lg font-medium mr-3 md:mr-4 flex-shrink-0">
                                {friend.avatarUrl ? (
                                  <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full rounded-full" />
                                ) : (
                                  friend.name.charAt(0).toUpperCase()
                                )}
                                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></div>
                              </div>
                              <div className="min-w-0 overflow-hidden">
                                <div className="font-medium text-sm md:text-base flex items-center">
                                  <span className="truncate">{friend.name}</span>
                                  {friend.discriminator && (
                                    <span className="text-xs text-gray-400 ml-1 flex-shrink-0">#{friend.discriminator}</span>
                                  )}
                                </div>
                                <div className="text-xs md:text-sm text-gray-400">Online</div>
                              </div>
                            </div>
                            <div className="flex space-x-2 justify-end">
                              <Button 
                                onClick={() => handleStartChat(friend.id)}
                                variant="secondary"
                                size="sm"
                                className="flex items-center text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                              >
                                <FiMessageSquare className="mr-1" />
                                <span className="hidden md:inline">Message</span>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <FiUsers className="w-8 h-8 text-emerald-400" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Online Friends</h3>
                        <p className="text-gray-400 mb-4">None of your friends are currently online</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <motion.div 
                          className="h-12 w-12 rounded-full border-t-3 border-b-3 border-emerald-500"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    ) : (
                      <>
                        {incomingRequests.length > 0 && (
                          <div className="mb-8">
                            <h3 className="text-lg font-medium mb-3 flex items-center">
                              <FiClock className="mr-2 text-emerald-400" />
                              Incoming Requests
                            </h3>
                            <div className="space-y-3">
                              {incomingRequests.map(request => (
                                <motion.div 
                                  key={request.id}
                                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-center">
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-base md:text-lg font-medium mr-3 md:mr-4 flex-shrink-0">
                                      {request.avatarUrl ? (
                                        <img src={request.avatarUrl} alt={request.name} className="w-full h-full rounded-full" />
                                      ) : (
                                        request.name.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                      <div className="font-medium text-sm md:text-base flex items-center">
                                        <span className="truncate">{request.name}</span>
                                        {request.discriminator && (
                                          <span className="text-xs text-gray-400 ml-1 flex-shrink-0">#{request.discriminator}</span>
                                        )}
                                      </div>
                                      <div className="text-xs md:text-sm text-gray-400">Wants to be your friend</div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 flex-shrink-0">
                                    <Button
                                      onClick={() => handleAcceptFriendRequest(request.id)}
                                      variant="primary"
                                      size="sm"
                                      className="mr-2 text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                                    >
                                      <FiCheck className="mr-1" />
                                      <span className="hidden md:inline">Accept</span>
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectFriendRequest(request.id)}
                                      variant="danger"
                                      size="sm"
                                      className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                                    >
                                      <FiX className="md:mr-1" />
                                      <span className="hidden md:inline">Reject</span>
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {outgoingRequests.length > 0 && (
                          <div>
                            <h3 className="text-lg font-medium mb-3 flex items-center">
                              <FiSend className="mr-2 text-emerald-400" />
                              Outgoing Requests
                            </h3>
                            <div className="space-y-3">
                              {outgoingRequests.map(request => (
                                <motion.div 
                                  key={request.id}
                                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-700/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-center">
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center text-base md:text-lg font-medium mr-3 md:mr-4 flex-shrink-0">
                                      {request.avatarUrl ? (
                                        <img src={request.avatarUrl} alt={request.name} className="w-full h-full rounded-full" />
                                      ) : (
                                        request.name.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="min-w-0 overflow-hidden">
                                      <div className="font-medium text-sm md:text-base flex items-center">
                                        <span className="truncate">{request.name}</span>
                                        {request.discriminator && (
                                          <span className="text-xs text-gray-400 ml-1 flex-shrink-0">#{request.discriminator}</span>
                                        )}
                                      </div>
                                      <div className="text-xs md:text-sm text-gray-400">Request pending</div>
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => handleCancelFriendRequest(request.id)}
                                    variant="danger"
                                    size="sm"
                                    className="text-xs md:text-sm px-2 md:px-3 h-8 md:h-9"
                                  >
                                    <FiX className="md:mr-1" />
                                    <span className="hidden md:inline">Cancel</span>
                                  </Button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                          <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30">
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                <FiUsers className="w-8 h-8 text-emerald-400" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Pending Requests</h3>
                            <p className="text-gray-400 mb-4">You don't have any pending friend requests</p>
                            <Button onClick={() => setActiveTab('add')} variant="primary" className="mx-auto">
                              <FiPlus className="mr-2" />
                              Add Friend
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="add" className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center mb-6">
                        <HiOutlineSparkles className="text-emerald-400 text-2xl mr-3" />
                        <h3 className="text-xl font-bold">Add Friend</h3>
                      </div>
                      
                      <p className="text-gray-400 mb-6">You can add friends using their username and discriminator (e.g., username#0000)</p>
                      
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1">
                          <Input
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              setInputError('');
                            }}
                            placeholder="Enter a username#0000"
                            className="w-full"
                          />
                          {inputError && (
                            <p className="text-red-400 text-sm mt-1">{inputError}</p>
                          )}
                        </div>
                        <Button
                          onClick={handleAddFriend}
                          variant="primary"
                          disabled={isAddingFriend}
                          className="flex items-center justify-center"
                        >
                          {isAddingFriend ? (
                            <motion.div 
                              className="h-5 w-5 rounded-full border-t-2 border-b-2 border-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (
                            <>
                              <FiPlus className="mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}