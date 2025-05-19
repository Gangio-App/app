'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MembersListContainer } from './MembersList';

interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  status?: string;
  discriminator?: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
}

interface Member {
  userId: string;
  serverId: string;
  nickname?: string;
  roleIds: string[];
  joinedAt: string;
  user: User;
}

interface MemberRoleAssignmentProps {
  serverId: string;
  userId: string; // Current user ID for checking permissions
}

export const MemberRoleAssignment: React.FC<MemberRoleAssignmentProps> = ({ serverId, userId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [confirmKickId, setConfirmKickId] = useState<string | null>(null);
  const [confirmBanId, setConfirmBanId] = useState<string | null>(null);
  const [serverOwnerId, setServerOwnerId] = useState<string>('');

  // Fetch members and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch server data to get ownerId
        const serverResponse = await fetch(`/api/servers/${serverId}`);
        if (!serverResponse.ok) {
          throw new Error('Failed to fetch server details');
        }
        const serverData = await serverResponse.json();
        setServerOwnerId(serverData.server.ownerId);
        
        // Fetch members
        const membersResponse = await fetch(`/api/servers/${serverId}/members`);
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch server members');
        }
        
        // Fetch roles
        const rolesResponse = await fetch(`/api/servers/${serverId}/roles`);
        if (!rolesResponse.ok) {
          throw new Error('Failed to fetch server roles');
        }
        
        const membersData = await membersResponse.json();
        const rolesData = await rolesResponse.json();
        
        console.log('Members data:', membersData);
        console.log('Roles data:', rolesData);
        
        // Extract members array from the response
        const membersArray = membersData.members || [];
        
        // Sort members by join date (newest first)
        const sortedMembers = membersArray.sort((a: Member, b: Member) => 
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        );
        
        // Extract roles array from the response
        const rolesArray = rolesData.roles || [];
        
        // Sort roles by position (highest first)
        const sortedRoles = [...rolesArray].sort((a: Role, b: Role) => 
          b.position - a.position
        );
        
        setMembers(sortedMembers);
        setRoles(sortedRoles);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [serverId]);

  // Filter members by search query
  const filteredMembers = members.filter(member => {
    const userNameLower = member.user.name.toLowerCase();
    const nicknameLower = member.nickname?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    
    return userNameLower.includes(searchLower) || nicknameLower.includes(searchLower);
  });

  // Handle role assignment toggle
  const handleRoleToggle = async (memberId: string, roleId: string, isActive: boolean) => {
    try {
      // Check if we're trying to modify the server owner's roles
      const memberToUpdate = members.find(m => m.userId === memberId);
      if (!memberToUpdate) {
        throw new Error('Member not found');
      }
      
      // Allow owners to modify their roles, but with some restrictions
      const isServerOwner = memberId === serverOwnerId;
      const isDefaultRole = roles.find(r => r.id === roleId)?.isDefault || false;
      
      // Don't allow removing default role for anyone
      if (isActive && isDefaultRole) {
        setError('Cannot remove the default role from any member');
        return;
      }
      
      setIsUpdating(true);
      setError(null);
      
      // Update roleIds based on the toggle action
      let updatedRoleIds = [...memberToUpdate.roleIds];
      if (isActive) {
        // Remove the role
        updatedRoleIds = updatedRoleIds.filter(id => id !== roleId);
      } else {
        // Add the role
        updatedRoleIds.push(roleId);
      }
      
      // Call the API to update the member
      const response = await fetch(`/api/servers/${serverId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: memberId, // This should be the member's ID we want to update
          roleIds: updatedRoleIds,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update member roles');
      }
      
      // Update local state on success
      setMembers(prev => prev.map(m => {
        if (m.userId === memberId) {
          return { ...m, roleIds: updatedRoleIds };
        }
        return m;
      }));
      
      // Dispatch custom event to notify MembersList component
      const roleUpdateEvent = new Event('role-update');
      window.dispatchEvent(roleUpdateEvent);
      console.log('Role update event dispatched');
      
      // Show success message
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to update roles');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle kick member
  const handleKickMember = async (memberId: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/servers/${serverId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          memberId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to kick member');
      }
      
      // Update local state by removing the member
      setMembers(prev => prev.filter(m => m.userId !== memberId));
      setConfirmKickId(null);
    } catch (err) {
      console.error('Error kicking member:', err);
      setError(err instanceof Error ? err.message : 'Failed to kick member');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle ban member (to be implemented in the API)
  const handleBanMember = async (memberId: string) => {
    try {
      setIsUpdating(true);
      
      // This would be implemented when a ban API exists
      // For now, just kick the member
      await handleKickMember(memberId);
      setConfirmBanId(null);
    } catch (err) {
      console.error('Error banning member:', err);
      setError(err instanceof Error ? err.message : 'Failed to ban member');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <motion.div 
          className="h-12 w-12 rounded-full border-t-4 border-b-4 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-md text-white">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-gray-700/70 hover:bg-gray-600/70 rounded-md transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Member Management</h2>
      </div>
      
      <div className="space-y-6">
        {/* Member search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full px-4 py-2 pl-10 rounded-md bg-gray-700/70 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Members list with role assignment */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="font-semibold text-lg text-emerald-400">Server Members</h3>
            <p className="text-sm text-gray-400">View, manage members, and assign roles</p>
          </div>
          
          {updateSuccess && (
            <motion.div
              className="m-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-md text-emerald-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Member roles updated successfully!</p>
              </div>
            </motion.div>
          )}
          
          <div className="p-4">
            <div className="space-y-3">
              {filteredMembers.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No members found matching your search
                </div>
              ) : (
                filteredMembers.map(member => (
                  <motion.div
                    key={member.userId}
                    className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all"
                    whileHover={{ scale: 1.01 }}
                    layout
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center overflow-hidden shadow-md">
                          {member.user.image ? (
                            <img src={member.user.image} alt={member.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">{member.user?.name ? member.user.name.charAt(0) : '?'}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white flex items-center">
                            {member.nickname || member.user.name}
                            {member.userId === serverOwnerId && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-full border border-emerald-600/30">
                                Owner
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {member.nickname ? `@${member.user.name}` : ''}
                            {member.user.discriminator && `#${member.user.discriminator}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {confirmKickId === member.userId ? (
                          <>
                            <span className="text-sm text-gray-400 mr-2">Kick user?</span>
                            <motion.button 
                              onClick={() => handleKickMember(member.userId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isUpdating || member.userId === serverOwnerId || member.userId === userId}
                            >
                              Yes
                            </motion.button>
                            <motion.button 
                              onClick={() => setConfirmKickId(null)}
                              className="text-gray-400 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              No
                            </motion.button>
                          </>
                        ) : confirmBanId === member.userId ? (
                          <>
                            <span className="text-sm text-gray-400 mr-2">Ban user?</span>
                            <motion.button 
                              onClick={() => handleBanMember(member.userId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isUpdating || member.userId === serverOwnerId || member.userId === userId}
                            >
                              Yes
                            </motion.button>
                            <motion.button 
                              onClick={() => setConfirmBanId(null)}
                              className="text-gray-400 hover:text-white transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              No
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button 
                              onClick={() => setSelectedMemberId(selectedMemberId === member.userId ? null : member.userId)}
                              className={`text-gray-400 hover:text-emerald-400 transition-colors ${selectedMemberId === member.userId ? 'text-emerald-400' : ''}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isUpdating}
                            >
                              Roles
                            </motion.button>
                            {member.userId !== serverOwnerId && member.userId !== userId && (
                              <>
                                <motion.button 
                                  onClick={() => setConfirmKickId(member.userId)}
                                  className="text-gray-400 hover:text-orange-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  disabled={isUpdating}
                                >
                                  Kick
                                </motion.button>
                                <motion.button 
                                  onClick={() => setConfirmBanId(member.userId)}
                                  className="text-gray-400 hover:text-red-400 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  disabled={isUpdating}
                                >
                                  Ban
                                </motion.button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Show current roles */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {roles.filter(role => member.roleIds.includes(role.id)).map(role => (
                        <span 
                          key={role.id}
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{
                            backgroundColor: `${role.color}20`,
                            borderColor: `${role.color}30`,
                            color: role.color
                          }}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                    
                    {/* Role management panel */}
                    <AnimatePresence>
                      {selectedMemberId === member.userId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-gray-700/50 overflow-hidden"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-white">Assign Roles</h4>
                            {member.userId === serverOwnerId && (
                              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                                Server Owner
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {roles.map(role => {
                              const isActive = member.roleIds.includes(role.id);
                              const isServerOwner = member.userId === serverOwnerId;
                              const isDefaultRole = role.isDefault;
                              
                              // Disable toggling default role that's active
                              const isDisabled = 
                                (isDefaultRole && isActive) || // Can't remove default role
                                isUpdating;
                              
                              return (
                                <motion.button
                                  key={role.id}
                                  onClick={() => handleRoleToggle(member.userId, role.id, isActive)}
                                  disabled={isDisabled}
                                  className={`px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center justify-between ${
                                    isActive
                                      ? 'bg-gray-600/70 text-white hover:bg-gray-500/70'
                                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
                                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                                >
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2" 
                                      style={{ backgroundColor: role.color || '#43b581' }}
                                    />
                                    <span>{role.name}</span>
                                  </div>
                                  {isActive && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
 