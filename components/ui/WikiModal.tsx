import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { IconType } from 'react-icons';
import { FaHome, FaServer, FaBook, FaComments, FaUserShield, FaCog } from 'react-icons/fa';

interface WikiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Toast notification component
interface ToastProps {
  message: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {message}
    </motion.div>
  );
};

// Tooltip component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max"
          >
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sample wiki articles with image previews
interface WikiArticle {
  title: string;
  icon: IconType;
  content: string;
}

interface WikiArticles {
  [key: string]: WikiArticle;
}

const useWikiArticles = (): WikiArticles => {
  const t = useTranslations();
  
  return {

    home: {
      title: t('wiki.title'),
      icon: FaHome,
      content: `
        <div class="space-y-6">
          <div class="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
            <h2 class="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Welcome to the Gangio Wiki</h2>
            <p class="text-gray-300">Your comprehensive guide to mastering Gangio and connecting with your communities.</p>
        <div class="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
          <h2 class="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Welcome to the Gangio Wiki</h2>
          <p class="text-gray-300">Your comprehensive guide to mastering Gangio and connecting with your communities.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <a href="#" data-article="servers" class="p-4 rounded-lg bg-gray-800/80 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-emerald-400 transition-colors">Servers</h3>
            </div>
            <p class="text-gray-400 group-hover:text-gray-300 transition-colors">Learn how to create, join, and manage servers for your communities.</p>
          </a>
          
          <a href="#" data-article="channels" class="p-4 rounded-lg bg-gray-800/80 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-blue-400 transition-colors">Channels</h3>
            </div>
            <p class="text-gray-400 group-hover:text-gray-300 transition-colors">Discover how to use different channel types for communication.</p>
          </a>
          
          <a href="#" data-article="voice" class="p-4 rounded-lg bg-gray-800/80 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-purple-400 transition-colors">Voice & Video</h3>
            </div>
            <p class="text-gray-400 group-hover:text-gray-300 transition-colors">Master voice and video calls powered by LiveKit technology.</p>
          </a>
          
          <a href="#" data-article="roles" class="p-4 rounded-lg bg-gray-800/80 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-amber-400 transition-colors">Roles & Permissions</h3>
            </div>
            <p class="text-gray-400 group-hover:text-gray-300 transition-colors">Set up roles and permissions to manage your community.</p>
          </a>
        </div>
        
        <div class="mt-4">
          <h3 class="text-xl font-semibold mb-2">Community Guidelines</h3>
          <p class="mb-2">Please follow our <a href="#" data-article="guidelines" class="text-emerald-400 hover:underline">community guidelines</a> to ensure a positive experience for everyone.</p>
          <p class="text-sm text-gray-400">Gangio is committed to creating safe and inclusive spaces for all users.</p>
        </div>
      </div>
    `
  },
  servers: {
    title: 'Servers Guide',
    icon: FaServer,
    content: `
      <div class="space-y-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Creating and Joining Servers</h2>
        </div>
        
        <div class="relative p-4 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-700 backdrop-blur-sm overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 mix-blend-overlay"></div>
          <div class="relative z-10">
            <p class="mb-4 text-gray-300">Servers are the main communities in Gangio. Each server can have its own channels, roles, and members.</p>
            
            <div class="flex flex-col md:flex-row gap-6 mt-6">
              <div class="flex-1 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 class="text-lg font-semibold text-emerald-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                  </svg>
                  Creating a Server
                </h3>
                <p class="mb-3 text-gray-300">Click the + button in the server list to create a new server.</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-400">
                  <li>Click the <span class="px-2 py-1 rounded bg-gray-800 text-xs">+</span> button in the server list</li>
                  <li>Choose a name and upload an icon (optional)</li>
                  <li>Set up basic roles and channels</li>
                  <li>Invite your friends to join</li>
                </ol>
              </div>
              
              <div class="flex-1 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 class="text-lg font-semibold text-blue-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Joining a Server
                </h3>
                <p class="mb-3 text-gray-300">To join a server, you need an invite link or code.</p>
                <ol class="list-decimal list-inside space-y-2 text-gray-400">
                  <li>Click the "Join Server" button</li>
                  <li>Enter the invite code</li>
                  <li>Review server rules if available</li>
                  <li>Click "Join" to enter the server</li>
                </ol>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 class="text-lg font-semibold text-blue-400 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Pro Tip
              </h3>
              <p class="text-gray-300">You can customize your server with unique roles, emojis, and banners to make it stand out.</p>
            </div>
          </div>
        </div>
        
        <p class="mt-4"><a href="#" data-article="home" class="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-emerald-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Home
        </a></p>
      </div>
    `
  },
  channels: {
    title: 'Channels Guide',
    icon: FaComments,
    content: `
      <div class="space-y-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Using Channels</h2>
        </div>
        
        <div class="relative p-4 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-700 backdrop-blur-sm overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 mix-blend-overlay"></div>
          <div class="relative z-10">
            <p class="mb-4 text-gray-300">Channels are separate spaces within a server for different topics or types of communication.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700 relative overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 group">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative z-10">
                  <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Text Channels</h3>
                  <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">For text-based conversations and sharing media.</p>
                </div>
              </div>
              
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700 relative overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 group">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative z-10">
                  <div class="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">Voice Channels</h3>
                  <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">For real-time voice communication with others.</p>
                </div>
              </div>
              
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700 relative overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group">
                <div class="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative z-10">
                  <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3 group-hover:bg-amber-500/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">Video Channels</h3>
                  <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">For video calls and screen sharing sessions.</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-white mb-2">Managing Channels</h3>
              <p class="mb-2 text-gray-300">Server admins and users with the proper permissions can create, delete, and organize channels.</p>
              <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <h3 class="text-lg font-semibold text-indigo-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  Channel Categories
                </h3>
                <p class="text-gray-300">Channels can be organized into categories to keep your server tidy and well-structured.</p>
              </div>
            </div>
          </div>
        </div>
        
        <p class="mt-4"><a href="#" data-article="home" class="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-blue-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Home
        </a></p>
      </div>
    `
  },
  voice: {
    title: 'Voice & Video Chat',
    icon: FaCog,
    content: `
      <div class="space-y-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Voice & Video Communication</h2>
        </div>
        
        <div class="relative p-4 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-700 backdrop-blur-sm overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 mix-blend-overlay"></div>
          <div class="relative z-10">
            <p class="mb-4 text-gray-300">Gangio provides high-quality, low-latency voice and video communication powered by LiveKit technology.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 class="text-lg font-semibold text-purple-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                  </svg>
                  Voice Features
                </h3>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Noise suppression and echo cancellation</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Adaptive bit rate for stable connections</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Voice activity detection</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Push-to-talk option</span>
                  </li>
                </ul>
              </div>
              
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h3 class="text-lg font-semibold text-pink-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Video Features
                </h3>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>HD video quality</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Screen sharing capabilities</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Background blur option</span>
                  </li>
                  <li class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span>Low-latency streaming</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h3 class="text-lg font-semibold text-purple-400 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Keyboard Shortcuts
              </h3>
              <div class="grid grid-cols-2 gap-2 text-gray-300">
                <div class="flex items-center">
                  <div class="px-2 py-1 bg-gray-800 rounded text-xs mr-2">Ctrl+M</div>
                  <span>Mute/unmute microphone</span>
                </div>
                <div class="flex items-center">
                  <div class="px-2 py-1 bg-gray-800 rounded text-xs mr-2">Ctrl+V</div>
                  <span>Toggle video</span>
                </div>
                <div class="flex items-center">
                  <div class="px-2 py-1 bg-gray-800 rounded text-xs mr-2">Ctrl+S</div>
                  <span>Start/stop screen share</span>
                </div>
                <div class="flex items-center">
                  <div class="px-2 py-1 bg-gray-800 rounded text-xs mr-2">Ctrl+D</div>
                  <span>Disconnect from call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p class="mt-4"><a href="#" data-article="home" class="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-purple-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Home
        </a></p>
      </div>
    `
  },
  roles: {
    title: 'Roles & Permissions',
    icon: FaBook,
    content: `
      <div class="space-y-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Roles & Permissions</h2>
        </div>
        
        <div class="relative p-4 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-700 backdrop-blur-sm overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 mix-blend-overlay"></div>
          <div class="relative z-10">
            <p class="mb-4 text-gray-300">Roles allow you to organize members and manage permissions in your server.</p>
            
            <div class="mt-6 mb-6">
              <h3 class="text-lg font-semibold text-white mb-3">Understanding Roles</h3>
              <div class="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <p class="mb-3 text-gray-300">Roles are a way to group members and assign permissions to them. You can create roles with different colors and permissions to organize your server.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div class="relative overflow-hidden rounded-lg p-4 border border-gray-700 bg-gradient-to-br from-amber-700/10 to-transparent">
                    <h4 class="text-amber-400 font-medium mb-2">Role Hierarchy</h4>
                    <p class="text-sm text-gray-400">Roles are organized in a hierarchy. Higher roles in the list have more control than lower roles.</p>
                  </div>
                  
                  <div class="relative overflow-hidden rounded-lg p-4 border border-gray-700 bg-gradient-to-br from-orange-700/10 to-transparent">
                    <h4 class="text-orange-400 font-medium mb-2">Role Colors</h4>
                    <p class="text-sm text-gray-400">Each role can have a unique color that will be displayed as the member's name color in chat.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-white mb-3">Common Permissions</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    Administrator
                  </h4>
                  <p class="text-xs text-gray-400">Grants all permissions and bypasses channel-specific permission overrides.</p>
                </div>
                
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd" />
                    </svg>
                    Manage Roles
                  </h4>
                  <p class="text-xs text-gray-400">Allows creating, editing, and deleting roles lower in the hierarchy.</p>
                </div>
                
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                    Manage Channels
                  </h4>
                  <p class="text-xs text-gray-400">Allows creating, editing, and deleting channels.</p>
                </div>
                
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
                    </svg>
                    Manage Messages
                  </h4>
                  <p class="text-xs text-gray-400">Allows deleting messages and pinning messages in channels.</p>
                </div>
                
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Kick Members
                  </h4>
                  <p class="text-xs text-gray-400">Allows removing members from the server.</p>
                </div>
                
                <div class="p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-amber-500/30 transition-all duration-300">
                  <h4 class="text-amber-400 font-medium mb-1 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                    </svg>
                    Ban Members
                  </h4>
                  <p class="text-xs text-gray-400">Allows permanently removing members and preventing them from rejoining.</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <h3 class="text-lg font-semibold text-amber-400 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Best Practices
              </h3>
              <ul class="space-y-2 text-gray-300">
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Keep your role list organized with a clear hierarchy</span>
                </li>
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Use role colors to help identify different groups</span>
                </li>
                <li class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Be careful with administrative permissions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <p class="mt-4"><a href="#" data-article="home" class="inline-flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-amber-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Home
        </a></p>
      </div>
    `
  },
  guidelines: {
    title: 'Community Guidelines',
    icon: FaUserShield,
    content: `
      <h2>Community Guidelines</h2>
      <p>These guidelines help ensure Gangio remains a positive and safe platform for all users.</p>
      <h3>Respect Others</h3>
      <p>Treat everyone with respect. Harassment, hate speech, and discrimination are not tolerated.</p>
      <h3>Appropriate Content</h3>
      <p>Do not share illegal, explicit, or harmful content.</p>
      <h3>Reporting</h3>
      <p>Report violations to server moderators or to Gangio support.</p>
      <p><a href="#" data-article="home">Back to Home</a></p>
    `
  },
  moderation: {
    title: t('wiki.moderation.title'),
    icon: FaUserShield,
    content: `
      <div class="space-y-6">
        <div class="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-red-500/10 border border-purple-500/20">
          <h2 class="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-red-400">${t('wiki.moderation.title')}</h2>
          <p class="text-gray-300">${t('wiki.moderation.shortDesc')}</p>
        </div>

        <div class="grid gap-4">
          <!-- Kick Command -->
          <div class="p-4 rounded-lg bg-gray-800/80 border border-gray-700">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold">Kick</h3>
            </div>
            <p class="text-gray-300 mb-2">${t('wiki.moderation.commands.kick')}</p>
            <div class="bg-gray-900/50 p-2 rounded font-mono text-sm">/kick @user [reason]</div>
          </div>

          <!-- Ban Command -->
          <div class="p-4 rounded-lg bg-gray-800/80 border border-gray-700">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold">Ban</h3>
            </div>
            <p class="text-gray-300 mb-2">${t('wiki.moderation.commands.ban')}</p>
            <div class="bg-gray-900/50 p-2 rounded font-mono text-sm">/ban @user [duration] [reason]</div>
          </div>

          <!-- Mute Command -->
          <div class="p-4 rounded-lg bg-gray-800/80 border border-gray-700">
            <div class="flex items-center mb-2">
              <div class="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold">Mute</h3>
            </div>
            <p class="text-gray-300 mb-2">${t('wiki.moderation.commands.mute')}</p>
            <div class="bg-gray-900/50 p-2 rounded font-mono text-sm">/mute @user [duration] [reason]</div>
          </div>
        </div>

        <div class="mt-6 p-4 rounded-lg bg-gray-900/50">
          <h3 class="text-lg font-semibold mb-2">Duration Format</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-300">
            <li><code>1m</code> = 1 minute</li>
            <li><code>1h</code> = 1 hour</li>
            <li><code>1d</code> = 1 day</li>
            <li><code>1w</code> = 1 week</li>
          </ul>
        </div>
      </div>
    `
  }
  }
};

