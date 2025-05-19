'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerListContainer } from '@/components/ServersList';
import { RoleManagement } from '@/components/RoleManagement';
import { MemberRoleAssignment } from '@/components/MemberRoleAssignment';
import { CategoryManagement } from '@/components/CategoryManagement';
import { ChannelPermissions } from '@/components/ChannelPermissions';
import { ServerRepairTool } from '@/components/ServerRepairTool';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';

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

interface ServerSettingsClientProps {
  serverId: string;
}

export default function ServerSettingsClient({ serverId }: ServerSettingsClientProps) {
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
  const router = useRouter();

  useEffect(() => {
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
        } else {
          router.push('/login');
          return;
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
  }, [serverId, router]);

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure currentUser and its ID are available before proceeding
    if (!currentUser?.id || !server) {
      setError('User information is not available. Please refresh.');
      return;
    }

    const userId = currentUser.id; // Grab the ID directly

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
          userId: userId, // Use the explicitly grabbed ID
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

        router.push('/');
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setUpdating(false);
      }
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && loadEvent.target.result) {
          setServerIcon(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target && loadEvent.target.result) {
          setServerBanner(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to generate Tailwind classes for tab buttons
  const getTabClassName = (tabName: string) => {
    return `
      px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out 
      focus:outline-none focus:ring-2 focus:ring-opacity-50
      w-full sm:w-auto text-center
      ${activeTab === tabName 
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md focus:ring-emerald-500'
        : 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/50 focus:ring-gray-500'
      }
    `;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto max-w-md text-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <motion.button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  if (!server || !currentUser) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto max-w-md text-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50">
          <h2 className="text-xl font-bold text-white mb-2">Server not found</h2>
          <p className="text-gray-300 mb-4">The server you're looking for doesn't exist or you don't have permission to view it.</p>
          <motion.button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 text-white rounded-md text-sm transition-colors duration-150"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser.id === server.ownerId;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden"> 
      <UniversalSidebarNew activeServerId={serverId} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-full mx-auto"> 
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6 shadow-lg flex items-center space-x-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 text-green-300 p-4 rounded-lg mb-6 shadow-lg flex items-center space-x-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </motion.div>
          )}

          {server && currentUser ? (
            <>
              {/* Header Section */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  {server.icon ? (
                    <img src={server.icon} alt={`${server.name} icon`} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
                      {server.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white">{server.name}</h1>
                    <p className="text-sm text-gray-400">Server Settings</p>
                  </div>
                </div>
                <Link href={`/servers/${serverId}`} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/70 text-white rounded-md text-sm transition-colors duration-150">
                  Back to Server
                </Link>
              </div>

              {/* Tab Navigation - Made Responsive */}
              <div className="mb-8 flex flex-col sm:flex-row sm:flex-wrap gap-2 border-b border-gray-700 pb-4">
                {['general', 'invites', 'roles', 'members', 'categories', 'permissions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={getTabClassName(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="max-w-3xl">
                      <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-lg p-6 mb-6 relative overflow-hidden">
                        {/* Glassmorphism effects */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        
                        <h2 className="text-xl font-semibold text-white mb-4 relative z-10">Server Information</h2>
                        
                        <form onSubmit={handleUpdateServer}>
                          <div className="space-y-6 relative z-10">
                            {/* Banner Preview */}
                            <div className="relative">
                              <div 
                                className="w-full h-40 rounded-lg bg-gray-700 mb-4 flex items-center justify-center overflow-hidden cursor-pointer group"
                                onClick={() => document.getElementById('server-banner')?.click()}
                              >
                                {serverBanner ? (
                                  <img 
                                    src={serverBanner} 
                                    alt="Server banner" 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Upload Banner Image</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-white font-medium">Click to change banner</span>
                                </div>
                              </div>
                              <input
                                id="server-banner"
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="hidden"
                                disabled={!isOwner}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Server Name
                                </label>
                                <input
                                  type="text"
                                  value={serverName}
                                  onChange={(e) => setServerName(e.target.value)}
                                  className="w-full px-4 py-2 bg-gray-700/70 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all"
                                  placeholder="Enter server name"
                                  disabled={!isOwner}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  Server Icon
                                </label>
                                <div 
                                  className="w-24 h-24 rounded-full bg-gray-700/70 mb-4 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                                  onClick={() => document.getElementById('server-icon')?.click()}
                                >
                                  {serverIcon ? (
                                    <img 
                                      src={serverIcon} 
                                      alt="Server icon" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <span className="text-white text-3xl font-medium">
                                      {serverName.substring(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs">Change</span>
                                  </div>
                                </div>
                                <input
                                  id="server-icon"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleIconChange}
                                  className="hidden"
                                  disabled={!isOwner}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server Description
                              </label>
                              <textarea
                                value={serverDescription}
                                onChange={(e) => setServerDescription(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700/70 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all min-h-24"
                                placeholder="Describe your server (optional)"
                                disabled={!isOwner}
                              />
                            </div>
                            
                            {isOwner && (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="official-server"
                                  checked={isOfficialServer}
                                  onChange={(e) => setIsOfficialServer(e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-gray-700"
                                />
                                <label htmlFor="official-server" className="ml-2 block text-sm text-gray-300">
                                  Mark as official server
                                </label>
                              </div>
                            )}
                            
                            <button
                              type="submit"
                              disabled={updating || !isOwner}
                              className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                              {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      </div>
                      
                      <ServerRepairTool serverId={server.id} userId={currentUser.id} />

                      {/* Danger Zone - Delete Server */}
                      {isOwner && (
                        <div className="mt-10 pt-6 border-t border-red-500/30">
                          <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
                          <p className="text-sm text-gray-400 mb-4">
                            Deleting your server is a permanent action and cannot be undone. All data associated with this server will be lost.
                          </p>
                          <motion.button
                            onClick={handleDeleteServer}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-md bg-red-600/80 hover:bg-red-700/90 text-white transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            Delete Server Permanently
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'invites' && (
                  <motion.div
                    key="invites"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="max-w-2xl">
                      <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Invite Management</h2>
                        
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Server Invite Code
                            </label>
                            <div className="flex">
                              <input
                                type="text"
                                value={inviteCode}
                                readOnly
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(inviteCode);
                                  setSuccess('Invite code copied to clipboard!');
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-r-md border border-gray-600"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-400">
                              Share this code with others to invite them to your server.
                            </p>
                          </div>

                          {inviteCode && (
                            <div className="mt-6">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Invite Link
                              </label>
                              <div className="flex">
                                <input
                                  type="text"
                                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inviteCode}`}
                                  readOnly
                                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${inviteCode}`;
                                    navigator.clipboard.writeText(link);
                                    setSuccess('Invite link copied to clipboard!');
                                  }}
                                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-r-md border border-gray-600"
                                >
                                  Copy Link
                                </button>
                              </div>
                              <p className="mt-2 text-sm text-gray-400">
                                Or share this full link directly.
                              </p>
                            </div>
                          )}
                          
                          {isOwner && (
                            <div>
                              <button
                                onClick={generateNewInviteCode}
                                disabled={updating}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
                              >
                                {updating ? 'Generating...' : 'Generate New Invite Code'}
                              </button>
                              <p className="mt-2 text-sm text-gray-400">
                                This will invalidate the current invite code and create a new one
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'roles' && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RoleManagement serverId={server.id} userId={currentUser.id} />
                  </motion.div>
                )}
                
                {activeTab === 'members' && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MemberRoleAssignment serverId={server.id} userId={currentUser.id} />
                  </motion.div>
                )}
                
                {activeTab === 'categories' && (
                  <motion.div
                    key="categories"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CategoryManagement serverId={server.id} userId={currentUser.id} />
                  </motion.div>
                )}
                
                {activeTab === 'permissions' && (
                  <motion.div
                    key="permissions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="max-w-4xl">
                      <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-lg p-6 relative overflow-hidden">
                        {/* Glassmorphism effects */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                        
                        <h2 className="text-xl font-semibold text-white mb-6 relative z-10">Channel Permissions</h2>
                        
                        {roles.length > 0 ? (
                          <div className="space-y-6 relative z-10">
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Select Role
                              </label>
                              <select
                                value={selectedRole ? selectedRole._id : ''}
                                onChange={(e) => {
                                  const role = roles.find(r => r._id === e.target.value);
                                  setSelectedRole(role || null);
                                }}
                                className="w-full px-4 py-2 bg-gray-700/70 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
                              >
                                {roles.map(role => (
                                  <option key={role._id} value={role._id}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {selectedRole && (
                              <ChannelPermissions 
                                serverId={server.id} 
                                userId={currentUser.id} 
                                roles={selectedRole ? [selectedRole] : []} 
                                channels={channels} 
                              />
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <p className="text-lg font-medium">No roles found</p>
                            <p className="mt-2">Create roles in the Roles tab first</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            !error && <p className="text-center text-gray-400 py-10">No server data found or user not authenticated.</p>
          )}
        </div>
      </main>
    </div>
  );
}