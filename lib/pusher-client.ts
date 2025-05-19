import Pusher from 'pusher-js';
import { NEXT_PUBLIC_PUSHER_APP_KEY, NEXT_PUBLIC_PUSHER_CLUSTER } from '@/app/env';

let pusherInstance: Pusher | null = null;

export function getPusherClient(authToken?: string): Pusher {
  if (!NEXT_PUBLIC_PUSHER_APP_KEY || !NEXT_PUBLIC_PUSHER_CLUSTER) {
    throw new Error('Pusher configuration is missing. Check your environment variables.');
  }

  if (!pusherInstance) {
    const authHeaders: Record<string, string> = {};
    
    // Add auth token if provided
    if (authToken) {
      authHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    pusherInstance = new Pusher(NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: authHeaders
      }
    });
  }

  return pusherInstance;
}

export function getPrivateChannelName(userId1: string, userId2: string): string {
  // Sort IDs to ensure consistent channel naming regardless of who initiates
  const [firstId, secondId] = [userId1, userId2].sort();
  return `private-dm-${firstId}-${secondId}`;
}

/**
 * Cleanup Pusher resources
 * @param pusher Optional Pusher instance to use instead of the global instance
 * @param channelName Optional channel name to unsubscribe from before disconnecting
 */
export function cleanupPusher(pusher?: Pusher, channelName?: string): void {
  // If a specific pusher instance and channel are provided, just unsubscribe from that channel
  if (pusher && channelName) {
    try {
      pusher.unsubscribe(channelName);
      console.log(`[Pusher Client] Unsubscribed from channel: ${channelName}`);
    } catch (error) {
      console.error(`[Pusher Client] Error unsubscribing from channel ${channelName}:`, error);
    }
    return;
  }
  
  // Otherwise, disconnect the global instance
  if (pusherInstance) {
    try {
      pusherInstance.disconnect();
      console.log('[Pusher Client] Disconnected Pusher instance');
      pusherInstance = null;
    } catch (error) {
      console.error('[Pusher Client] Error disconnecting Pusher:', error);
    }
  }
}
