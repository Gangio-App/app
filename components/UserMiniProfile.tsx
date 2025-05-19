import React, { useState, useEffect } from 'react';
import { User, UserStatus, Badge } from '@/types/models';
import { motion } from 'framer-motion';
import { UserProfile } from './UserProfile';
import Image from 'next/image';
import { FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

// SVG Badge Icons
const BadgeIcons: Record<string, string | JSX.Element> = {
  founder: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
      <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" fill="#FFD700" stroke="#FFC700" strokeWidth="1.5"/>
    </svg>
  ), // Keep founder inline or add to public/images/badges/
  supporter: '/images/badges/supporter-badge.svg',
  developer: '/images/badges/dev-badge.svg',
  translator: '/images/badges/translator-badge.svg',
  betaTester: '/images/badges/beta-tester-badge.svg',
  // 'calendar' seems like a utility icon rather than a badge, but can be added if needed
};

const getBadgeIcon = (iconName: string, badgeName?: string) => {
  const iconData = BadgeIcons[iconName as keyof typeof BadgeIcons] || BadgeIcons[badgeName as keyof typeof BadgeIcons] || null;
  if (typeof iconData === 'string') {
    // Using a fixed size for mini profile, adjust as needed
    return <Image src={iconData} alt={badgeName || iconName} width={14} height={14} className="object-contain" />;
  }
  return iconData; // Should be a JSX.Element or null
};


interface UserMiniProfileProps {
  userId: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  onClose?: () => void;
}

export const UserMiniProfile: React.FC<UserMiniProfileProps> = ({ 
  userId, 
  position = 'right',
  onClose 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullProfile, setShowFullProfile] = useState(false);
  
  useEffect(() => {
    // Create a cache key for this user
    const cacheKey = `user_${userId}`;
    
    // Try to get from session storage first
    const cachedUser = sessionStorage.getItem(cacheKey);
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setUser(parsedUser);
        setLoading(false);
        // Still fetch in background to update cache
      } catch (e) {
        // Invalid cache, will fetch normally
        console.warn('Invalid cached user data');
      }
    }
    
    // Track if component is still mounted
    let isMounted = true;
    
    const fetchUser = async () => {
      // Don't set loading to true if we already have cached data
      if (!cachedUser && isMounted) {
        setLoading(true);
      }
      
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
          // Add cache headers
          headers: {
            'Cache-Control': 'max-age=3600'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          } else {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
          }
        }
        
        const userData = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setUser(userData);
          setError(null);
          
          // Cache the result
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(userData));
          } catch (e) {
            console.warn('Failed to cache user data:', e);
          }
        }
      } catch (err: unknown) {
        console.error('Error fetching user:', err);
        
        // Only update error state if component is still mounted and we don't have cached data
        if (isMounted && !user) {
          // For network errors, create a fallback user object with minimal data
          if (err instanceof Error && 
              (err.name === 'AbortError' || 
               err.message.includes('network') || 
               err.message.includes('500'))) {
            // Create a fallback user with the ID we know
            const fallbackUser: User = {
              id: userId,
              name: 'User',
              discriminator: '0000',
              status: 'offline' as UserStatus,
              avatarUrl: undefined,
              bannerUrl: undefined,
              bio: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              badges: []
            };
            
            setUser(fallbackUser);
            setError('Could not load user details');
          } else {
            setError(err instanceof Error ? err.message : 'Failed to load user');
          }
        }
      } finally {
        // Only update loading state if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [userId, user]);
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2 left-0';
      case 'bottom':
        return 'top-full mt-2 left-0';
      case 'left':
        return 'right-full mr-2 top-0';
      case 'right':
      default:
        return 'left-full ml-2 top-0';
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
    return <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${bgColor} rounded-full border-2 border-gray-800/80`}></div>;
  };
  
  if (loading) {
    return (
      <div className={`absolute ${getPositionClasses()} z-50`}>
        <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 shadow-xl border border-gray-700/50 w-64 user-mini-profile">
          <div className="flex justify-center items-center h-20">
            <motion.div 
              className="w-6 h-6 border-2 border-gray-600 border-t-emerald-500 rounded-full"
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
      <div className={`absolute ${getPositionClasses()} z-50`}>
        <div className="bg-red-900/50 backdrop-blur-md rounded-lg p-4 shadow-xl border border-red-500/30 w-64 user-mini-profile">
          <p className="text-red-300 text-sm text-center">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`absolute ${getPositionClasses()} z-50 w-64`}
      >
        <div className="bg-gray-800/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-700/50 overflow-hidden user-mini-profile">
          <div className="h-16 bg-gradient-to-r from-gray-700/50 to-gray-600/50 relative">
            {user.bannerUrl ? (
              <Image 
                src={user.bannerUrl} 
                alt="Banner" 
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/20 to-gray-800/30"></div>
            )}
            
            <div className="absolute bottom-0 left-3 transform translate-y-1/2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-700 border-4 border-gray-800/80 flex items-center justify-center overflow-hidden shadow-md">
                {user.avatarUrl ? (
                    <Image 
                    src={user.avatarUrl} 
                    alt={user.name} 
                      width={64} 
                      height={64} 
                      className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
                <StatusIcon status={user.status} />
              </div>
            </div>
            
            {Array.isArray(user.badges) && user.badges.length > 0 && (
              <div className="absolute bottom-1 right-3 flex space-x-1.5">
                {user.badges.map((badge: Badge) => (
                  <div 
                    key={badge.id} 
                    className="w-5 h-5 rounded-full bg-gray-900/50 backdrop-blur-sm border border-white/10 flex items-center justify-center group relative transition-all duration-200 hover:scale-110"
                    title={`${badge.name}${badge.description ? `: ${badge.description}` : ''}`}
                  >
                    {getBadgeIcon(badge.icon, badge.name)}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 pt-10">
            <div className="flex items-baseline">
              <h3 className="text-base font-semibold text-white truncate">{user.name}</h3>
              <span className="ml-1 text-xs text-gray-400">#{user.discriminator}</span>
            </div>
            
            <hr className="my-2 border-t border-gray-700/50" />

            <h4 className="text-xs font-bold uppercase text-gray-400 mb-1 tracking-wide">About Me</h4>
            {user.bio ? (
              <p className="text-sm text-gray-300 mb-2 text-pretty text-[13px] leading-snug">{user.bio}</p>
            ) : (
              <p className="text-sm text-gray-500 italic mb-2">No bio set.</p>
            )}

            {(user.position || user.company) && (
              <div className="mt-1 text-xs text-gray-300">
                {user.position && <span>{user.position}</span>}
                {user.position && user.company && <span> @ </span>}
                {user.company && <span className="font-medium text-gray-200">{user.company}</span>}
              </div>
            )}
            
            {user.pronouns && (
              <div className="mt-1 text-gray-400 text-xs">
                Pronouns: {user.pronouns}
              </div>
            )}

            {/* Member Since */}
            {user.createdAt && (
              <div className="mt-2 text-xs text-gray-400 flex items-center">
                <FaCalendarAlt className="mr-1.5 flex-shrink-0" />
                <span>Member since {format(new Date(user.createdAt), 'MMM yyyy')}</span>
              </div>
            )}
            
            <button 
              onClick={() => setShowFullProfile(true)}
              className="mt-3 px-3 py-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-md text-xs w-full transition-all duration-200 font-medium shadow-md hover:shadow-emerald-500/20"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </motion.div>
      
      {showFullProfile && (
        <UserProfile 
          userId={userId} 
          onClose={() => {
            setShowFullProfile(false);
            if (onClose) onClose();
          }} 
        />
      )}
    </>
  );
}; 
 