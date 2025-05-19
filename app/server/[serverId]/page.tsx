'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ServerListContainer } from '@/components/ServersList';
import { MembersListContainer } from '@/components/MembersList';
import SettingsModal from '@/components/settings/SettingsModal';
import { VideoChat } from '@/components/VideoChat';

export default function ServerPage({ params }: { params: { serverId: string } }) {
  const [server, setServer] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeChannelType, setActiveChannelType] = useState<'text' | 'voice' | 'video' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  // Load current user
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      // Redirect to login if no user is found
      router.push('/login');
    }
  }, [router]);

  // Fetch server data
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/servers/${params.serverId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load server');
        }
        
        const data = await response.json();
        setServer(data.server);
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching server:', err);
        setError(err instanceof Error ? err.message : 'Failed to load server');
      } finally {
        setLoading(false);
      }
    };

    if (params.serverId) {
      fetchServerData();
    }
  }, [params.serverId]);

  const handleChannelClick = (channelId: string, channelType: 'text' | 'voice' | 'video') => {
    setActiveChannelId(channelId);
    setActiveChannelType(channelType);
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/server/${serverId}`);
  };

  const handleCreateServer = () => {
    router.push('/create-server');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="m-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="m-auto text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-16 h-16 mx-auto mb-4 text-red-500"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2 text-white">Server Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The server could not be loaded.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwner = server.ownerId === currentUser?.id;

  return (
    <div className="flex h-screen bg-gray-900">
      
      
      {/* Server sidebar */}
      <div className="w-60 bg-gray-800 flex-shrink-0 border-r border-gray-700 h-full flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white truncate">{server.name}</h1>
          {isOwner && (
            <Link 
              href={`/server-settings/${params.serverId}`}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 016.126 3.537zM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 010 .75l-1.732 3.001c-.229.396-.76.498-1.067.16A5.231 5.231 0 016.75 12c0-1.362.519-2.603 1.37-3.536zM10.878 17.13c-.447-.07-.574-.582-.352-.95l1.732-3.001a.75.75 0 01.65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 01-6.167 3.484z" 
                />
                <path 
                  fillRule="evenodd" 
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 16.5a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" 
                  clipRule="evenodd" 
                />
              </svg>
            </Link>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {categories.map((category) => (
            <div key={category.id} className="mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1 flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-3 h-3 mr-1"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" 
                    clipRule="evenodd" 
                  />
                </svg>
                {category.name}
              </h2>
              
              <div className="space-y-0.5">
                {category.channels?.map((channel: any) => (
                  <div
                    key={channel.id}
                    className={`px-2 py-1.5 rounded-md cursor-pointer flex items-center ${
                      activeChannelId === channel.id
                        ? 'bg-emerald-600/20 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                    onClick={() => handleChannelClick(channel.id, channel.type)}
                  >
                    <span className="mr-2">
                      {channel.type === 'text' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.995 41.995 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                        </svg>
                       : 
                      channel.type === 'voice' ? 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                          <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                        </svg>
                       : 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                        </svg>
                      }
                    </span>
                    <span className="truncate">{channel.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* User info */}
        <div className="p-3 bg-gray-700 flex items-center">
          <div className="w-9 h-9 rounded-full bg-gray-600 flex-shrink-0 mr-2 flex items-center justify-center">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-medium">
                {currentUser?.name?.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-white truncate">
              {currentUser?.name}
              <span className="text-gray-400">#{currentUser?.discriminator}</span>
            </div>
            <div className="text-xs text-emerald-400">Online</div>
          </div>
          <button 
            onClick={() => setSettingsOpen(true)} 
            className="ml-auto text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-gray-600"
            title="User Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Channel header */}
        {activeChannelId && (
          <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800">
            <div className="flex items-center">
              <span className="mr-2">
                {activeChannelType === 'text' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.995 41.995 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                  </svg>
                : 
                activeChannelType === 'voice' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                  </svg>
                : 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                  </svg>
                }
              </span>
              <h2 className="font-semibold text-white">
                {categories.flatMap(c => c.channels || []).find((c: any) => c.id === activeChannelId)?.name || 'Unknown Channel'}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              {activeChannelType === 'voice' || activeChannelType === 'video' ? (
                <>
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                      <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                    </svg>
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M10 3.75a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0v-10.5A.75.75 0 0010 3.75z" />
                      <path d="M10.25 1a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V1zM4.5 4A2.5 2.5 0 002 6.5v1a.75.75 0 001.5 0v-1A1 1 0 014.5 5.5h1a.75.75 0 000-1.5h-1zM16 6.5A2.5 2.5 0 0013.5 4h-1a.75.75 0 000 1.5h1a1 1 0 011 1v1a.75.75 0 001.5 0v-1zM4.5 15H6v.5A2.5 2.5 0 008.5 18h3a2.5 2.5 0 002.5-2.5V15h1.5a.75.75 0 000-1.5h-1a.75.75 0 00-.75.75v1.25a1 1 0 01-1 1h-3a1 1 0 01-1-1V14.25a.75.75 0 00-.75-.75h-1a.75.75 0 000 1.5z" />
                    </svg>
                  </button>
                </>
              ) : (
                <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Channel content */}
        <div className="flex-1 overflow-hidden">
          {activeChannelId && currentUser ? (
            activeChannelType === 'voice' || activeChannelType === 'video' ? (
              <VideoChat
                userId={currentUser.id}
                channelId={activeChannelId}
                channelType={activeChannelType}
              />
            ) : (
              <div className="p-4 text-gray-400 h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-600">
                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Text channels not implemented in this demo</p>
                  <p>Try joining a voice or video channel to experience real-time communication features.</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400 max-w-md p-4">
                <h3 className="text-xl font-bold mb-2 text-white">Welcome to {server.name}!</h3>
                <p>Select a channel from the sidebar to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Members list */}
      <MembersListContainer serverId={params.serverId} />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
} 