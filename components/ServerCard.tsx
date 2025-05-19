import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Server } from '@/types/models';

type SafeServer = {
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  memberCount?: number;
  tags?: string[];
  isVerified?: boolean;
  isPartnered?: boolean;
  createdAt: string | Date;
};

interface ServerCardProps {
  server: SafeServer;
  onClick?: (serverId: string) => void;
}

export const ServerCard: React.FC<ServerCardProps> = ({ server, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(server.id);
    }
  };

  // Default image if server has no icon
  const serverIcon = server.icon || '/images/default-server-icon.png';
  
  // Format creation date
  const createdAt = typeof server.createdAt === 'string' 
    ? new Date(server.createdAt) 
    : server.createdAt;
  
  const createdTimeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <div 
      className="bg-gray-800/60 backdrop-blur-md rounded-lg overflow-hidden border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-emerald-900/20 group"
      onClick={handleClick}
    >
      <div className="relative h-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent z-0" />
        
        {/* Server icon */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-700 group-hover:border-emerald-500 transition-colors duration-300 shadow-xl">
            <Image 
              src={serverIcon} 
              alt={server.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Server badges */}
        <div className="absolute top-2 right-2 flex space-x-2 z-20">
          {server.isVerified && (
            <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
          
          {server.isPartnered && (
            <div className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
              </svg>
              Partner
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{server.name}</h3>
        
        <p className="text-gray-300 text-sm line-clamp-2 h-10 mt-1">
          {server.description || "No description provided"}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            {server.memberCount || 0} members
          </div>
          
          <div className="text-gray-400 text-xs">
            Created {createdTimeAgo}
          </div>
        </div>
        
        {/* Server tags */}
        {server.tags && server.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {server.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-700/60 text-emerald-400/90 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {server.tags.length > 3 && (
              <span className="bg-gray-700/60 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                +{server.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-900/50 flex justify-between items-center">
        <Link 
          href={`/servers/${server.id}`} 
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
        >
          View Server
        </Link>
        
        <button 
          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm py-1 px-3 rounded-md transition-colors"
          onClick={e => {
            e.stopPropagation();
            window.location.href = `/servers/${server.id}/join`;
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export const ServerCardSkeleton = () => {
  return (
    <div className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700/50 animate-pulse">
      <div className="h-28 bg-gray-700/30"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-700/30 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-700/30 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700/30 rounded w-2/3"></div>
        <div className="mt-3 flex justify-between">
          <div className="h-4 bg-gray-700/30 rounded w-1/4"></div>
          <div className="h-4 bg-gray-700/30 rounded w-1/3"></div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-900/50 flex justify-between">
        <div className="h-8 bg-gray-700/30 rounded w-1/4"></div>
        <div className="h-8 bg-gray-700/30 rounded w-1/5"></div>
      </div>
    </div>
  );
}; 