'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isWithinInterval, subHours, differenceInHours } from 'date-fns';
import { User, Role } from '@/types/models';
import { EnhancedUserCard } from './EnhancedUserCard';
import { UserAvatar } from './UserAvatar';
import { useTranslations } from '@/hooks/useTranslations';

interface ServerMember {
  userId: string;
  serverId: string;
  roleIds: string[];
  nickname?: string;
  joinedAt: string;
  user: User;
  roles?: Role[];
}

interface MembersListProps {
  serverId: string;
  onMemberSelect?: (memberId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({ serverId, onMemberSelect }) => {
  const { t } = useTranslations();
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleGroups, setRoleGroups] = useState<{ [key: string]: ServerMember[] }>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [serverOwnerId, setServerOwnerId] = useState<string | null>(null);
  const memberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch and process members data
  const fetchMembersData = useCallback(async (retryCount = 0) => {
    let fetchedRoles: Role[] = []; // Define roles variable in the outer scope
    try {
      // Fetch server details to get owner ID
      console.log(`Fetching server ${serverId} details...`);
      const serverResponse = await fetch(`/api/servers/${serverId}`);
      
      if (!serverResponse.ok) {
        console.error(`Server details fetch failed with status: ${serverResponse.status}`);
        // If we get a 500 error, retry up to 3 times with exponential backoff
        if (serverResponse.status >= 500 && retryCount < 3) {
          console.log(`Server request failed, retrying (${retryCount + 1}/3)...`);
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          setTimeout(() => fetchMembersData(retryCount + 1), delay);
          return;
        }
        throw new Error(`Failed to fetch server details: ${serverResponse.status}`);
      }
      
      const serverData = await serverResponse.json();
      console.log('Server data received:', serverData);
      setServerOwnerId(serverData.server.ownerId);
      
      // Fetch members
      console.log(`Fetching members for server ${serverId}...`);
      const response = await fetch(`/api/servers/${serverId}/members`);
      if (!response.ok) {
        console.error(`Members fetch failed with status: ${response.status}`);
        if (response.status >= 500 && retryCount < 3) {
          console.log(`Members request failed, retrying (${retryCount + 1}/3)...`);
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => fetchMembersData(retryCount + 1), delay);
          return;
        }
        throw new Error(`Failed to fetch members: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Members data structure:', Object.keys(data));
      console.log('Fetched members:', data.members?.length || 0, 'members');
      
      if (data.members) {
        // Filter out potential null/undefined members just in case
        const validMembers = data.members.filter((m: ServerMember | null) => m && m.user);
        setMembers(validMembers);
        
        // Fetch roles to display them properly
        console.log(`Fetching roles for server ${serverId}...`);
        const rolesResponse = await fetch(`/api/servers/${serverId}/roles`);
        if (!rolesResponse.ok) {
          console.error(`Roles fetch failed with status: ${rolesResponse.status}`);
          // Don't fail entirely if roles can't be fetched, just proceed without them
          fetchedRoles = []; // Set roles to empty array on failure
        } else {
        const rolesData = await rolesResponse.json();
        console.log('Roles data structure:', Object.keys(rolesData));
        console.log('Fetched roles:', rolesData.roles?.length || 0, 'roles');
        // Sort roles by position (highest first)
        fetchedRoles = [...(rolesData.roles || [])].sort((a: Role, b: Role) => b.position - a.position);
        setRoles(fetchedRoles); // Set the roles state with the fetched roles
        }
        
        // Group members by their highest role (Run even if roles failed to fetch)
        const groups: { [key: string]: ServerMember[] } = {};
        const currentRoles = fetchedRoles; // Use the roles fetched in this scope
        
        // First, assign roles to members
        const membersWithRoles = validMembers.map((member: ServerMember) => {
          const memberRoles = member.roleIds
            .map((roleId: string) => currentRoles.find((role: Role) => role.id === roleId))
            .filter((role): role is Role => !!role); // Type guard
          
          return {
            ...member,
            roles: memberRoles
          };
        });
        
        // Then, group by highest role (top position)
        membersWithRoles.forEach((member: ServerMember & { roles: Role[] }) => { // Type assertion
          if (!member.roles || member.roles.length === 0) {
            // If no roles, add to "Members" group
            if (!groups['default']) groups['default'] = [];
            groups['default'].push(member);
            return;
          }
          
          // Find highest position role
          const highestRole = member.roles.reduce((prev, current) => 
            (prev.position > current.position) ? prev : current
          );
            
          const roleId = highestRole.id;
          if (!groups[roleId]) groups[roleId] = [];
            groups[roleId].push(member);
        });
        
        // Sort members by status and then by name within each role group
        Object.keys(groups).forEach(roleId => {
          groups[roleId].sort((a, b) => {
            const statusOrder = {
              'online': 0,
              'idle': 1,
              'dnd': 2,
              'focus': 3, // Add focus status if applicable
              'offline': 4,
              'invisible': 5, // Add invisible status if applicable
              undefined: 6
            };
            
            const aStatus = (a.user.status || 'offline').toLowerCase();
            const bStatus = (b.user.status || 'offline').toLowerCase();
            const aStatusOrder = statusOrder[aStatus as keyof typeof statusOrder] ?? statusOrder.undefined;
            const bStatusOrder = statusOrder[bStatus as keyof typeof statusOrder] ?? statusOrder.undefined;
            
            if (aStatusOrder !== bStatusOrder) {
              return aStatusOrder - bStatusOrder;
            }
            
            const aName = a.nickname || a.user.name || '';
            const bName = b.nickname || b.user.name || '';
            return aName.localeCompare(bName);
          });
        });
        
        setRoleGroups(groups);
      }
      
      // Clear error state if successful
      setError(null);
    } catch (err: unknown) { // Type error
      console.error('Error fetching members:', err);
      // Set specific error message based on error type if possible
      const message = err instanceof Error ? err.message : 'Failed to load members';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  // Add a custom event listener for role updates
  useEffect(() => {
    // Create a custom event handler for role updates
    const handleRoleUpdate = () => {
      fetchMembersData();
    };
    
    // Create a custom event handler for status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      const { userId, status } = event.detail;
      
      // Update the member's status in the local state
      setMembers(prevMembers => {
        return prevMembers.map(member => {
          if (member.user.id === userId) {
            // Create a new member object with updated status
            return {
              ...member,
              user: {
                ...member.user,
                status
              }
            };
          }
          return member;
        });
      });
    };
    
    window.addEventListener('server-role-update', handleRoleUpdate);
    window.addEventListener('user-status-update', handleStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('server-role-update', handleRoleUpdate);
      window.removeEventListener('user-status-update', handleStatusUpdate as EventListener);
    };
  }, [fetchMembersData]);

  useEffect(() => {
    if (serverId) {
      setLoading(true);
      fetchMembersData();
      
      // Set up polling for real-time updates (every 15 seconds)
      refreshTimerRef.current = setInterval(() => {
        fetchMembersData();
      }, 15000);
    }
    
    // Cleanup
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [serverId, fetchMembersData]);
  
  // Check if user joined within the last 24 hours
  const isNewUser = (member: ServerMember) => {
    if (!member.joinedAt) return false;
    const joinDate = new Date(member.joinedAt);
    return differenceInHours(new Date(), joinDate) < 24;
  };

  const handleMemberClick = (userId: string) => {
    setSelectedMemberId(userId);
    if (onMemberSelect) {
      onMemberSelect(userId);
    }
  };

  // Fixed version of the member item with corrected ref assignment
  const setMemberRef = (userId: string) => (el: HTMLDivElement | null) => {
    memberRefs.current[userId] = el;
  };

  // Format user status for display
  const formatStatus = (status: string | undefined) => {
    if (!status) return t('status.offline');
    
    // Map status codes to translated strings
    const statusMap: Record<string, string> = {
      'online': t('status.online'),
      'idle': t('status.idle'),
      'dnd': t('status.doNotDisturb'),
      'focus': t('status.focus'),
      'invisible': t('status.invisible'),
      'offline': t('status.offline')
    };
    
    return statusMap[status] || status;
  };

  // Get status display class
  const getStatusClass = (displayStatus: string) => {
    // Use the translated status strings for comparison
    if (displayStatus === t('status.online')) {
      return 'text-green-400';
    } else if (displayStatus === t('status.idle')) {
      return 'text-yellow-400';
    } else if (displayStatus === t('status.doNotDisturb')) {
      return 'text-red-400';
    } else if (displayStatus === t('status.focus')) {
      return 'text-purple-400';
    } else if (displayStatus === t('status.invisible')) {
      return 'text-gray-500';
    } else {
      return 'text-gray-400';
    }
  };

  // Get avatar glow class based on status
  const getAvatarGlowClass = (status: string | undefined) => {
    switch (status) { // Use original status for glow
      case 'online': return 'ring-1 ring-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]';
      case 'idle': return 'ring-1 ring-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]';
      case 'dnd': return 'ring-1 ring-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]';
      case 'focus': return 'ring-1 ring-purple-500/80 shadow-[0_0_6px_rgba(168,85,247,0.5)]';
      // No glow for offline/invisible
      default: return '';
    }
  };

  if (loading && members.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center h-full">
        <motion.div 
          className="w-8 h-8 border-4 border-gray-600 border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 m-4 bg-red-900/30 border border-red-500/40 rounded text-red-300">
        <p className="font-medium text-sm">Error loading members</p>
        <p className="text-xs opacity-80 mt-1">{error}</p>
        <button 
          onClick={() => fetchMembersData()} 
          className="mt-2 text-xs bg-red-500/50 hover:bg-red-500/70 px-2 py-1 rounded"
        >
            Retry
        </button>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p>No members found in this server.</p>
      </div>
    );
  }

  // Count members by status
  const onlineCount = members.filter(m => 
      m.user.status === 'online' || 
      m.user.status === 'idle' || 
      m.user.status === 'dnd' || 
      m.user.status === 'focus'
  ).length;
  const totalMembers = members.length;

  // Get sorted role IDs using the `roles` state variable
  const sortedRoleIds = Object.keys(roleGroups)
      .sort((roleIdA, roleIdB) => { 
        // Always put owner/admin roles at the top
        if (roleIdA === 'default') return 1; // Default always at the bottom
        if (roleIdB === 'default') return -1;
        
        const roleA = roles.find(r => r.id === roleIdA);
        const roleB = roles.find(r => r.id === roleIdB);
        
        // Higher position roles should come first (descending order)
        return (roleB?.position ?? 0) - (roleA?.position ?? 0);
      });

  return (
    <div className="p-3 space-y-3 h-full overflow-y-auto custom-scrollbar">
      {/* Loading indicator during refresh */}
      {loading && members.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <motion.div 
            className="w-5 h-5 border-2 border-gray-600 border-t-emerald-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      
      {/* Loop through sorted role groups */} 
      {sortedRoleIds.map(roleId => {
        const roleMembers = roleGroups[roleId];
        if (!roleMembers || roleMembers.length === 0) return null; // Skip empty groups

        // Use `roles` state variable to find role details
          const role = roles.find(r => r.id === roleId);
        const roleName = role ? role.name : 'Online'; // Default group name: "Online" or maybe "Members"?
          const roleColor = role?.color || '#99AAB5';
          
          return (
          <div key={roleId} className="space-y-1">
            {/* Role Header - Restyled with proper color */} 
              <h3 
                className="text-xs font-semibold mb-1 uppercase tracking-wider px-1"
                style={{ color: roleId !== 'default' && role?.color ? role.color : '#99AAB5' }}
              >
                {roleName} — {roleMembers.length}
              </h3>
              
            {/* Member List for Role */} 
            <div className="space-y-0.5">
                {roleMembers.map(member => {
                  const isNew = isNewUser(member);
                  const isOwner = serverOwnerId === member.userId;
                const displayStatus = formatStatus(member.user.status);
                const statusClass = getStatusClass(displayStatus);
                  const avatarGlowClass = getAvatarGlowClass(member.user.status);
                  
                  return (
                    <div 
                      key={member.userId}
                      ref={setMemberRef(member.userId)}
                    className="flex items-center p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer group relative"
                      onClick={() => handleMemberClick(member.userId)}
                    title={`${member.nickname || member.user.name} #${member.user.discriminator}`}
                    >
                      {/* User Avatar with glow effect */}
                    <div className={`relative mr-2 flex-shrink-0 rounded-full ${avatarGlowClass}`}>
                        <UserAvatar 
                          user={{
                            id: member.userId,
                            name: member.nickname || member.user.name,
                            image: member.user.avatarUrl,
                            discriminator: member.user.discriminator,
                          status: member.user.status // Pass original status for UserAvatar logic
                          }}
                        size="sm" // Consistent small size
                        />
                      </div>
                      
                      {/* User Info */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                       {/* Name and Badges */} 
                      <div className="flex items-center space-x-1.5">
                        <span 
                          className="text-sm font-medium truncate" 
                          style={{ 
                            color: member.roles && member.roles.length > 0 && member.roles[0].color 
                              ? member.roles[0].color 
                              : '#FFFFFF' 
                          }} // Apply highest role color to name
                        >
                            {member.nickname || member.user.name}
                          </span>
                          {isOwner && (
                          <span className="text-[10px] px-1 py-0 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-medium flex-shrink-0">
                              Owner
                            </span>
                          )}
                          {isNew && (
                          <span className="text-[10px] px-1 py-0 rounded bg-blue-500/30 text-blue-300 border border-blue-500/50 font-medium flex-shrink-0">
                              New
                          </span>
                        )}
                      </div>
                      
                      {/* User Status - Simplified */} 
                      <span className={`text-xs ${statusClass} capitalize`}>
                        {displayStatus}
                         {/* Optionally add game status here */} 
                         {member.user.game && <span className="ml-1 text-gray-400 truncate">- {member.user.game}</span>}
                      </span>
                    </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Full Profile Modal */}
        {selectedMemberId && (
          <EnhancedUserCard
            userId={selectedMemberId}
            onClose={() => setSelectedMemberId(null)}
          />
        )}
    </div>
  );
};

export const MembersListContainer: React.FC<{ serverId: string }> = ({ serverId }) => {
  const { t } = useTranslations();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [canView, setCanView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a member of this server
    const checkMembership = async () => {
      try {
        console.log('Validating membership for server:', serverId);
        
        // Get current user from localStorage
        const user = localStorage.getItem('currentUser');
        if (!user) {
          console.error('No user found in localStorage');
          setLoading(false);
          return;
        }
        
        const parsedUser = JSON.parse(user);
        console.log('Found user in localStorage:', parsedUser.name);
        setCurrentUser(parsedUser);
        
        // Use the access-check endpoint to properly verify server access
        const response = await fetch(`/api/servers/${serverId}/access-check?userId=${parsedUser.id}`);
        if (!response.ok) {
          console.error('Failed to verify server access');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (data.hasAccess) {
          console.log('User has access to this server');
          if (data.isOwner) {
            console.log('User is the server owner');
          }
          setCanView(true);
        } else {
          console.log('User does NOT have access to this server');
        }
      } catch (err) {
        console.error('Error validating server access:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkMembership();
  }, [serverId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6 h-full">
        <motion.div 
          className="w-8 h-8 border-4 border-gray-600 border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-gray-400">{t('common.loading')}...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-4 m-4 bg-yellow-900/30 border border-yellow-500/40 rounded text-yellow-300 text-sm">
        <p>{t('members.pleaseLogin')}</p>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="p-4 m-4 bg-red-900/30 border border-red-500/40 rounded text-red-300 text-sm">
        <p>{t('members.noPermission')}</p>
      </div>
    );
  }

  return <MembersList serverId={serverId} />;
}; 