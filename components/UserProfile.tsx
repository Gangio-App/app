import React, { useState, useEffect } from 'react';
import { User, Badge, Server, UserStatus } from '@/types/models';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mutualServers, setMutualServers] = useState<Server[]>([]);
  const [mutualFriends, setMutualFriends] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'mutual_friends' | 'mutual_groups' | 'mutual_servers'>('profile');
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending_outgoing' | 'pending_incoming'>('none');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        // Fetch user profile
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // Determine friend status
        if (userData.friendIds?.includes(currentUser?.id)) {
          setFriendStatus('friends');
        } else if (userData.outgoingFriendRequests?.includes(currentUser?.id)) {
          setFriendStatus('pending_incoming');
        } else if (userData.incomingFriendRequests?.includes(currentUser?.id)) {
          setFriendStatus('pending_outgoing');
        }
        
        // Fetch mutual servers
        const serversResponse = await fetch(`/api/users/${userId}/mutual-servers?currentUserId=${currentUser?.id}`);
        if (serversResponse.ok) {
          const serversData = await serversResponse.json();
          setMutualServers(serversData.servers || []);
        }
        
        // Fetch mutual friends
        const friendsResponse = await fetch(`/api/users/${userId}/mutual-friends?currentUserId=${currentUser?.id}`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          setMutualFriends(friendsData.friends || []);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, currentUser?.id]);
  
  const handleSendFriendRequest = async () => {
    if (!currentUser || !user) return;
    
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientId: user.id,
        }),
      });
      
      if (response.ok) {
        setFriendStatus('pending_outgoing');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };
  
  const handleAcceptFriendRequest = async () => {
    if (!currentUser || !user) return;
    
    try {
      const response = await fetch('/api/friends/requests/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: user.id,
        }),
      });
      
      if (response.ok) {
        setFriendStatus('friends');
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };
  
  const handleCancelFriendRequest = async () => {
    if (!currentUser || !user) return;
    
    try {
      const response = await fetch('/api/friends/requests/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: user.id,
        }),
      });
      
      if (response.ok) {
        setFriendStatus('none');
      }
    } catch (err) {
      console.error('Error canceling friend request:', err);
    }
  };
  
  const handleRemoveFriend = async () => {
    if (!currentUser || !user) return;
    
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: user.id,
        }),
      });
      
      if (response.ok) {
        setFriendStatus('none');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };
  
  const StatusIcon = ({ status }: { status: UserStatus }) => {
    switch (status) {
      case 'online':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'idle':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'dnd':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'offline':
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center">
            <motion.div 
              className="w-12 h-12 border-4 border-gray-600 border-t-emerald-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400">{error || 'User not found'}</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Banner and close button */}
        <div className="relative">
          <div className="h-24 bg-gradient-to-r from-gray-700 to-gray-600 overflow-hidden">
            {user.bannerUrl && (
              <img 
                src={user.bannerUrl} 
                alt="Profile banner" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-900/50 hover:bg-gray-900/80 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* User avatar */}
          <div className="absolute bottom-0 transform translate-y-1/2 left-6">
            <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-800 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute bottom-0 right-0">
              <StatusIcon status={user.status} />
            </div>
          </div>
          
          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="absolute bottom-0 transform translate-y-1/2 right-6 flex space-x-1">
              {user.badges.map(badge => (
                <div 
                  key={badge.id} 
                  className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center"
                  title={badge.name}
                >
                  <img src={badge.icon} alt={badge.name} className="w-4 h-4" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* User info */}
        <div className="px-6 pt-14 pb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <span className="ml-1 text-gray-400">#{user.discriminator}</span>
            {user.isNew && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                New
              </span>
            )}
          </div>
          
          {/* Position & Company */}
          {(user.position || user.company) && (
            <div className="mt-1 text-gray-300">
              {user.position && <span>{user.position}</span>}
              {user.position && user.company && <span> @ </span>}
              {user.company && <span className="font-medium">{user.company}</span>}
            </div>
          )}
          
          {/* Pronouns */}
          {user.pronouns && (
            <div className="mt-1 text-gray-400 text-sm">
              {user.pronouns}
            </div>
          )}
          
          {/* Bio */}
          {user.bio && (
            <div className="mt-3 text-gray-300 text-sm">
              {user.bio}
            </div>
          )}
          
          {/* Friend action button */}
          {currentUser && currentUser.id !== user.id && (
            <div className="mt-4">
              {friendStatus === 'none' && (
                <button 
                  onClick={handleSendFriendRequest}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md w-full"
                >
                  Add Friend
                </button>
              )}
              
              {friendStatus === 'pending_outgoing' && (
                <button 
                  onClick={handleCancelFriendRequest}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md w-full"
                >
                  Cancel Friend Request
                </button>
              )}
              
              {friendStatus === 'pending_incoming' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAcceptFriendRequest}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex-1"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={handleCancelFriendRequest}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex-1"
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {friendStatus === 'friends' && (
                <button 
                  onClick={handleRemoveFriend}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md w-full"
                >
                  Remove Friend
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-700 mt-2">
          <div className="flex">
            <button 
              className={`flex-1 py-3 text-center ${activeTab === 'profile' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`flex-1 py-3 text-center ${activeTab === 'mutual_friends' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('mutual_friends')}
            >
              Mutual Friends
              {mutualFriends.length > 0 && (
                <span className="ml-1 text-xs bg-gray-700 px-1.5 rounded-full">{mutualFriends.length}</span>
              )}
            </button>
            <button 
              className={`flex-1 py-3 text-center ${activeTab === 'mutual_servers' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('mutual_servers')}
            >
              Mutual Servers
              {mutualServers.length > 0 && (
                <span className="ml-1 text-xs bg-gray-700 px-1.5 rounded-full">{mutualServers.length}</span>
              )}
            </button>
          </div>
          
          {/* Tab content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            {activeTab === 'profile' && (
              <div>
                <div className="bg-gray-700/50 rounded-md p-3">
                  <div className="text-xs uppercase text-gray-400 mb-1">Member Since</div>
                  <div className="text-white">
                    {user.createdAt && format(new Date(user.createdAt), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'mutual_friends' && (
              <div>
                {mutualFriends.length === 0 ? (
                  <div className="text-gray-400 text-center py-6">
                    No mutual friends
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mutualFriends.map(friend => (
                      <div key={friend.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {friend.avatarUrl ? (
                            <img 
                              src={friend.avatarUrl} 
                              alt={friend.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {friend.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-white">{friend.name}</div>
                          <div className="text-xs text-gray-400">#{friend.discriminator}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'mutual_servers' && (
              <div>
                {mutualServers.length === 0 ? (
                  <div className="text-gray-400 text-center py-6">
                    No mutual servers
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mutualServers.map(server => (
                      <div key={server.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50">
                        <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center overflow-hidden">
                          {server.icon ? (
                            <img 
                              src={server.icon} 
                              alt={server.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {server.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-white">{server.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 
 