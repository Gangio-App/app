'use client';

import React, { useEffect, useState, use } from 'react';
import Channel from '@/components/Channel';
import ThreeBackground from '@/components/ui/ThreeBackground';
import { useRouter } from 'next/navigation';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';

interface ChannelPageProps {
  params: Promise<{ serverId: string; channelId: string; }>;
}

export default function ChannelPage({ params: paramsPromise }: ChannelPageProps) {
  const params = use(paramsPromise);
  const serverId = params.serverId;
  const channelId = params.channelId;
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUserAuth = () => {
      const userJson = localStorage.getItem('currentUser');
      if (!userJson) {
        router.push('/login');
        return false;
      }

      try {
        const userData = JSON.parse(userJson);
        setUser(userData);
        return true;
      } catch (error) {
        console.error('Failed to parse user data:', error);
        router.push('/login');
        return false;
      }
    };

    if (checkUserAuth()) {
      setIsLoading(false);
      
      // Store this channel as the last visited channel for this server
      if (serverId && channelId) {
        const lastVisitedKey = `lastChannel_${serverId}`;
        localStorage.setItem(lastVisitedKey, channelId);
        console.log(`[ChannelPage] Saved last visited channel: ${channelId} for server: ${serverId}`);
      }
    }
  }, [router, serverId, channelId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Using the Channel component that now properly integrates all required components
  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">
      <ThreeBackground preset="chat" />
      <Channel serverId={serverId} channelId={channelId} />
    </div>
  );
} 