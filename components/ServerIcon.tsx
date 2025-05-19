'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Server } from '@/types/models';
import { useServerSettingsModal } from '@/hooks/useServerSettingsModal';

interface ServerIconProps {
  server: Server;
  isActive: boolean;
  onClick: () => void;
  currentUserId?: string;
}

const ServerIcon: React.FC<ServerIconProps> = ({ 
  server, 
  isActive, 
  onClick,
  currentUserId 
}) => {
  const [hovered, setHovered] = useState(false);
  const isOwner = server.ownerId === currentUserId;
  const serverSettingsModal = useServerSettingsModal();
  const [iconError, setIconError] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const serverRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Only run on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Update tooltip position when server icon is hovered
  useEffect(() => {
    if (hovered && serverRef.current) {
      const rect = serverRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height/2 - 15,
        left: rect.right + 10 // Position to the right of the sidebar
      });
    }
  }, [hovered]);

  // Determine the icon source
  const getIconSrc = () => {
    if (!server.icon) return null;
    
    if (typeof server.icon === 'string') {
      if (server.icon.startsWith('data:')) return server.icon;
      if (server.icon.startsWith('http')) return server.icon;
      return `/api/servers/${server.id}/icon?t=${Date.now()}`;
    }
    
    return null;
  };

  const iconSrc = getIconSrc();

  return (
    <div className="py-2">
    <motion.div
      ref={serverRef}
      className="relative w-full px-3 group"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Server indicator line */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[65%] w-1 bg-emerald-500 rounded-r-full"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Main server button */}
      <motion.div
        className={`relative w-14 h-14 mx-auto rounded-full bg-gray-800/40 cursor-pointer transition-all duration-300 flex items-center justify-center overflow-hidden
                  ${isActive ? 'bg-emerald-500/20' : 'hover:bg-gray-700/60'}
                  ${isOwner ? 'border-2 border-emerald-500/40' : ''}`}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {iconSrc && !iconError ? (
          <div 
            className="w-full h-full overflow-hidden rounded-full"
            data-server-id={server.id}
          >
            <img 
              src={iconSrc}
              alt={server.name}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                console.error(`Failed to load server icon for ${server.name}:`, server.icon);
                setIconError(true);
              }}
            />
          </div>
        ) : (
          <div 
            className={`flex items-center justify-center text-white font-bold w-full h-full
                      ${isActive ? 'text-emerald-500' : 'text-gray-200 group-hover:text-emerald-400'}`}
            data-testid="server-initials"
          >
            {server.name.substring(0, 2).toUpperCase()}
          </div>
        )}

        {/* Owner indicator */}
        {isOwner && (
          <motion.div 
            className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Settings button - only visible when hovered and for server owners */}
      <AnimatePresence>
        {hovered && isOwner && (
          <motion.button
            className="absolute -right-2 top-0 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full shadow-lg z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the server click
              serverSettingsModal.onOpen(server.id);
            }}
            title="Server Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gray-300">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tooltip - rendered with portal outside the sidebar */}
      {isMounted && hovered && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed z-[9999] py-2 px-3 bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-lg shadow-xl whitespace-nowrap"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left
            }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="text-white font-medium text-sm">{server.name}</div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
    </div>
  );
};

export default ServerIcon;
