import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ServerSettingsButtonProps {
  serverId: string;
  isOwner: boolean;
}

export const ServerSettingsButton: React.FC<ServerSettingsButtonProps> = ({ 
  serverId, 
  isOwner 
}) => {
  // Only render the button if the user is the server owner
  if (!isOwner) {
    return null;
  }
  
  return (
    <Link href={`/server-settings/${serverId}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 hover:bg-emerald-600 text-gray-300 hover:text-white transition-colors"
        title="Server Settings"
        aria-label="Server Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </motion.button>
    </Link>
  );
}; 