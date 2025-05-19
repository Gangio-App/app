'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ServerContextMenuProps {
  serverId: string;
  serverName: string;
  isOwner: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ServerContextMenu: React.FC<ServerContextMenuProps> = ({
  serverId,
  serverName,
  isOwner,
  position,
  onClose
}) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (rect.right > viewportWidth) {
        const overflow = rect.right - viewportWidth;
        menuRef.current.style.left = `${position.x - overflow - 10}px`;
      }
      
      if (rect.bottom > viewportHeight) {
        const overflow = rect.bottom - viewportHeight;
        menuRef.current.style.top = `${position.y - overflow - 10}px`;
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, position]);
  
  const handleInvitePeople = () => {
    router.push(`/servers/${serverId}/invite`);
    onClose();
  };
  
  const handleServerSettings = () => {
    router.push(`/servers/${serverId}/settings`);
    onClose();
  };
  
  const handleCreateChannel = () => {
    router.push(`/servers/${serverId}/channels/new`);
    onClose();
  };
  
  const handleLeaveServer = async () => {
    if (confirm(`Are you sure you want to leave ${serverName}?`)) {
      try {
        // If the user is the owner, show different message
        if (isOwner) {
          alert("You cannot leave a server you own. Transfer ownership first or delete the server.");
          return;
        }
        
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return;
        
        const user = JSON.parse(userJson);
        const userId = user.id;
        
        const response = await fetch(`/api/servers/${serverId}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        
        if (response.ok) {
          router.push('/');
          router.refresh();
        } else {
          throw new Error('Failed to leave server');
        }
      } catch (error) {
        console.error('Error leaving server:', error);
        alert('Failed to leave server. Try again.');
      }
    }
    onClose();
  };
  
  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      transformOrigin: 'top left' 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transformOrigin: 'top left',
      transition: { 
        duration: 0.15, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transformOrigin: 'top left',
      transition: { 
        duration: 0.1, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-50 w-56 bg-gray-800/95 backdrop-blur-md rounded-md shadow-lg shadow-black/30 border border-gray-700/50 text-white overflow-hidden"
        style={{ left: position.x, top: position.y }}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={menuVariants}
      >
        <div className="p-2 border-b border-gray-700/50">
          <div className="text-sm font-medium truncate">{serverName}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {isOwner ? 'You own this server' : 'Server actions'}
          </div>
        </div>
        
        <div className="py-1">
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors flex items-center"
            onClick={handleInvitePeople}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Invite People
          </button>
          
          {isOwner && (
            <button 
              className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors flex items-center"
              onClick={() => {
                router.push(`/servers/${serverId}/settings`);
                onClose();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Server Settings
            </button>
          )}
          
          {isOwner && (
            <button 
              className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-600/20 hover:text-emerald-400 transition-colors flex items-center"
              onClick={handleCreateChannel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Channel
            </button>
          )}
        </div>
        
        <div className="border-t border-gray-700/50 py-1">
          <button 
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-600/20 hover:text-red-400 text-red-500/90 transition-colors flex items-center"
            onClick={handleLeaveServer}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 5a1 1 0 10-2 0v4.3l-1.15-1.15a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.3V8z" clipRule="evenodd" />
            </svg>
            {isOwner ? "Delete Server" : "Leave Server"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};