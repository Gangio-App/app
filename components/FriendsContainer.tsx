'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
}

interface FriendsContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (friendId: string) => void;
  onStartCall?: (friendId: string) => void;
  onStartVideoCall?: (friendId: string) => void;
}

export const FriendsContainer: React.FC<FriendsContainerProps> = ({ 
  isOpen,
  onClose,
  onStartChat,
  onStartCall,
  onStartVideoCall
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [addFriendError, setAddFriendError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch friends
        const friendsResponse = await fetch(`/api/friends?userId=${currentUser.id}`);
        if (!friendsResponse.ok) {
          throw new Error('Failed to fetch friends');
        }
        const friendsData = await friendsResponse.json();
        // The API now returns an array directly
        setFriends(Array.isArray(friendsData) ? friendsData : []);
        
        // Fetch incoming friend requests
        const incomingResponse = await fetch(`/api/friends/requests?userId=${currentUser.id}&type=incoming`);
        if (!incomingResponse.ok) {
          throw new Error('Failed to fetch incoming friend requests');
        }
        const incomingData = await incomingResponse.json();
        setIncomingRequests(incomingData.incoming || []);
        
        // Fetch outgoing friend requests
        const outgoingResponse = await fetch(`/api/friends/requests?userId=${currentUser.id}&type=outgoing`);
        if (!outgoingResponse.ok) {
          throw new Error('Failed to fetch outgoing friend requests');
        }
        const outgoingData = await outgoingResponse.json();
        setOutgoingRequests(outgoingData.outgoing || []);
      } catch (err) {
        console.error('Error fetching friends data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, [currentUser?.id]);

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(friendSearch.toLowerCase())
  );

  const handleSendFriendRequest = async () => {
    if (!currentUser || !friendSearch.trim()) return;
    
    try {
      setAddFriendError(null);
      
      // Validate username#discriminator format
      const regex = /^.+#\d{4}$/;
      if (!regex.test(friendSearch)) {
        setAddFriendError('Invalid format. Please use username#0000 format.');
        return;
      }
      
      // First find the user by their username+discriminator
      const findResponse = await fetch(`/api/users/find?identifier=${encodeURIComponent(friendSearch.trim())}`);
      
      if (!findResponse.ok) {
        const errorData = await findResponse.json();
        setAddFriendError(errorData.error || 'User not found');
        return;
      }
      
      const foundUser = await findResponse.json();
      
      // Prevent sending friend request to yourself
      if (foundUser.id === currentUser.id) {
        setAddFriendError('You cannot add yourself as a friend');
        return;
      }
      
      // Send the friend request
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientId: foundUser.id,
        }),
      });
      
      if (response.ok) {
        // Clear the search input
        setFriendSearch('');
        
        // Refresh friend requests
        const outgoingResponse = await fetch(`/api/friends/requests?userId=${currentUser.id}&type=outgoing`);
        if (outgoingResponse.ok) {
          const outgoingData = await outgoingResponse.json();
          setOutgoingRequests(outgoingData.outgoing || []);
        }
      } else {
        const errorData = await response.json();
        setAddFriendError(errorData.error || 'Failed to send friend request');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setAddFriendError('An error occurred while sending the friend request');
    }
  };

  const handleAcceptFriendRequest = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: friendId,
          action: 'accept'
        }),
      });
      
      if (response.ok) {
        // Remove from requests and add to friends
        setIncomingRequests(requests => requests.filter(req => req.id !== friendId));
        
        // Refresh friends list
        const friendsResponse = await fetch(`/api/friends?userId=${currentUser.id}`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          // The API now returns an array directly
          setFriends(Array.isArray(friendsData) ? friendsData : []);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to accept friend request');
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      alert('An error occurred while accepting the friend request');
    }
  };

  const handleRejectFriendRequest = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: friendId,
          action: 'reject'
        }),
      });
      
      if (response.ok) {
        // Remove from requests
        setIncomingRequests(requests => requests.filter(req => req.id !== friendId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reject friend request');
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      alert('An error occurred while rejecting the friend request');
    }
  };

  const handleCancelFriendRequest = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: friendId,
          action: 'reject'
        }),
      });
      
      if (response.ok) {
        // Remove from outgoing requests
        setOutgoingRequests(requests => requests.filter(req => req.id !== friendId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to cancel friend request');
      }
    } catch (err) {
      console.error('Error canceling friend request:', err);
      alert('An error occurred while canceling the friend request');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/friends?userId=${currentUser.id}&friendId=${friendId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from friends list
        setFriends(friends => friends.filter(friend => friend.id !== friendId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove friend');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('An error occurred while removing the friend');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div 
        className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Friends</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={friendSearch}
              onChange={(e) => {
                setFriendSearch(e.target.value);
                setAddFriendError(null);
              }}
              placeholder="Add friend with username#0000"
              className="bg-transparent border-none outline-none w-full text-white placeholder-gray-400"
            />
            {friendSearch && (
              <button
                onClick={handleSendFriendRequest}
                className="ml-2 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition-colors"
              >
                Add
              </button>
            )}
          </div>
          {addFriendError && (
            <p className="text-red-400 text-sm mt-2">{addFriendError}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            You can add friends with their username and discriminator (e.g., admin#4500)
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div 
              className="w-12 h-12 border-4 border-gray-600 border-t-emerald-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <div className="text-xl mb-2">Error loading friends</div>
            <div>{error}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Incoming Friend Requests Section */}
            {incomingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-300">Friend Requests</h3>
                <div className="space-y-2">
                  {incomingRequests.map(request => (
                    <div key={request.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-medium">
                          {request.avatarUrl ? (
                            <img src={request.avatarUrl} alt={request.name} className="w-full h-full rounded-full" />
                          ) : (
                            request.name.charAt(0)
                          )}
                        </div>
                        <span className="ml-3 font-medium">
                          {request.name}
                          {request.discriminator && (
                            <span className="text-xs text-gray-400 ml-1">#{request.discriminator}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleAcceptFriendRequest(request.id)}
                          className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm transition-colors"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectFriendRequest(request.id)}
                          className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-sm transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Outgoing Friend Requests Section */}
            {outgoingRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-300">Pending Requests</h3>
                <div className="space-y-2">
                  {outgoingRequests.map(request => (
                    <div key={request.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-medium">
                          {request.avatarUrl ? (
                            <img src={request.avatarUrl} alt={request.name} className="w-full h-full rounded-full" />
                          ) : (
                            request.name.charAt(0)
                          )}
                        </div>
                        <div className="ml-3">
                          <span className="font-medium">
                            {request.name}
                            {request.discriminator && (
                              <span className="text-xs text-gray-400 ml-1">#{request.discriminator}</span>
                            )}
                          </span>
                          <div className="text-xs text-gray-400">Pending</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCancelFriendRequest(request.id)}
                        className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Friends List */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-300">
                All Friends{friends.length > 0 ? ` - ${friends.length}` : ''}
              </h3>
              <div className="space-y-2">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <div key={friend.id} className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 flex items-center justify-between transition-colors">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-medium">
                            {friend.avatarUrl ? (
                              <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full rounded-full" />
                            ) : (
                              friend.name.charAt(0)
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            friend.status === 'online' ? 'bg-green-500' : 
                            friend.status === 'idle' ? 'bg-yellow-500' : 
                            friend.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">
                            {friend.name}
                            {friend.discriminator && (
                              <span className="text-xs text-gray-400 ml-1">#{friend.discriminator}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{friend.status}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {onStartChat && (
                          <button 
                            onClick={() => onStartChat(friend.id)}
                            className="p-2 rounded-full hover:bg-gray-600 transition-colors group"
                            title="Send Message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        )}
                        
                        {onStartCall && (
                          <button 
                            onClick={() => onStartCall(friend.id)}
                            className="p-2 rounded-full hover:bg-gray-600 transition-colors group"
                            title="Start Voice Call"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </button>
                        )}
                        
                        {onStartVideoCall && (
                          <button 
                            onClick={() => onStartVideoCall(friend.id)}
                            className="p-2 rounded-full hover:bg-gray-600 transition-colors group"
                            title="Start Video Call"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="p-2 rounded-full hover:bg-red-600 transition-colors group"
                          title="Remove Friend"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {friends.length === 0 ? 'You have no friends yet. Add some!' : 'No friends match your search'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-medium mb-3 text-gray-300">Quick Help</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Voice & Video Calls</h4>
              <p className="text-sm text-gray-400">Click the phone or video icon next to a friend to start a call. Powered by LiveKit.</p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Direct Messages</h4>
              <p className="text-sm text-gray-400">Click the message icon to start a private conversation with a friend.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 