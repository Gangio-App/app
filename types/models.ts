import { ObjectId } from 'mongodb';

// User status type
export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'focus' | 'invisible';

// Badge type
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
}

// User model
export interface User {
  _id?: ObjectId;
  id: string;
  name: string;
  discriminator: string;
  email?: string;
  passwordHash?: string;
  avatarUrl?: string;
  bannerUrl?: string; // Profile banner
  status: UserStatus;
  isBot?: boolean;
  game?: string;
  position?: string; // Job position or title
  company?: string; // Company or organization
  bio?: string; // User bio
  pronouns?: string; // User pronouns
  badges?: Badge[]; // Special badges
  isNew?: boolean; // Flag for new users
  friendIds?: string[]; // IDs of friends
  incomingFriendRequests?: string[]; // IDs of users who sent friend requests
  outgoingFriendRequests?: string[]; // IDs of users who received friend requests
  createdAt: Date;
  updatedAt: Date;
}

// Role model
export interface Role {
  _id?: ObjectId;
  id: string;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  permissions: {
    admin: boolean;
    kick: boolean;
    ban: boolean;
    manageChannels: boolean;
    manageRoles: boolean;
    manageServer: boolean;
  };
  channelPermissions?: {
    [channelId: string]: {
      read: boolean;
      write: boolean;
      react: boolean;
      embed: boolean;
      upload: boolean;
    }
  };
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermissions {
  manageServer?: boolean;
  manageRoles?: boolean;
  manageChannels?: boolean;
  kickMembers?: boolean;
  banMembers?: boolean;
  viewChannels?: boolean;
  sendMessages?: boolean;
  attachFiles?: boolean;
  embedLinks?: boolean;
  addReactions?: boolean;
  useVoice?: boolean;
  mentionEveryone?: boolean;
  manageMessages?: boolean;
}

// Server Channel type
export type ChannelType = 'text' | 'voice' | 'video';

// Channel model
export interface Channel {
  _id?: ObjectId;
  id: string;
  name: string;
  type: ChannelType;
  serverId: string;
  categoryId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

// Category model
export interface Category {
  _id?: ObjectId;
  id: string;
  name: string;
  serverId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

// Server model
export interface Server {
  _id?: ObjectId;
  id: string;
  name: string;
  description?: string;
  icon?: string | null;
  iconUrl?: string | null; // URL to the server icon
  banner?: string | null;
  isOfficial?: boolean;
  ownerId: string;
  inviteCode?: string;
  defaultChannelId?: string;
  memberCount?: number; // Number of members in the server
  createdAt: Date;
  updatedAt: Date;
}

// Server Member model (user in a server)
export interface ServerMember {
  _id?: ObjectId;
  userId: string;
  serverId: string;
  roleIds: string[];
  nickname?: string;
  joinedAt: Date;
}

// Message model
export interface Message {
  _id?: ObjectId;
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  attachments?: {
    id: string;
    url: string;
    type: 'image' | 'video' | 'audio' | 'file';
    name: string;
    size?: number;
  }[];
  mentions?: string[];
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
  isPinned?: boolean;
  edited?: boolean;
  createdAt: Date;
  updatedAt: Date;
} 