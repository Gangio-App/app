'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Server } from '@/types/models';
import { DonateModal } from './ui/DonateModal';
import SettingsModal from './SettingsModal';
import Link from 'next/link';
import { ServerContextMenu } from './ServerContextMenu';

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  href?: string;
  pulse?: boolean;
  animateHover?: boolean;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ 
  icon, 
  label, 
  onClick, 
  active = false,
  href,
  pulse = false,
  animateHover = true
}) => {
  const Content = (
    <motion.div
      className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-2 cursor-pointer transition-all duration-200 group ${
        active 
          ? 'bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20' 
          : 'bg-gray-700 hover:bg-emerald-600 hover:rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20'
      }`}
      whileHover={animateHover ? { scale: 1.1 } : {}}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/30"
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3], 
            scale: [1, 1.1, 1],
            borderRadius: active ? '16px' : '9999px'
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      )}
      <div className="z-10 text-white group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-sm whitespace-nowrap rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 font-medium border border-gray-700/50">
        {label}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{Content}</Link>;
  }

  return Content;
};

const DraggableServerList: React.FC<{
  servers: Server[];
  activeServerId?: string;
  onServerClick: (serverId: string) => void;
  currentUserId?: string;
}> = ({ servers, activeServerId, onServerClick, currentUserId }) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    position: { x: number; y: number };
    serverId: string;
    serverName: string;
    isOwner: boolean;
  }>({
    show: false,
    position: { x: 0, y: 0 },
    serverId: '',
    serverName: '',
    isOwner: false
  });

  // Close context menu on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, show: false }));
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleContextMenu = (
    e: React.MouseEvent, 
    server: Server
  ) => {
    e.preventDefault();
    
    const isOwner = server.ownerId === currentUserId;
    
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
      serverId: server.id,
      serverName: server.name,
      isOwner
    });
  };

  return (
    <>
      <div className="w-full flex flex-col items-center mt-2 max-h-[calc(100vh-240px)] relative">
        <motion.div 
          className="w-full flex flex-col items-center overflow-y-auto overflow-x-visible h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-hide"
          ref={constraintsRef}
        >
          {servers.map((server) => (
            <motion.div
              key={server.id}
              className="w-full flex justify-center mb-2"
              drag="y"
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
            >
              <motion.div 
                className={`relative w-12 h-12 rounded-full mb-2 flex items-center justify-center cursor-pointer transition-all duration-200 group ${
                  activeServerId === server.id 
                    ? 'bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/20' 
                    : 'bg-gray-700 hover:bg-emerald-600 hover:rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20'
                }`}
                onClick={() => onServerClick(server.id)}
                onContextMenu={(e) => handleContextMenu(e, server)}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {server.icon ? (
                  <img 
                    src={server.icon} 
                    alt={server.name} 
                    className={`w-full h-full object-cover transition-all duration-200 ${
                      activeServerId === server.id ? 'rounded-2xl' : 'rounded-full group-hover:rounded-2xl'
                    }`}
                  />
                ) : (
                  <span className="text-white font-semibold text-base">
                    {server.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
                {/* Server tooltip */}
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800/90 backdrop-blur-sm text-white text-sm whitespace-nowrap rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 font-medium border border-gray-700/50 pointer-events-none">
                  {server.name}
                  {server.ownerId === currentUserId && (
                    <div className="text-xs text-emerald-400 mt-1">You own this server</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {contextMenu.show && (
        <ServerContextMenu 
          serverId={contextMenu.serverId}
          serverName={contextMenu.serverName}
          isOwner={contextMenu.isOwner}
          position={contextMenu.position}
          onClose={() => setContextMenu(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export const UniversalSidebar: React.FC<{
  activeServerId?: string;
  onCreateServer?: () => void;
  onServerClick?: (serverId: string) => void;
}> = ({ 
  activeServerId, 
  onCreateServer,
  onServerClick = () => {}
}) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const router = useRouter();

  // Check if we're in the direct messages page
  const [isInDM, setIsInDM] = useState(false);

  useEffect(() => {
    // Check current path
    const path = window.location.pathname;
    setIsInDM(path.includes('/direct-messages'));
  }, []);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        // Get current user from localStorage
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userJson);
        const userId = user.id;
        setCurrentUserId(userId);

        // Include userId in the request
        // This will use the ownerId index and serverMembers compound index (userId+serverId)
        const response = await fetch(`/api/servers?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch servers');
        }
        
        const data = await response.json();
        setServers(data);
      } catch (err) {
        console.error('Error fetching servers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  const handleCreateServer = () => {
    if (onCreateServer) {
      onCreateServer();
    } else {
      router.push('/create-server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
    window.location.reload();
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleServerSelection = (serverId: string) => {
    if (onServerClick) {
      onServerClick(serverId);
    } else {
      router.push(`/servers/${serverId}`);
    }
  };

  return (
    <>
      <div className="h-full w-[72px] relative">
        <motion.div 
          className="discord-sidebar h-full w-[72px] flex flex-col items-center py-3 bg-gray-800 border-r border-gray-700 overflow-visible"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Home button */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-7 h-7"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
              </svg>
            }
            label="Home"
            onClick={handleHomeClick}
            active={activeServerId === 'home'}
          />

          {/* Direct Messages button */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.554.535-5.152.535-1.59 0-3.214-.251-5.152-.535C5.372 16.178 4 14.446 4 12.5V6.74c0-1.946 1.37-3.68 3.348-3.97.51-.075 1.03-.143 1.5-.205zm6.75 4.484a.75.75 0 00-.75.75v4.5c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5zm-3.879 7.23l.99-1.98a.75.75 0 00-1.347-.67l-.99 1.98a.75.75 0 001.347.67z" clipRule="evenodd" />
              </svg>
            }
            label="Direct Messages"
            href="/direct-messages"
            active={isInDM && !window.location.pathname.includes('direct-messages-new')}
          />
          
          {/* LiveKit Direct Messages button (Alternative) */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-emerald-400"
              >
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
              </svg>
            }
            label="LiveKit Chat (Alternative)"
            href="/direct-messages-new"
            active={window.location.pathname.includes('direct-messages-new')}
            pulse={true}
          />

          <div className="w-8 h-[2px] bg-gray-700 rounded-full my-2"></div>
          
          {/* Server List */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center space-y-4 py-4">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-12 h-12 rounded-full bg-gray-700/60 animate-pulse"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : (
            <DraggableServerList 
              servers={servers}
              activeServerId={activeServerId}
              onServerClick={handleServerSelection}
              currentUserId={currentUserId}
            />
          )}
          
          {/* Discover servers button */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
              </svg>
            }
            label="Discover Servers"
            href="/discover"
            pulse={true}
          />

          {/* Add server button */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            }
            label="Create a Server"
            onClick={handleCreateServer}
          />

          {/* Donate button */}
          <SidebarIcon
            icon={
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6 text-yellow-400"
              >
                <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a3.833 3.833 0 001.72-.756c.712-.566 1.112-1.35 1.112-2.178 0-.829-.4-1.612-1.113-2.178a3.833 3.833 0 00-1.719-.756V6.75z" clipRule="evenodd" />
              </svg>
            }
            label="Donate"
            onClick={() => setShowDonateModal(true)}
          />

          <div className="mt-auto">
            {/* Settings button */}
            <SidebarIcon
              icon={
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-6 h-6"
                >
                  <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                </svg>
              }
              label="Settings"
              onClick={() => setShowSettingsModal(true)}
            />

            {/* Logout button */}
            <SidebarIcon
              icon={
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-6 h-6 text-red-400"
                >
                  <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              }
              label="Logout"
              onClick={handleLogout}
            />
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showDonateModal && <DonateModal isOpen={showDonateModal} onClose={() => setShowDonateModal(false)} />}
      {showSettingsModal && <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />}
    </>
  );
}; 