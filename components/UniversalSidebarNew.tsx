'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import { Server } from '@/types/models';
import { ServerContextMenu } from './ServerContextMenu';
import ServerIcon from './ServerIcon';
import { useSettingsModal } from '@/hooks/useSettingsModal';
import { FiUsers as FiSquads, FiMessageSquare, FiSettings, FiLogOut, FiPlus, FiCompass, FiBell, FiUser, FiShare2, FiBox, FiGrid, FiList, FiFileText, FiCheckSquare, FiCalendar, FiGift, FiHelpCircle, FiInfo } from 'react-icons/fi';

// Animation variants for sidebar elements
const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.05
    }
  }
};

// SidebarButton component for navigation items
interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  isActive?: boolean;
  highlight?: boolean;
  pulseEffect?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  onClick,
  href,
  isActive = false,
  highlight = false,
  pulseEffect = false
}) => {
  const [hovered, setHovered] = useState(false);
  
  const ButtonContent = (
    <motion.div 
      className={`relative w-14 h-14 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
                ${isActive ? 'bg-emerald-500/20' : 'bg-gray-800/40 hover:bg-gray-700/60'}
                ${highlight ? 'border-2 border-emerald-500/40' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Pulse effect */}
      {pulseEffect && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-500/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className={`text-xl ${isActive || highlight ? 'text-emerald-500' : 'text-gray-300'}`}>
        {icon}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute left-[4.5rem] z-[9999] py-2 px-3 bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-lg shadow-xl whitespace-nowrap"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-white font-medium text-sm">{label}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
  
  if (href) {
    return (
      <Link href={href} className="block py-2">
        {ButtonContent}
      </Link>
    );
  }
  
  return (
    <div className="py-2" onClick={onClick}>
      {ButtonContent}
    </div>
  );
};

// Separator component
const Separator = () => {
  return <div className="w-10 h-0.5 bg-gray-700/50 mx-auto my-2" />;
};

// Main Sidebar component
interface UniversalSidebarNewProps {
  activeServerId?: string;
  onServerClick?: (serverId: string) => void;
  onCreateServer?: () => void;
}

export const UniversalSidebarNew: React.FC<UniversalSidebarNewProps> = ({
  activeServerId,
  onServerClick,
  onCreateServer
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const settingsModal = useSettingsModal();
  const [servers, setServers] = useState<Server[]>([
    // Temporary test data in case API doesn't work
    {
      id: "server1",
      name: "Gaming Hub",
      ownerId: "user1",
      icon: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "server2",
      name: "Study Group",
      ownerId: "user2",
      icon: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "server3",
      name: "Design Team",
      ownerId: "user1",
      icon: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>("user1"); // Default for testing
  const [hasNewDms, setHasNewDms] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    serverId: string | null;
    serverName: string | null;
    isOwner: boolean;
  }>({ visible: false, x: 0, y: 0, serverId: null, serverName: null, isOwner: false });

  // Check for new DMs
  useEffect(() => {
    const checkUnreadDms = () => {
      if (typeof window !== 'undefined') {
        let unreadFound = false;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('dm_unread_count_')) {
            const count = parseInt(localStorage.getItem(key) || '0', 10);
            if (count > 0) {
              unreadFound = true;
              break;
            }
          }
        }
        setHasNewDms(unreadFound);
      }
    };

    checkUnreadDms(); // Initial check

    // Listen for storage changes to update in real-time
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith('dm_unread_count_')) {
        checkUnreadDms();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Fetch servers with retry logic
  useEffect(() => {
    const fetchServers = async () => {
      setLoading(true);
      
      // Initialize retry variables
      let retryCount = 0;
      let backoffTime = 1000; // Start with 1 second
      const maxRetries = 5; // Increased from 3 to 5 for better resilience

      const attemptFetch = async (): Promise<Server[]> => {
        try {
          // Get current user from localStorage
          const userJson = localStorage.getItem('currentUser');
          if (!userJson) {
            console.warn('[Sidebar] No currentUser found in localStorage.');
            return [];
          }

          const user = JSON.parse(userJson);
          if (!user || !user.id) {
            console.error('[Sidebar] User data or ID missing from localStorage.');
            return [];
          }
          setCurrentUserId(user.id);

          console.log(`[Sidebar] Fetching servers for user ID: ${user.id} (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Set a timeout for the fetch request - increased to 15 seconds to avoid AbortError
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log('[Sidebar] Fetch timeout reached, aborting request');
            controller.abort();
          }, 15000); // 15 second timeout
          
          // Add timestamp for cache busting
          const timestamp = new Date().getTime();
          const response = await fetch(`/api/servers?userId=${user.id}&t=${timestamp}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              // Add authorization header with user ID for better auth handling
              'Authorization': `Bearer ${user.id}`
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            let errorDetails = `Status: ${response.status} ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorDetails += ` - ${JSON.stringify(errorData)}`;
            } catch (e) {
              // Ignore JSON parsing errors
            }
            throw new Error(`Failed to fetch servers: ${errorDetails}`);
          }

          // If response is OK
          const data = await response.json();
          console.log('[Sidebar] Fetched servers for user:', data);

          // Ensure data is an array before setting
          if (Array.isArray(data)) {
            // Process servers to ensure icons are handled correctly
            const processedServers = data.map(server => {
              console.log(`[Sidebar] Processing server ${server.name} (${server.id})`);
              
              // If server has an icon that's not a string, convert it or set to null
              if (server.icon && typeof server.icon !== 'string') {
                console.log(`[Sidebar] Converting non-string icon for server ${server.id}`);
                return {
                  ...server,
                  icon: null // Set to null if not a string
                };
              }
              
              return server;
            });
            
            console.log('[Sidebar] Processed servers:', processedServers);
            return processedServers;
          } else {
            console.warn('[Sidebar] API response was successful but not an array:', data);
            return []; // Return empty array if response format is unexpected
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error(`[Sidebar] Fetch attempt ${retryCount + 1} failed:`, err);
          
          // Check if this is an abort error and log it specifically
          const isAbortError = err instanceof Error && (err.name === 'AbortError' || errorMessage.includes('aborted'));
          if (isAbortError) {
            console.warn('[Sidebar] Request was aborted due to timeout - will retry with longer timeout');
          }
          
          if (retryCount < maxRetries - 1) {
            // Implement exponential backoff with jitter
            const jitter = Math.random() * 500; // Add up to 500ms of random jitter
            const delay = backoffTime + jitter;
            console.log(`[Sidebar] Retrying in ${Math.round(delay)}ms... (attempt ${retryCount + 2}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            backoffTime *= 2; // Double the backoff time for next retry
            retryCount++;
            return attemptFetch(); // Retry
          }
          
          console.error('[Sidebar] All retry attempts failed, using fallback data');
          // Return fallback data after all retries fail
          return [
            {
              id: "fallback-server",
              name: "Reconnecting...",
              ownerId: currentUserId || "unknown",
              icon: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
        }
      };

      try {
        // Attempt to fetch with retries
        const serverData = await attemptFetch();
        setServers(serverData);
      } catch (err) {
        console.error('[Sidebar] Error in fetch process:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on component mount
    fetchServers();
  }, []);

  const handleServerClick = (serverId: string) => {
    if (onServerClick) {
      onServerClick(serverId);
    } else {
      router.push(`/servers/${serverId}`);
    }
  };

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

  return (
    <motion.div 
      className="h-full w-[80px] bg-gray-900/60 backdrop-blur-lg border-r border-gray-800/30 flex flex-col py-4"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      style={{
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Home button */}
      <SidebarButton 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
          </svg>
        }
        label="Home"
        href="/"
        isActive={activeServerId === 'home'}
      />

      {/* Direct Messages button */}
      <SidebarButton
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
          </svg>
        }
        label="Direct Messages"
        href="/direct-messages"
        isActive={pathname ? pathname.startsWith('/direct-messages') : false}
        pulseEffect={hasNewDms}
      />

      <Separator />

      {/* Server list */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 scrollbar-thin scrollbar-thumb-gray-700/80 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-full">
        {loading ? (
          // Loading skeletons
          <div className="space-y-4 mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-14 h-14 rounded-full bg-gray-800/60 mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={servers} 
            onReorder={setServers}
            className="space-y-0.5"
          >
            {servers.map((server) => (
              <Reorder.Item 
                key={server.id} 
                value={server}
                onContextMenu={(event: React.MouseEvent) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const ownerCheck = !!(currentUserId === server.ownerId || (server.ownerId && server.ownerId.toString && server.ownerId.toString() === currentUserId));
                  setContextMenu({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    serverId: server.id,
                    serverName: server.name,
                    isOwner: ownerCheck
                  });
                }}
                className="w-full"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <ServerIcon
                  server={server}
                  isActive={activeServerId === server.id}
                  onClick={() => handleServerClick(server.id)}
                  currentUserId={currentUserId}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      <Separator />

      {/* Bottom icons */}
      <div className="mt-auto space-y-2">
        {/* Discover Mega Menu Button */}
        <div className="relative">
          <SidebarButton
            icon={<FiCompass />} // Using FiCompass, or keep the magnifying glass if preferred
            label="Discover"
            onClick={() => setIsMegaMenuOpen(prev => !prev)}
            isActive={isMegaMenuOpen} // Make button active when menu is open
            pulseEffect={true} // Optional: keep pulse if desired
            highlight={true}   // Optional: keep highlight if desired
          />
          <AnimatePresence>
            {isMegaMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, x: 0 }} // Adjust x to be relative to button, not screen edge
                animate={{ opacity: 1, y: 0, x: 0 }} 
                exit={{ opacity: 0, y: -10, x: 0 }} 
                transition={{ duration: 0.2, ease: 'circOut' }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-4 w-64 bg-gray-850/90 backdrop-blur-md border border-gray-700/60 rounded-lg shadow-xl z-50"
                // Positioning mega menu above the button
              >
                <h3 className="text-white text-lg font-semibold mb-3 text-center">Discover</h3>
                <div className="space-y-2">
                  <Link href="/discover/servers" onClick={() => setIsMegaMenuOpen(false)} className="block py-2 px-3 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors duration-150 text-center">Servers</Link>
                  <Link href="/squad-finder" onClick={() => setIsMegaMenuOpen(false)} className="block py-2 px-3 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors duration-150 text-center">Squad Finder</Link>
                  <Link href="/discover/themes" onClick={() => setIsMegaMenuOpen(false)} className="block py-2 px-3 text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors duration-150 text-center">Themes</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Create Server */}
        <SidebarButton
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          }
          label="Create Server"
          onClick={handleCreateServer}
        />

        {/* Settings */}
        <SidebarButton
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
            </svg>
          }
          label="Settings"
          onClick={() => settingsModal.onOpen('appearance')}
        />

        {/* Logout */}
        <SidebarButton
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          }
          label="Logout"
          onClick={handleLogout}
        />
      </div>

      {/* Render Server Context Menu at the top level of the sidebar or portalled */}
      {contextMenu.visible && contextMenu.serverId && contextMenu.serverName !== null && (
        <ServerContextMenu
          serverId={contextMenu.serverId}
          serverName={contextMenu.serverName}
          isOwner={contextMenu.isOwner}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        />
      )}
    </motion.div>
  );
};