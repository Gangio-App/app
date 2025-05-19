'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Channel {
  id: string;
  name: string;
  serverId: string;
  categoryId: string;
  type: 'text' | 'voice' | 'video';
  position: number;
  icon?: string;
}

interface Category {
  id: string;
  name: string;
  serverId: string;
  position: number;
  icon?: string;
}

interface ChannelListModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  categories: Category[];
  channels: Channel[];
  onChannelClick: (channelId: string) => void;
  isOwner: boolean;
}

export const ChannelListModal: React.FC<ChannelListModalProps> = ({
  isOpen,
  onClose,
  serverId,
  categories,
  channels,
  onChannelClick,
  isOwner
}) => {
  const [channelsByCategory, setChannelsByCategory] = useState<Record<string, Channel[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Organize channels by category
  useEffect(() => {
    // Ensure we have valid arrays to work with
    const validCategories = Array.isArray(categories) ? categories : [];
    const validChannels = Array.isArray(channels) ? channels.filter(c => c && typeof c === 'object') : [];
    
    const channelMap: Record<string, Channel[]> = {};
    
    // Initialize categories
    validCategories.forEach(category => {
      if (category && category.id) {
        channelMap[category.id] = [];
      }
    });
    
    // Add uncategorized category if needed
    channelMap['uncategorized'] = [];
    
    // Sort channels into categories
    validChannels.forEach(channel => {
      // Skip invalid channels
      if (!channel) return;
      
      if (channel.categoryId && channelMap[channel.categoryId]) {
        channelMap[channel.categoryId].push(channel);
      } else {
        channelMap['uncategorized'].push(channel);
      }
    });
    
    // Sort channels by position within each category
    Object.keys(channelMap).forEach(categoryId => {
      channelMap[categoryId].sort((a, b) => (a.position || 0) - (b.position || 0));
    });
    
    setChannelsByCategory(channelMap);
    
    // Initialize all categories as expanded
    const initialExpandedState: Record<string, boolean> = {};
    validCategories.forEach(category => {
      if (category && category.id) {
        initialExpandedState[category.id] = true;
      }
    });
    initialExpandedState['uncategorized'] = true;
    setExpandedCategories(initialExpandedState);
  }, [categories, channels]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getChannelIcon = (channel: Channel) => {
    // If channel has a custom icon, use it
    if (channel.icon) {
      return (
        <div className="h-5 w-5 flex-shrink-0 relative overflow-hidden rounded-full">
          <Image 
            src={channel.icon} 
            alt={channel.name} 
            width={20} 
            height={20} 
            className="object-cover"
          />
        </div>
      );
    }

    // Otherwise use default icons based on channel type
    switch (channel.type) {
      case 'voice':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      default: // text channel
        // Check if it's a specific type of text channel by name
        if (channel.name.includes('announcement')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
            </svg>
          );
        } else if (channel.name.includes('welcome')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          );
        } else if (channel.name.includes('rules')) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
            </svg>
          );
        } else {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          );
        }
    }
  };

  const getCategoryIcon = (category: Category) => {
    // If category has a custom icon, use it
    if (category.icon) {
      return (
        <div className="h-5 w-5 flex-shrink-0 relative overflow-hidden rounded-full">
          <Image 
            src={category.icon} 
            alt={category.name} 
            width={20} 
            height={20} 
            className="object-cover"
          />
        </div>
      );
    }

    // Default category icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    );
  };

  // Filter channels based on search query
  const filteredChannels = searchQuery ? 
    (Array.isArray(channels) ? channels : []).filter(channel => 
      channel && channel.name && channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl bg-gray-900/95 backdrop-blur-md border border-white/10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  Channel List
                </h3>
                <p className="text-xs text-gray-400 mt-1">Browse and manage server channels</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Search */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search channels..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {searchQuery ? (
                // Search results
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 px-2 py-1">Search Results</p>
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map(channel => (
                      <div
                        key={channel.id}
                        onClick={() => {
                          onChannelClick(channel.id);
                          onClose();
                        }}
                        className="p-3 bg-gray-800/50 rounded-lg border border-white/5 flex items-center justify-between group hover:bg-gray-700/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-300">{getChannelIcon(channel)}</span>
                          <span className="text-white">{channel.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {Array.isArray(categories) && channel && channel.categoryId ? 
                            (categories.find(c => c && c.id === channel.categoryId)?.name || 'Uncategorized') : 
                            'Uncategorized'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No channels found matching "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                // Categorized channel list
                <div className="space-y-3">
                  {categories.sort((a, b) => (a.position || 0) - (b.position || 0)).map(category => (
                    <div key={category.id} className="mb-2">
                      <div 
                        className="px-2 py-1.5 flex items-center justify-between text-sm text-gray-300 hover:text-white uppercase font-semibold cursor-pointer group rounded-md hover:bg-white/10 transition-colors"
                        onClick={() => toggleCategory(category.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-3.5 w-3.5 transform transition-transform duration-150 ${expandedCategories[category.id] ? 'rotate-90' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span>{category.name}</span>
                          </span>
                        </div>
                        
                        {isOwner && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button className="p-1 rounded hover:bg-gray-600/50 text-gray-400 hover:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {expandedCategories[category.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="space-y-1 mt-1 ml-2"
                          >
                            {(channelsByCategory[category.id] || []).map(channel => (
                              <div
                                key={channel.id}
                                onClick={() => {
                                  onChannelClick(channel.id);
                                  onClose();
                                }}
                                className="group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-100 ease-in-out hover:bg-white/10 text-gray-300 hover:text-white"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-gray-400 group-hover:text-gray-200 transition-colors">
                                    {getChannelIcon(channel)}
                                  </span>
                                  <span className="truncate text-sm font-medium">{channel.name}</span>
                                </div>
                                
                                {isOwner && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <button 
                                      className="p-1 rounded hover:bg-gray-600/50 text-gray-400 hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Edit channel logic would go here
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="p-1 rounded hover:bg-red-600/30 text-gray-400 hover:text-red-400"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Delete channel logic would go here
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  
                  {/* Uncategorized channels */}
                  {channelsByCategory['uncategorized']?.length > 0 && (
                    <div className="mb-2">
                      <div 
                        className="px-2 py-1.5 flex items-center justify-between text-sm text-gray-300 hover:text-white uppercase font-semibold cursor-pointer group rounded-md hover:bg-white/10 transition-colors"
                        onClick={() => toggleCategory('uncategorized')}
                      >
                        <div className="flex items-center space-x-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-3.5 w-3.5 transform transition-transform duration-150 ${expandedCategories['uncategorized'] ? 'rotate-90' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Uncategorized</span>
                          </span>
                        </div>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {expandedCategories['uncategorized'] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="space-y-1 mt-1 ml-2"
                          >
                            {channelsByCategory['uncategorized'].map(channel => (
                              <div
                                key={channel.id}
                                onClick={() => {
                                  onChannelClick(channel.id);
                                  onClose();
                                }}
                                className="group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-100 ease-in-out hover:bg-white/10 text-gray-300 hover:text-white"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-gray-400 group-hover:text-gray-200 transition-colors">
                                    {getChannelIcon(channel)}
                                  </span>
                                  <span className="truncate text-sm font-medium">{channel.name}</span>
                                </div>
                                
                                {isOwner && (
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <button 
                                      className="p-1 rounded hover:bg-gray-600/50 text-gray-400 hover:text-white"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Edit channel logic would go here
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="p-1 rounded hover:bg-red-600/30 text-gray-400 hover:text-red-400"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Delete channel logic would go here
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {isOwner && (
              <div className="p-4 border-t border-white/10 flex justify-between">
                <button
                  className="px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 transition-colors flex items-center space-x-2"
                  onClick={onClose}
                >
                  <span>Cancel</span>
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Create Channel</span>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