type ArticleKey = keyof ReturnType<typeof useWikiArticles>;

export const WikiModal: React.FC<WikiModalProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations();
  const WIKI_ARTICLES = useWikiArticles();

  const [currentArticle, setCurrentArticle] = useState<ArticleKey>('home');
  const article = WIKI_ARTICLES[currentArticle];
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;


  
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.dataset.article) {
      e.preventDefault();
      const articleKey = target.dataset.article as ArticleKey;
      setCurrentArticle(articleKey);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">{t(`wiki.${currentArticle}.title`)}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('wiki.search')}
              className="bg-transparent border-none outline-none w-full text-white placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/4 border-r border-gray-700 p-4 overflow-y-auto bg-gray-900">
            <h3 className="font-semibold text-gray-300 mb-3">{t('wiki.articles')}</h3>
            <ul className="space-y-1">
              {Object.entries(WIKI_ARTICLES).map(([key, article]: [string, WikiArticle]) => (
                <li key={key}>
                  <button
                    className={`w-full text-left px-3 py-2 rounded flex items-center ${
                      currentArticle === key 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'hover:bg-gray-800 text-gray-400'
                    }`}
                    onClick={() => setCurrentArticle(key as ArticleKey)}
                  >
                    <article.icon className="w-5 h-5 mr-2" />
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Article Content */}
          <div 
            className="flex-1 p-6 overflow-y-auto prose prose-invert prose-emerald max-w-none"
            onClick={handleLinkClick}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </motion.div>
    </div>
  );
}; 