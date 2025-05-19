// Mock data for chat functionality
import { v4 as uuidv4 } from 'uuid';

export interface MockMessage {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    discriminator: string;
    avatarUrl?: string;
  };
  isEdited?: boolean;
  isPinned?: boolean;
  reactions?: {
    emoji: string;
    userIds: string[];
  }[];
  replyToId?: string;
  replyTo?: MockMessage;
  mentions?: string[];
}

export interface MockTypingUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  discriminator: string;
  timestamp: string;
}

// Generate a set of mock messages for testing
const generateMockMessages = (channelId: string, serverId: string, count: number = 10): MockMessage[] => {
  const users = [
    {
      id: '1',
      name: 'John',
      discriminator: '1234',
      avatarUrl: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: '2',
      name: 'Jane',
      discriminator: '5678',
      avatarUrl: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: '3',
      name: 'Bob',
      discriminator: '9012',
      avatarUrl: 'https://i.pravatar.cc/150?img=3'
    }
  ];

  const messages: MockMessage[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const messageDate = new Date(now);
    messageDate.setMinutes(now.getMinutes() - (count - i) * 5);

    const message: MockMessage = {
      id: uuidv4(),
      content: `This is a mock message #${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      authorId: user.id,
      channelId,
      serverId,
      createdAt: messageDate.toISOString(),
      updatedAt: messageDate.toISOString(),
      author: {
        id: user.id,
        name: user.name,
        discriminator: user.discriminator,
        avatarUrl: user.avatarUrl
      },
      isEdited: Math.random() > 0.8,
      reactions: Math.random() > 0.7 ? [
        {
          emoji: '👍',
          userIds: ['1', '2']
        },
        {
          emoji: '❤️',
          userIds: ['3']
        }
      ] : []
    };

    messages.push(message);
  }

  return messages;
};

// Mock data storage
let mockMessages: Record<string, MockMessage[]> = {};
let mockTypingUsers: Record<string, MockTypingUser[]> = {};

// Initialize mock data
export const initMockData = () => {
  // Clear existing data
  mockMessages = {};
  mockTypingUsers = {};
};

// Mock functions for chat functionality
export const mockFetchMessages = async (channelId: string): Promise<MockMessage[]> => {
  if (!mockMessages[channelId]) {
    mockMessages[channelId] = generateMockMessages(channelId, 'mock-server-id');
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockMessages[channelId]]);
    }, 500);
  });
};

export const mockSubscribeToMessages = (
  channelId: string, 
  callback: (messages: MockMessage[]) => void
): (() => void) => {
  if (!mockMessages[channelId]) {
    mockMessages[channelId] = generateMockMessages(channelId, 'mock-server-id');
  }
  
  // Initial callback with current messages
  setTimeout(() => {
    callback([...mockMessages[channelId]]);
  }, 500);
  
  // No real-time updates in mock mode
  return () => {
    // Unsubscribe function (no-op in mock mode)
  };
};

export const mockSendMessage = async (messageData: any): Promise<MockMessage> => {
  const { channelId } = messageData;
  
  if (!mockMessages[channelId]) {
    mockMessages[channelId] = [];
  }
  
  const newMessage: MockMessage = {
    id: uuidv4(),
    content: messageData.content,
    authorId: messageData.authorId,
    channelId: messageData.channelId,
    serverId: messageData.serverId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: messageData.author,
    isEdited: false,
    reactions: [],
    replyToId: messageData.replyToId || undefined,
    mentions: messageData.mentions || []
  };
  
  mockMessages[channelId].push(newMessage);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newMessage);
    }, 300);
  });
};

export const mockUpdateMessage = async (messageId: string, content: string): Promise<boolean> => {
  let updated = false;
  
  // Find and update the message in all channels
  Object.keys(mockMessages).forEach(channelId => {
    const messageIndex = mockMessages[channelId].findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      mockMessages[channelId][messageIndex].content = content;
      mockMessages[channelId][messageIndex].isEdited = true;
      mockMessages[channelId][messageIndex].updatedAt = new Date().toISOString();
      updated = true;
    }
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(updated);
    }, 300);
  });
};

export const mockDeleteMessage = async (messageId: string): Promise<boolean> => {
  let deleted = false;
  
  // Find and delete the message in all channels
  Object.keys(mockMessages).forEach(channelId => {
    const initialLength = mockMessages[channelId].length;
    mockMessages[channelId] = mockMessages[channelId].filter(m => m.id !== messageId);
    if (mockMessages[channelId].length < initialLength) {
      deleted = true;
    }
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(deleted);
    }, 300);
  });
};

export const mockUpdateReaction = async (
  messageId: string, 
  emoji: string, 
  userId: string, 
  type: 'add' | 'remove'
): Promise<boolean> => {
  let updated = false;
  
  // Find and update the message reaction in all channels
  Object.keys(mockMessages).forEach(channelId => {
    const messageIndex = mockMessages[channelId].findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      const message = mockMessages[channelId][messageIndex];
      const reactions = message.reactions || [];
      
      if (type === 'add') {
        const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
        if (existingReactionIndex !== -1) {
          if (!reactions[existingReactionIndex].userIds.includes(userId)) {
            reactions[existingReactionIndex].userIds.push(userId);
          }
        } else {
          reactions.push({ emoji, userIds: [userId] });
        }
      } else {
        const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
        if (existingReactionIndex !== -1) {
          reactions[existingReactionIndex].userIds = reactions[existingReactionIndex].userIds.filter(id => id !== userId);
          if (reactions[existingReactionIndex].userIds.length === 0) {
            reactions.splice(existingReactionIndex, 1);
          }
        }
      }
      
      mockMessages[channelId][messageIndex].reactions = reactions;
      updated = true;
    }
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(updated);
    }, 200);
  });
};

export const mockSetTypingStatus = async (
  channelId: string, 
  user: any, 
  isTyping: boolean
): Promise<boolean> => {
  if (!mockTypingUsers[channelId]) {
    mockTypingUsers[channelId] = [];
  }
  
  if (isTyping) {
    // Add or update typing user
    const existingIndex = mockTypingUsers[channelId].findIndex(u => u.userId === user.id);
    const typingUser: MockTypingUser = {
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      discriminator: user.discriminator || '0000',
      timestamp: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      mockTypingUsers[channelId][existingIndex] = typingUser;
    } else {
      mockTypingUsers[channelId].push(typingUser);
    }
  } else {
    // Remove typing user
    mockTypingUsers[channelId] = mockTypingUsers[channelId].filter(u => u.userId !== user.id);
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 100);
  });
};

export const mockSubscribeToTypingIndicators = (
  channelId: string, 
  callback: (typingUsers: MockTypingUser[]) => void
): (() => void) => {
  if (!mockTypingUsers[channelId]) {
    mockTypingUsers[channelId] = [];
  }
  
  // Initial callback with current typing users
  setTimeout(() => {
    callback([...mockTypingUsers[channelId]]);
  }, 200);
  
  // No real-time updates in mock mode
  return () => {
    // Unsubscribe function (no-op in mock mode)
  };
};

// Initialize mock data
initMockData();
