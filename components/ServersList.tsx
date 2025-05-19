import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Server } from '@/types/models';

// New interface for context menu
interface ContextMenuOption {
  label: string;
  onClick: () => void;
  isDanger?: boolean;
}

// New ContextMenu component
const ContextMenu: React.FC<{
  options: ContextMenuOption[];
  position: { x: number; y: number };
  onClose: () => void;
}> = ({ options, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 py-1 w-48"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        maxHeight: '400px',
        overflowY: 'auto' 
      }}
    >
      {options.map((option, index) => (
        <div
          key={index}
          className={`px-4 py-2 text-sm ${option.isDanger ? 'text-red-400 hover:bg-red-900/20' : 'text-gray-200 hover:bg-gray-700/50'} cursor-pointer flex items-center gap-2`}
          onClick={() => {
            option.onClick();
            onClose();
          }}
        >
          <span>{option.label}</span>
        </div>
      ))}
    </div>
  );
};

interface ServersListProps {
  servers: Server[];
  onServerClick: (serverId: string) => void;
  activeServerId?: string;
  onCreateServer?: () => void;
}

// Simple tooltip component that doesn't rely on the Radix UI components
const SimpleTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}> = ({ content, children, side = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Position classes based on side
  const getPositionClasses = () => {
    switch (side) {
      case "top": return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "right": return "left-full top-1/2 -translate-y-1/2 ml-2";
      case "bottom": return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left": return "right-full top-1/2 -translate-y-1/2 mr-2";
      default: return "left-full top-1/2 -translate-y-1/2 ml-2";
    }
  };

  return (
    <div className="relative group" 
      onMouseEnter={() => setIsVisible(true)} 
      onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`fixed z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md border border-gray-700 whitespace-nowrap ${getPositionClasses()}`}
          style={{
            pointerEvents: 'none'
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export const ServersList: React.FC<ServersListProps> = ({
  servers,
  onServerClick,
  activeServerId,
  onCreateServer,
}) => {
  const router = useRouter();
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    serverId: string;
    isOwner: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    serverId: '',
    isOwner: false,
  });
  
  // Simple toast implementation
  const showToast = (title: string, description: string, variant?: string) => {
    console.log(`Toast: ${title} - ${description}`);
    // You could implement a real toast notification here
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    return JSON.parse(userJson);
  };

  const handleContextMenu = (e: React.MouseEvent, server: Server) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    const isOwner = currentUser && server.ownerId === currentUser.id;
    const serverIdToUse = server._id;

    if (!serverIdToUse || typeof serverIdToUse !== 'string') {
      console.error('Server object missing _id string:', server);
      return;
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      serverId: serverIdToUse,
      isOwner
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      serverId: '',
      isOwner: false,
    });
  };

  const handleCopyServerId = (serverId: string) => {
    navigator.clipboard.writeText(serverId);
    showToast("Server ID copied", "Server ID (DB) has been copied to clipboard");
    closeContextMenu();
  };

  const handleDeleteServer = async (serverId: string) => {
    if (window.confirm("Are you sure you want to delete this server? This action cannot be undone.")) {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error('User not found');
        await axios.delete(`/api/servers/${serverId}?userId=${currentUser.id}`);
        console.log('Need state update after delete');
        closeContextMenu();
        showToast("Server deleted", "Server has been permanently deleted");
        router.push('/');
      } catch (error) {
        console.error("Failed to delete server:", error);
        showToast("Error", "Failed to delete server", "destructive");
        closeContextMenu();
      }
    }
    closeContextMenu();
  };

  const handleLeaveServer = async (serverId: string) => {
    if (window.confirm("Are you sure you want to leave this server?")) {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) throw new Error("User not found");
        
        await axios.delete(`/api/servers/${serverId}/members/${currentUser.id}`);
        console.log('Need state update after leave');
        closeContextMenu();
        showToast("Server left", "You have left the server");
        router.push('/');
      } catch (error) {
        console.error("Failed to leave server:", error);
        showToast("Error", "Failed to leave server", "destructive");
        closeContextMenu();
      }
    }
    closeContextMenu();
  };

  const handleCreateInvite = async (serverId: string) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error("User not found");
      
      const response = await axios.post(`/api/servers/${serverId}/invite`, {
        userId: currentUser.id,
      });
      
      const inviteCode = response.data.inviteCode;
      if (inviteCode) {
        navigator.clipboard.writeText(`${window.location.origin}/invite/${inviteCode}`);
        showToast("Invite Link Copied", "Invite link copied to clipboard");
      } else {
        throw new Error("Failed to retrieve invite code");
      }
    } catch (error) {
      console.error("Failed to create invite:", error);
      showToast("Error", "Failed to create invite link", "destructive");
    }
    closeContextMenu();
  };

  const getContextMenuOptions = (serverId: string, isOwner: boolean): ContextMenuOption[] => {
    let options: ContextMenuOption[] = [
      { label: "Copy Server ID", onClick: () => handleCopyServerId(serverId) },
    ];

    if (isOwner) {
      options.push(
        { label: "Server Settings", onClick: () => router.push(`/server-settings/${serverId}`) },
        { label: "Create Invite", onClick: () => handleCreateInvite(serverId) },
        { label: "Delete Server", onClick: () => handleDeleteServer(serverId), isDanger: true }
      );
    } else {
      options.push(
        { label: "Leave Server", onClick: () => handleLeaveServer(serverId), isDanger: true }
      );
    }
    return options;
  };

  return (
    <div className="flex flex-col items-center space-y-3 pt-3 px-2 bg-gray-900/80 backdrop-blur-sm overflow-y-auto pb-3 border-r border-white/10 custom-scrollbar">
      {/* Direct Link to Home/DMs placeholder */}  
      <SimpleTooltip content="Direct Messages" side="right">
        <button 
          onClick={() => router.push('/')} 
          className={`relative flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 hover:bg-emerald-600 text-white font-bold text-lg transition-all duration-200 ease-in-out group overflow-hidden ${activeServerId === '@me' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 rounded-xl' : 'hover:rounded-xl'}`}>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
             <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.53 1.467 4.125 4.125 0 0 0-2.4-3.599V19.875c0 .59-.322 1.14-.8 1.494l-.019.013c-.418.295-1.03.43-1.663.43h-.002c-.633 0-1.245-.135-1.663-.43l-.019-.013a2.25 2.25 0 0 1-.8-1.494v-2.078a4.125 4.125 0 0 0-2.4 3.599 2.25 2.25 0 0 1-.53-1.467l-.001-.144-.001-.144a6.375 6.375 0 0 1 12.75 0l-.001.144Z" />
        </svg>
        </button>
      </SimpleTooltip>

      {/* Separator */}
      <div className="h-px w-8 bg-gray-600/50 rounded-full"></div>
      
      {servers.map((server) => {
        const serverIdStr = server._id;
        if (!serverIdStr || typeof serverIdStr !== 'string') {
            console.warn('Skipping server render due to missing/invalid _id string:', server);
            return null;
        }

        return (
          <SimpleTooltip key={serverIdStr} content={server.name} side="right">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => onServerClick(serverIdStr)}
          onContextMenu={(e) => handleContextMenu(e, server)}
        >
              {/* Active server indicator */} 
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-2 w-1 bg-white rounded-r-full transition-all duration-200 ease-in-out ${activeServerId === serverIdStr ? 'h-8' : 'group-hover:h-5 opacity-0 group-hover:opacity-100'}`}></div>
              
              <div 
                className={`flex items-center justify-center h-12 w-12 rounded-3xl bg-gray-700 hover:bg-emerald-600 text-white font-bold text-lg transition-all duration-200 ease-in-out overflow-hidden ${activeServerId === serverIdStr ? 'rounded-2xl bg-emerald-600' : 'hover:rounded-2xl'}`}>
            {server.icon ? (
              <img 
                src={server.icon} 
                alt={server.name} 
                    className="h-full w-full object-cover"
              />
            ) : (
                  <span className="text-xs">{server.name.charAt(0).toUpperCase()}</span>
            )}
              </div>
            </div>
          </SimpleTooltip>
        );
      })}

      {/* Add Server Button */} 
      {onCreateServer && (
        <SimpleTooltip content="Add a Server" side="right">
          <button 
        onClick={onCreateServer}
            className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all duration-200 ease-in-out group hover:rounded-2xl">
            +
          </button>
        </SimpleTooltip>
      )}

      {/* Explore Public Servers Button (Placeholder) */} 
      <SimpleTooltip content="Explore Discoverable Servers" side="right">
        <button 
           onClick={() => router.push('/explore')} 
           className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all duration-200 ease-in-out group hover:rounded-2xl">
           <span className="text-xl">?</span>
        </button>
      </SimpleTooltip>

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          options={getContextMenuOptions(contextMenu.serverId, contextMenu.isOwner)}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

// Component to fetch servers data
export const ServerListContainer: React.FC<{ 
  activeServerId?: string;
  onServerClick: (serverId: string) => void;
  onCreateServer?: () => void;
}> = ({ activeServerId, onServerClick, onCreateServer }) => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        setError(null);
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
          setLoading(false);
          return;
        }
        const currentUser = JSON.parse(userJson);
        const userId = currentUser?._id || currentUser?.id;

        if (!userId || typeof userId !== 'string') {
           throw new Error("Valid User ID (string) not found in local storage.");
        }

        const response = await axios.get(`/api/users/${userId}/mutual-servers?currentUserId=${userId}`);
        
        if (response.data && Array.isArray(response.data.servers)) {
            const validServers = response.data.servers.filter(
                (s: any) => s && typeof s._id === 'string'
            );
            console.log("[ServerListContainer] Fetched and validated servers:", validServers);
            setServers(validServers);
        } else {
            console.warn("[ServerListContainer] Unexpected API response structure:", response.data);
            setServers([]);
        }

      } catch (err) {
        console.error('Failed to fetch servers:', err);
        setError('Could not load servers.');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  if (loading) return <div className="w-20 bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div></div>;
  if (error) return <div className="w-20 bg-gray-900 text-red-400 text-xs p-2">Error</div>;

  return (
    <ServersList
      servers={servers}
      onServerClick={onServerClick}
      activeServerId={activeServerId}
      onCreateServer={onCreateServer}
    />
  );
};