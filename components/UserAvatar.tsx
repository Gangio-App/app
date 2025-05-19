import React from 'react';
import { Avatar } from './ui/Avatar';

interface User {
  id: string;
  name: string;
  image?: string;
  discriminator: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline' | 'focus' | 'invisible';
}

interface UserAvatarProps {
  user: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className,
  showStatus = true,
}) => {
  if (!user) {
    return (
      <Avatar
        size={size}
        className={className}
        fallback="?"
      />
    );
  }

  // Convert user status to match Avatar component's status type
  const convertStatus = (status?: string): 'online' | 'idle' | 'dnd' | 'offline' | undefined => {
    if (!status || !showStatus) return undefined;
    if (status === 'focus' || status === 'invisible') return 'offline';
    return status as 'online' | 'idle' | 'dnd' | 'offline';
  };

  return (
    <Avatar
      src={user.image}
      alt={user.name || 'User'}
      fallback={user.name}
      size={size}
      status={convertStatus(user.status)}
      className={className}
    />
  );
}; 