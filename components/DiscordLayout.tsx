import React, { useState, ReactNode } from 'react';
import { ServersList } from './ServersList';
import { ChannelsList } from './ChannelsList';
import { MembersList } from './MembersList';
import { Server } from '@/types/models';

type Category = {
  id: string;
  name: string;
  channels: Array<{
    id: string;
    name: string;
    type: 'text' | 'voice' | 'video';
    unreadCount?: number;
  }>;
  isCollapsed?: boolean;
};

// Sample data
const sampleServers: Server[] = [
  { 
    id: 'server1', 
    name: 'LiveKit', 
    ownerId: 'user1',
    inviteCode: '123456',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'server2', 
    name: 'Gaming',
    ownerId: 'user1',
    inviteCode: '234567',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'server3', 
    name: 'Coding',
    ownerId: 'user1',
    inviteCode: '345678',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 'server4', 
    name: 'Design',
    ownerId: 'user1',
    inviteCode: '456789',
    createdAt: new Date(),
    updatedAt: new Date()
  },
]; 
 