'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleManagement } from '@/components/RoleManagement';
import { MemberRoleAssignment } from '@/components/MemberRoleAssignment';
import { CategoryManagement } from '@/components/CategoryManagement';
import { ChannelPermissions } from '@/components/ChannelPermissions';
import { ServerRepairTool } from '@/components/ServerRepairTool';

interface Server {
  id: string;
  name: string;
  icon?: string;
  banner?: string;
  description?: string;
  isOfficial?: boolean;
  ownerId: string;
  inviteCode?: string;
}

interface User {
  id: string;
  name: string;
}

interface ServerSettingsModalProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServerSettingsModal({ serverId, isOpen, onClose }: ServerSettingsModalProps) {
  const [server, setServer] = useState<Server | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [serverName, setServerName] = useState('');
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  const [serverBanner, setServerBanner] = useState<string | null>(null);
  const [serverDescription, setServerDescription] = useState('');
  const [isOfficialServer, setIsOfficialServer] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch server data
          const serverResponse = await fetch(`/api/servers/${serverId}`);
          if (!serverResponse.ok) throw new Error('Failed to fetch server');
          const serverData = await serverResponse.json();
          setServer(serverData.server);
          setServerName(serverData.server.name);
          setServerIcon(serverData.server.icon || null);
          setServerBanner(serverData.server.banner || null);
          setServerDescription(serverData.server.description || '');
          setIsOfficialServer(serverData.server.isOfficial || false);

          // Fetch current user
          const user = localStorage.getItem('currentUser');
          if (user) {
            setCurrentUser(JSON.parse(user));
          }

          // Fetch invite code
          const inviteResponse = await fetch(`/api/servers/${serverId}/invite`);
          if (inviteResponse.ok) {
            const inviteData = await inviteResponse.json();
            setInviteCode(inviteData.inviteCode || '');
          }

          // Fetch roles
          const rolesResponse = await fetch(`/api/servers/${serverId}/roles`);
          if (rolesResponse.ok) {
            const rolesData = await rolesResponse.json();
            setRoles(rolesData.roles || []);
            if (rolesData.roles && rolesData.roles.length > 0) {
              setSelectedRole(rolesData.roles[0]);
            }
          }

          // Fetch channels
          const channelsResponse = await fetch(`/api/servers/${serverId}/channels`);
          if (channelsResponse.ok) {
            const channelsData = await channelsResponse.json();
            setChannels(channelsData.channels || []);
          }
        } catch (err) {
          console.error('Error:', err);
          setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [serverId, isOpen]);

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure currentUser and its ID are available before proceeding
    if (!currentUser?.id || !server) {
      setError('User information is not available. Please refresh.');
      return;
    }

    const userId = currentUser.id;

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          icon: serverIcon,
          banner: serverBanner,
          description: serverDescription,
          isOfficial: isOfficialServer,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update server');
      }

      setSuccess('Server settings updated successfully');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const generateNewInviteCode = async () => {
    if (!currentUser || !server) return;

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/servers/${serverId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate invite code');
      }

      const data = await response.json();
      setInviteCode(data.inviteCode);
      setSuccess('New invite code generated successfully');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!currentUser || !server) return;

    if (window.confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      try {
        setUpdating(true);
        const response = await fetch(`/api/servers/${serverId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete server');
        }

        onClose();
        window.location.href = '/';
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setUpdating(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl h-[90vh] bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Server Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-gray-900 p-4 overflow-y-auto">
                <nav>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'general'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        General
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('roles')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'roles'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        Roles
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('members')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'members'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        Members
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('categories')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'categories'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        Categories
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('permissions')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'permissions'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        Channel Permissions
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab('advanced')}
                        className={`w-full text-left px-4 py-2 rounded transition-colors ${
                          activeTab === 'advanced'
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        Advanced
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-200">
                        {success}
                      </div>
                    )}

                    {activeTab === 'general' && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">General Settings</h3>
                        <form onSubmit={handleUpdateServer}>
                          <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Server Name</label>
                            <input
                              type="text"
                              value={serverName}
                              onChange={(e) => setServerName(e.target.value)}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Server Icon URL</label>
                            <input
                              type="text"
                              value={serverIcon || ''}
                              onChange={(e) => setServerIcon(e.target.value)}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Server Banner URL</label>
                            <input
                              type="text"
                              value={serverBanner || ''}
                              onChange={(e) => setServerBanner(e.target.value)}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Description</label>
                            <textarea
                              value={serverDescription}
                              onChange={(e) => setServerDescription(e.target.value)}
                              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                              rows={3}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="flex items-center text-gray-300">
                              <input
                                type="checkbox"
                                checked={isOfficialServer}
                                onChange={(e) => setIsOfficialServer(e.target.checked)}
                                className="mr-2"
                              />
                              Official Server
                            </label>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Invite Code</label>
                            <div className="flex">
                              <input
                                type="text"
                                value={inviteCode}
                                readOnly
                                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l border border-gray-600"
                              />
                              <button
                                type="button"
                                onClick={generateNewInviteCode}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r"
                              >
                                Generate New
                              </button>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">
                              Share this code to invite others to your server.
                            </p>
                          </div>
                          
                          <div className="flex justify-between mt-6">
                            <button
                              type="button"
                              onClick={handleDeleteServer}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                              disabled={updating}
                            >
                              Delete Server
                            </button>
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
                              disabled={updating}
                            >
                              {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {activeTab === 'roles' && currentUser && (
                      <RoleManagement serverId={serverId} userId={currentUser.id} />
                    )}

                    {activeTab === 'members' && currentUser && (
                      <MemberRoleAssignment serverId={serverId} userId={currentUser.id} />
                    )}

                    {activeTab === 'categories' && currentUser && (
                      <CategoryManagement serverId={serverId} userId={currentUser.id} />
                    )}

                    {activeTab === 'permissions' && currentUser && (
                      <ChannelPermissions
                        serverId={serverId}
                        userId={currentUser.id}
                        roles={roles}
                        channels={channels}
                      />
                    )}

                    {activeTab === 'advanced' && currentUser && (
                      <ServerRepairTool serverId={serverId} userId={currentUser.id} />
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
