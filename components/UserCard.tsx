import React, { useState, useEffect } from 'react';
import { User, UserStatus } from '@/types/models';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Image from 'next/image';

interface UserCardProps {
  userId: string;
  onClose: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [friendStatus, setFriendStatus] = useState<'none' | 'friends' | 'pending_outgoing' | 'pending_incoming'>('none');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const storedUser = localStorage.getItem('currentUser');
        let currentUserId = null;
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
            currentUserId = parsedUser.id;
        }
        
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found');
            } else {
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }
        }
        
        const userData = await response.json();
        setUser(userData);
        
        if (currentUserId && userData) {
            if (userData.friendIds?.includes(currentUserId)) {
              setFriendStatus('friends');
            } else if (userData.outgoingFriendRequests?.includes(currentUserId)) {
              setFriendStatus('pending_incoming');
            } else if (userData.incomingFriendRequests?.includes(currentUserId)) {
              setFriendStatus('pending_outgoing');
            } else {
              setFriendStatus('none');
            }
        } else {
            setFriendStatus('none');
        }

      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
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
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: user.id,
          action: 'accept'
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
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          friendId: user.id,
          action: 'reject'
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
      const response = await fetch(`/api/friends?userId=${currentUser.id}&friendId=${user.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFriendStatus('none');
      }
    } catch (err) {
      console.error('Error removing friend:', err);
    }
  };
  
  const StatusIcon = ({ status }: { status: UserStatus }) => {
    let bgColor = 'bg-gray-500';
    switch (status) {
      case 'online': bgColor = 'bg-green-500'; break;
      case 'idle': bgColor = 'bg-yellow-500'; break;
      case 'dnd': bgColor = 'bg-red-500'; break;
      case 'focus': bgColor = 'bg-purple-500'; break;
      case 'offline':
      case 'invisible':
      default: bgColor = 'bg-gray-500'; break;
    }
    return <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${bgColor} rounded-full border-2 border-gray-800/80`}></div>;
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-full max-w-sm shadow-xl border border-white/10">
          <div className="flex justify-center items-center h-40">
            <motion.div 
              className="w-10 h-10 border-4 border-gray-600 border-t-emerald-500 rounded-full"
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9 }}
           className="bg-red-900/50 backdrop-blur-md rounded-lg p-6 w-full max-w-sm shadow-xl border border-red-500/30"
        >
          <h2 className="text-xl font-bold text-white mb-4 text-center">Error</h2>
          <p className="text-red-300 text-center mb-4">{error || 'User not found'}</p>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-gray-800/90 backdrop-blur-md rounded-lg w-full max-w-sm overflow-hidden flex flex-col shadow-xl border border-white/10 max-h-[90vh]"
      >
        <div className="relative flex-shrink-0">
          <div className="h-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 overflow-hidden">
            {user.bannerUrl ? (
              <Image 
                src={user.bannerUrl} 
                alt="Profile banner" 
                layout="fill"
                objectFit="cover"
              />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/20 to-gray-800/30"></div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors"
            aria-label="Close profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="absolute bottom-0 transform translate-y-1/2 left-4">
            <div className="relative">
                 <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-800/80 flex items-center justify-center overflow-hidden shadow-md">
                   {user.avatarUrl ? (
                     <Image 
                       src={user.avatarUrl} 
                       alt={user.name} 
                       width={80} 
                       height={80} 
                       className="object-cover"
                     />
                   ) : (
                     <span className="text-3xl font-bold text-white">
                       {user.name?.charAt(0)?.toUpperCase() || '?'}
                     </span>
                   )}
                 </div>
                 <StatusIcon status={user.status} />
               </div>
          </div>
        </div>
        
        <div className="px-6 pt-12 pb-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-baseline mb-1">
            <h2 className="text-xl font-bold text-white truncate mr-1">{user.name}</h2>
            <span className="text-sm text-gray-400">#{user.discriminator}</span>
          </div>
          
          <hr className="my-3 border-t border-white/10" />

          <h4 className="text-xs font-bold uppercase text-gray-400 mb-1 tracking-wide">About Me</h4>
          {user.bio ? (
            <p className="text-sm text-gray-300 mb-3 text-pretty leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-sm text-gray-500 italic mb-3">This user hasn't set a bio yet.</p>
          )}

          <div className="mb-1 text-sm text-gray-300">
            {user.position && <span>{user.position}</span>}
            {user.position && user.company && <span className="text-gray-500"> @ </span>}
            {user.company && <span className="font-medium text-gray-200">{user.company}</span>}
          </div>
          
          <div className="mb-3 text-sm text-gray-400">
            Pronouns: {user.pronouns}
          </div>
          
          <div className="text-xs text-gray-500 mb-4">
            Gangio member since {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
          </div>
          
          {currentUser && currentUser.id !== user.id && (
            <div className="mt-4 space-y-2">
              {friendStatus === 'none' && (
                <button 
                  onClick={handleSendFriendRequest}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Send Friend Request
                </button>
              )}
              
              {friendStatus === 'pending_outgoing' && (
                <button 
                  onClick={handleCancelFriendRequest}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Cancel Request
                </button>
              )}
              
              {friendStatus === 'pending_incoming' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAcceptFriendRequest}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={handleCancelFriendRequest}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Ignore
                  </button>
                </div>
              )}
              
              {friendStatus === 'friends' && (
                <button 
                  onClick={handleRemoveFriend}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Remove Friend
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 
 