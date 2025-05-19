import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface BannedUser {
  _id: string;
  userId: string;
  serverId: string;
  reason?: string;
  bannedAt: string;
  bannedBy: string;
  user: {
    name: string;
    image?: string;
    discriminator: string;
  };
}

interface BannedUsersListProps {
  serverId: string;
  userId: string;
}

export default function BannedUsersList({ serverId, userId }: BannedUsersListProps) {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unbanningUser, setUnbanningUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchBannedUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/servers/${serverId}/bans?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch banned users');
        }
        
        const data = await response.json();
        setBannedUsers(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching banned users');
        toast.error('Failed to load banned users');
      } finally {
        setLoading(false);
      }
    };

    fetchBannedUsers();
  }, [serverId, userId]);

  const handleUnban = async (bannedUserId: string) => {
    try {
      setUnbanningUser(bannedUserId);
      const response = await fetch(`/api/servers/${serverId}/bans/${bannedUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unban user');
      }

      setBannedUsers(prev => prev.filter(user => user.userId !== bannedUserId));
      toast.success('User has been unbanned');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unban user');
    } finally {
      setUnbanningUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (bannedUsers.length === 0) {
    return (
      <div className="p-6 text-center border border-zinc-300 dark:border-zinc-700 rounded-md bg-white/5 backdrop-blur-sm">
        <svg className="h-12 w-12 mx-auto text-zinc-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300">No banned users</h3>
        <p className="text-sm text-zinc-500">This server doesn't have any banned users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-white/5 backdrop-blur-sm">
        <div className="p-3 bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-300 dark:border-zinc-700">
          <h3 className="font-medium">Banned Users</h3>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {bannedUsers.map((bannedUser) => (
            <motion.div 
              key={bannedUser._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 flex items-center justify-between hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={bannedUser.user.image}
                  className="h-10 w-10"
                  fallback={bannedUser.user.name[0]}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{bannedUser.user.name}</span>
                    <span className="text-xs text-zinc-500">#{bannedUser.user.discriminator}</span>
                  </div>
                  {bannedUser.reason && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Reason: {bannedUser.reason}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500">
                    Banned {new Date(bannedUser.bannedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleUnban(bannedUser.userId)}
                disabled={unbanningUser === bannedUser.userId}
              >
                {unbanningUser === bannedUser.userId ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Unban'
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 