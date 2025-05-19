'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { RoleEditor } from './RoleEditor';

interface Role {
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  permissions: {
    ADMINISTRATOR: boolean;
    MANAGE_SERVER: boolean;
    MANAGE_ROLES: boolean;
    MANAGE_CHANNELS: boolean;
    MANAGE_INVITES: boolean;
    KICK_MEMBERS: boolean;
    BAN_MEMBERS: boolean;
    CREATE_INVITES: boolean;
    CHANGE_NICKNAME: boolean;
    MANAGE_NICKNAMES: boolean;
    READ_MESSAGES: boolean;
    SEND_MESSAGES: boolean;
    MANAGE_MESSAGES: boolean;
    EMBED_LINKS: boolean;
    ATTACH_FILES: boolean;
    READ_MESSAGE_HISTORY: boolean;
    MENTION_EVERYONE: boolean;
    USE_VOICE: boolean;
    SHARE_SCREEN: boolean;
    PRIORITY_SPEAKER: boolean;
    MUTE_MEMBERS: boolean;
    DEAFEN_MEMBERS: boolean;
    MOVE_MEMBERS: boolean;
    VIEW_CHANNEL: boolean;
    MANAGE_CHANNEL_PERMISSIONS: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoleManagementProps {
  serverId: string;
  userId: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ serverId, userId }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [hierarchyView, setHierarchyView] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reorderStatus, setReorderStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [reorderTimeout, setReorderTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchRoles();
  }, [serverId]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servers/${serverId}/roles`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.roles)) {
        // Sort roles by position (highest first for regular view, lowest first for hierarchy view)
        const sortedRoles = [...data.roles].sort((a, b) => b.position - a.position);
        setRoles(sortedRoles);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (newRole: Partial<Role>) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRole.name || 'New Role',
          color: newRole.color || '#43b581',
          permissions: newRole.permissions || {},
          userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }
      
      // Refresh roles list
      await fetchRoles();
      setIsCreatingRole(false);
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  const handleUpdateRole = async (roleId: string, updatedData: Partial<Role>) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/roles/${roleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedData,
          userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      // Refresh roles list
      await fetchRoles();
      setEditingRoleId(null);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }
      
      // Refresh roles list
      await fetchRoles();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const handleReorderRoles = async (reorderedRoles: Role[]) => {
    setRoles(reorderedRoles);
    setReordering(true);
    
    // Clear any existing timeout
    if (reorderTimeout) {
      clearTimeout(reorderTimeout);
    }
    
    // Set a timeout to update roles only after the user has stopped reordering for a bit
    const timeout = setTimeout(async () => {
      setReorderStatus('saving');
      
      try {
        // Calculate new positions based on order
        const updatedPositions = reorderedRoles.map((role, idx) => ({
          id: role.id,
          position: reorderedRoles.length - idx, // Reverse index for proper hierarchy (highest position at top)
        }));
        
        // Make API call to update positions
        const response = await fetch(`/api/servers/${serverId}/roles/reorder`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roles: updatedPositions,
            userId,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update role positions');
        }
        
        setReorderStatus('success');
        
        // Reset after a short delay
        setTimeout(() => {
          setReorderStatus('idle');
          setReordering(false);
        }, 1500);
      } catch (err) {
        console.error('Error updating role positions:', err);
        setReorderStatus('error');
        
        // Reset after a short delay
        setTimeout(() => {
          setReorderStatus('idle');
          setReordering(false);
          // Refresh to get correct order
          fetchRoles();
        }, 1500);
      }
    }, 1000);
    
    setReorderTimeout(timeout);
  };

  const getStatusIndicator = () => {
    switch (reorderStatus) {
      case 'saving':
        return (
          <span className="flex items-center text-blue-400">
            <motion.div 
              className="h-3 w-3 rounded-full border-t-2 border-b-2 border-blue-400 mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Saving changes...
          </span>
        );
      case 'success':
        return (
          <span className="flex items-center text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Error saving changes
          </span>
        );
      default:
        return null;
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
          onClick={fetchRoles} 
          className="mt-2 px-3 py-1 bg-gray-700/70 hover:bg-gray-600/70 rounded-md transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If we're editing a role, show the role editor
  if (editingRoleId) {
    const roleToEdit = roles.find(role => role.id === editingRoleId);
    if (!roleToEdit) {
      return <div>Role not found</div>;
    }
    
    return (
      <RoleEditor
        role={roleToEdit}
        onSave={(updatedData: Partial<Role>) => handleUpdateRole(editingRoleId, updatedData)}
        onCancel={() => setEditingRoleId(null)}
      />
    );
  }

  // If we're creating a new role, show the role editor with a new role template
  if (isCreatingRole) {
    const newRoleTemplate: Partial<Role> = {
      name: 'New Role',
      color: '#43b581',
      permissions: {
        ADMINISTRATOR: false,
        MANAGE_SERVER: false,
        MANAGE_ROLES: false,
        MANAGE_CHANNELS: false,
        MANAGE_INVITES: false,
        KICK_MEMBERS: false,
        BAN_MEMBERS: false,
        CREATE_INVITES: true,
        CHANGE_NICKNAME: true,
        MANAGE_NICKNAMES: false,
        READ_MESSAGES: true,
        SEND_MESSAGES: true,
        MANAGE_MESSAGES: false,
        EMBED_LINKS: true,
        ATTACH_FILES: true,
        READ_MESSAGE_HISTORY: true,
        MENTION_EVERYONE: false,
        USE_VOICE: true,
        SHARE_SCREEN: true,
        PRIORITY_SPEAKER: false,
        MUTE_MEMBERS: false,
        DEAFEN_MEMBERS: false,
        MOVE_MEMBERS: false,
        VIEW_CHANNEL: false,
        MANAGE_CHANNEL_PERMISSIONS: false,
      }
    };
    
    return (
      <RoleEditor
        role={newRoleTemplate}
        isNew={true}
        onSave={handleCreateRole}
        onCancel={() => setIsCreatingRole(false)}
      />
    );
  }

  const renderHierarchyView = () => {
    // Sort roles by position (lowest first for hierarchy view)
    const hierarchyRoles = [...roles].sort((a, b) => b.position - a.position);
    
    return (
      <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Role Hierarchy</h3>
          <div className="flex items-center">
            {getStatusIndicator()}
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">
          Drag and drop roles to change their hierarchy. Roles at the top have higher permissions and will be displayed first.
          <br />
          Users with multiple roles will inherit permissions from all roles, but their color will be determined by their highest role.
        </p>
        
        <div className="relative mb-4">
          {/* Visual hierarchy legend */}
          <div className="absolute -left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 rounded-full opacity-70"></div>
          
          <Reorder.Group 
            axis="y" 
            values={hierarchyRoles} 
            onReorder={handleReorderRoles}
            className="space-y-2"
          >
            {hierarchyRoles.map((role, index) => (
              <Reorder.Item 
                key={role.id} 
                value={role}
                className="list-none" // Reset list styles
              >
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 cursor-move"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  layoutId={`role-${role.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-6 h-6 mr-3 rounded-md bg-gray-700/60">
                          <span className="text-emerald-400 font-mono text-sm">
                            {hierarchyRoles.length - index}
                          </span>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: role.color || '#43b581' }}
                        ></div>
                      </div>
                      <h3 className="font-medium text-white flex items-center">
                        {role.name}
                        {role.isDefault && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                            Default
                          </span>
                        )}
                        {index === 0 && !role.isDefault && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-800/50 rounded-full text-emerald-300 border border-emerald-700/50">
                            Highest
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Permission badges */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {role.permissions?.ADMINISTRATOR && (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                        Administrator
                      </span>
                    )}
                    {!role.permissions?.ADMINISTRATOR && role.permissions?.MANAGE_SERVER && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Manage Server
                      </span>
                    )}
                    {!role.permissions?.ADMINISTRATOR && role.permissions?.MANAGE_ROLES && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Manage Roles
                      </span>
                    )}
                    {!role.permissions?.ADMINISTRATOR && role.permissions?.MANAGE_CHANNELS && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Manage Channels
                      </span>
                    )}
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
        
        <motion.button
          onClick={() => setHierarchyView(false)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all duration-200 mt-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back to List View
        </motion.button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Roles</h2>
        <div className="flex gap-2">
          {!hierarchyView && (
            <motion.button
              onClick={() => setHierarchyView(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all duration-200 shadow-lg shadow-gray-900/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Hierarchy View
              </span>
            </motion.button>
          )}
          <motion.button
            onClick={() => setIsCreatingRole(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-md transition-all duration-200 shadow-lg shadow-emerald-700/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Role
          </motion.button>
        </div>
      </div>
      
      <p className="text-gray-400">
        Manage server roles and permissions. Create new roles to organize members and control access to channels.
      </p>
      
      {hierarchyView ? (
        renderHierarchyView()
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {roles.map(role => (
              <motion.div 
                key={role.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/80 transition-all duration-200 hover:shadow-md"
                whileHover={{ scale: 1.01 }}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: role.color || '#43b581' }}
                    ></div>
                    <h3 className="font-medium text-white flex items-center">
                      {role.name}
                      {role.isDefault && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                          Default
                        </span>
                      )}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {deleteConfirmId === role.id ? (
                      <>
                        <span className="text-sm text-gray-400 mr-2">Delete this role?</span>
                        <motion.button 
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Yes
                        </motion.button>
                        <motion.button 
                          onClick={() => setDeleteConfirmId(null)}
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
                          onClick={() => setEditingRoleId(role.id)}
                          className="text-gray-400 hover:text-emerald-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={loading}
                        >
                          Edit
                        </motion.button>
                        {!role.isDefault && (
                          <motion.button 
                            onClick={() => setDeleteConfirmId(role.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={loading}
                          >
                            Delete
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Show some key permissions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.permissions?.ADMINISTRATOR && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                      Administrator
                    </span>
                  )}
                  {role.permissions?.MANAGE_SERVER && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      Manage Server
                    </span>
                  )}
                  {role.permissions?.MANAGE_ROLES && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      Manage Roles
                    </span>
                  )}
                  {role.permissions?.KICK_MEMBERS && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">
                      Kick Members
                    </span>
                  )}
                  {role.permissions?.BAN_MEMBERS && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                      Ban Members
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}; 