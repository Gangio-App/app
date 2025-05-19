// Fallback data for when MongoDB is unavailable or slow
import { v4 as uuidv4 } from 'uuid';

// Default server data
export const getDefaultServer = (serverId: string) => ({
  id: serverId,
  name: 'Default Server',
  description: 'This is a fallback server when database is unavailable',
  icon: null,
  banner: null,
  isOfficial: false,
  ownerId: 'system',
  defaultChannelId: `${serverId}-general`,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Default channel data
export const getDefaultChannels = (serverId: string) => [
  {
    id: `${serverId}-general`,
    name: 'general',
    type: 'text',
    serverId: serverId,
    categoryId: `${serverId}-category`,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: `${serverId}-welcome`,
    name: 'welcome',
    type: 'text',
    serverId: serverId,
    categoryId: `${serverId}-category`,
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: `${serverId}-voice`,
    name: 'Voice Chat',
    type: 'voice',
    serverId: serverId,
    categoryId: `${serverId}-category`,
    position: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Default category data
export const getDefaultCategories = (serverId: string) => [
  {
    id: `${serverId}-category`,
    name: 'General',
    serverId: serverId,
    position: 0,
  }
];

// Client-side cache management
export const cacheKey = {
  server: (id: string) => `server_${id}`,
  channels: (id: string) => `channels_${id}`,
  categories: (id: string) => `categories_${id}`,
  userServers: (userId: string) => `user_servers_${userId}`,
};

// Save data to localStorage cache
export const saveToCache = (key: string, data: any, expiryMinutes = 30) => {
  try {
    const item = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
    };
    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('[Cache] Error saving to cache:', error);
    return false;
  }
};

// Get data from localStorage cache
export const getFromCache = (key: string) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
};

// Clear expired cache items
export const clearExpiredCache = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        getFromCache(key); // This will remove the item if expired
      }
    }
  } catch (error) {
    console.error('[Cache] Error clearing expired cache:', error);
  }
};
