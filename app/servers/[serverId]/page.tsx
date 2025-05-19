'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ThreeBackground from '@/components/ui/ThreeBackground';
import { getDefaultChannels, getDefaultCategories, getFromCache, saveToCache, cacheKey } from '@/lib/fallback-data';

// This component primarily acts as a loading/redirector page.
// It fetches server data to find the first channel and redirects.
export default function ServerPage() {
  const params = useParams(); // Get params using the hook
  const serverId = params?.serverId as string; // Access serverId safely (add type assertion)
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServerAndRedirect() {
      // Validate serverId (basic check)
      if (!serverId || typeof serverId !== 'string') {
        console.error('Invalid serverId param:', serverId);
        setError('Invalid server link.');
        setLoading(false);
        return;
      }

      try {
        // First, check if user has access to this server
        console.log(`[ServerPage] Checking access for server: ${serverId}`);
        
        // Try multiple ways to get the user ID
        let userId = null;
        try {
          // First try to get userId directly
          userId = localStorage.getItem('userId');
          
          // If not found, try to get from currentUser object
          if (!userId) {
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
              try {
                const currentUser = JSON.parse(currentUserStr);
                userId = currentUser?.id || currentUser?.userId;
                console.log('[ServerPage] Found userId in currentUser:', userId);
              } catch (e) {
                console.error('[ServerPage] Error parsing currentUser JSON:', e);
              }
            }
          }
          
          // If still not found, try to get from user object
          if (!userId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                userId = user?.id || user?.userId;
                console.log('[ServerPage] Found userId in user object:', userId);
              } catch (e) {
                console.error('[ServerPage] Error parsing user JSON:', e);
              }
            }
          }
          
          if (!userId) {
            console.error('[ServerPage] No userId found in localStorage');
            router.push('/login?redirect=' + encodeURIComponent(`/servers/${serverId}`));
            return;
          }
        } catch (error) {
          console.error('[ServerPage] Error retrieving user data:', error);
          router.push('/login?redirect=' + encodeURIComponent(`/servers/${serverId}`));
          return;
        }

        // Define a function to process channels data and handle redirection
        const processChannelsData = (data: any) => {
          console.log(`[ServerPage] Processing channels data:`, data);
          
          // Check for user's last visited channel in this server
          const lastVisitedKey = `lastChannel_${serverId}`;
          const lastVisitedChannelId = localStorage.getItem(lastVisitedKey);
          
          // Verify the last visited channel still exists
          let lastChannelExists = false;
          if (lastVisitedChannelId && data.channels) {
            lastChannelExists = data.channels.some((ch: any) => ch.id === lastVisitedChannelId);
          }
          
          // Find the appropriate channel to redirect to
          let targetChannelId = null;
          
          // Priority 1: Use server's default channel if it exists
          if (data.server && data.server.defaultChannelId) {
            targetChannelId = data.server.defaultChannelId;
            console.log(`[ServerPage] Using server's default channel: ${targetChannelId}`);
          }
          // Priority 2: Use last visited channel if it exists
          else if (lastVisitedChannelId && lastChannelExists) {
            targetChannelId = lastVisitedChannelId;
            console.log(`[ServerPage] Using last visited channel: ${targetChannelId}`);
          } 
          // Priority 3: Use channels from the response
          else if (data.channels && data.channels.length > 0) {
            // First try to find a text channel named 'general'
            const generalChannel = data.channels.find((ch: any) => 
              ch.name.toLowerCase() === 'general' && ch.type === 'text'
            );
            
            if (generalChannel) {
              targetChannelId = generalChannel.id;
              console.log(`[ServerPage] Using general channel: ${targetChannelId}`);
            }
            // Then try to find any text channel
            else {
              const textChannels = data.channels.filter((ch: any) => ch.type === 'text');
              if (textChannels.length > 0) {
                // Sort by position to get the first one
                textChannels.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
                targetChannelId = textChannels[0].id;
                console.log(`[ServerPage] Using first text channel: ${targetChannelId}`);
              } else {
                // Fallback to the very first channel if no text channels
                targetChannelId = data.channels[0].id;
                console.log(`[ServerPage] Using first available channel (fallback): ${targetChannelId}`);
              }
            }
          }
          
          if (targetChannelId) {
            console.log(`[ServerPage] Redirecting to channel: ${targetChannelId}`);
            // Using replace to avoid adding this loading page to history
            router.replace(`/servers/${serverId}/channels/${targetChannelId}`);
            
            // Set a fallback timeout in case the redirect fails
            setTimeout(() => {
              if (document.location.pathname.includes('/servers/') && !document.location.pathname.includes('/channels/')) {
                console.log('[ServerPage] Redirect timeout - forcing redirect');
                window.location.href = `/servers/${serverId}/channels/${targetChannelId}`;
              }
            }, 3000);
          } else {
            // Create an emergency fallback channel if none found
            console.error('[ServerPage] No channels found for server:', serverId);
            createFallbackChannel(userId);
          }
        };
        
        // Function to create a fallback channel when none exist
        const createFallbackChannel = async (userId: string) => {
          try {
            console.log('[ServerPage] Creating emergency fallback channel');
            const createChannelResponse = await fetch(`/api/servers/${serverId}/channels`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`,
              },
              body: JSON.stringify({
                name: 'general',
                type: 'text',
                position: 0
              })
            });
            
            if (createChannelResponse.ok) {
              const newChannelData = await createChannelResponse.json();
              console.log('[ServerPage] Created fallback channel:', newChannelData);
              
              if (newChannelData.channel && newChannelData.channel.id) {
                console.log(`[ServerPage] Redirecting to fallback channel: ${newChannelData.channel.id}`);
                router.replace(`/servers/${serverId}/channels/${newChannelData.channel.id}`);
                return;
              }
            }
            setError('No channels found for this server. Please try again or contact support.');
            setLoading(false);
          } catch (createError) {
            console.error('[ServerPage] Failed to create fallback channel:', createError);
            setError('Failed to create a channel. Please try again or contact support.');
            setLoading(false);
          }
        };

        // Add authorization header with userId for better authentication
        const headers = {
          'Authorization': `Bearer ${userId}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        };
        
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        
        // Try to get channels from cache first
        const cachedChannels = getFromCache(cacheKey.channels(serverId));
        if (cachedChannels) {
          console.log(`[ServerPage] Using cached channels for server: ${serverId}`);
          // Process cached channels data directly
          processChannelsData(cachedChannels);
          return;
        }
        
        // Check access with proper authentication
        console.log(`[ServerPage] Checking access with userId: ${userId}`);
        const accessResponse = await fetch(`/api/servers/${serverId}/access-check?userId=${userId}&_t=${timestamp}`, {
          headers,
          cache: 'no-store'
        });
        
        if (!accessResponse.ok) {
          console.error(`[ServerPage] Access check failed: ${accessResponse.status}`);
          setError('You do not have permission to access this server.');
          setLoading(false);
          return;
        }

        // Set a timeout for the fetch to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          // Fetch channels for the server with proper authentication
          console.log(`[ServerPage] Fetching channels for server: ${serverId}`);
          const channelsResponse = await fetch(`/api/servers/${serverId}/channels?userId=${userId}&_t=${timestamp}`, {
            headers,
            cache: 'no-store',
            signal: controller.signal
          });
          
          // Clear the timeout since the request completed
          clearTimeout(timeoutId);
          
          if (!channelsResponse.ok) {
            const errorData = await channelsResponse.json().catch(() => ({})); // Try to parse error
            console.error(`[ServerPage] Failed to fetch channels (${channelsResponse.status}):`, errorData);
            if (channelsResponse.status === 404) {
              setError('Server not found or you don\'t have access.');
            } else if (channelsResponse.status === 403) {
              setError('You do not have permission to access this server.');
            } else {
              setError(errorData.error || 'Failed to load server channels.');
            }
            setLoading(false);
            return;
          }
          
          const channelsData = await channelsResponse.json();
          console.log(`[ServerPage] Received channels data:`, channelsData);
          
          // Save to cache for future use
          saveToCache(cacheKey.channels(serverId), channelsData, 30); // Cache for 30 minutes
          
          // Process the channels data
          processChannelsData(channelsData);
        } catch (error) {
          // Clear the timeout in case of error
          clearTimeout(timeoutId);
          
          console.error('[ServerPage] Error fetching channels:', error);
          
          // Use fallback data if fetch fails
          console.log('[ServerPage] Using fallback channel data');
          const fallbackChannels = getDefaultChannels(serverId);
          const fallbackCategories = getDefaultCategories(serverId);
          
          const fallbackData = {
            channels: fallbackChannels,
            categories: fallbackCategories,
            server: {
              id: serverId,
              defaultChannelId: `${serverId}-general`
            }
          };
          
          // Process the fallback data
          processChannelsData(fallbackData);
        }
      } catch (err) {
        console.error('[ServerPage] Unexpected error:', err);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    }

    fetchServerAndRedirect();
  }, [router, serverId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <ThreeBackground preset="dashboard" color="#4ade80" />
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-white text-lg">Loading server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <ThreeBackground preset="landing" color="#ef4444" />
        <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">No channels found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a 
            href="/"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
  
  return null;
}
