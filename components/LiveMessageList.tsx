import React, { useState, useRef, useEffect } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { LiveChatMessage } from './LiveChatMessage';

interface Message {
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
  replyTo?: Message;
  mentions?: string[];
  attachments?: any[];
}

interface TypingUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  discriminator: string;
}

interface LiveMessageListProps {
  messages: Message[];
  currentUser: any;
  typingUsers: TypingUser[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  loadMoreMessages: () => void;
  loadingMore: boolean;
  onMessageDelete: (id: string) => void;
  onMessageEdit: (id: string) => void;
  onMessageReply: (id: string) => void;
  onMessageReaction: (messageId: string, emoji: string) => void;
  mentionedUsers?: {
    id: string;
    name: string;
    discriminator: string;
    avatarUrl?: string;
  }[];
}

export const LiveMessageList: React.FC<LiveMessageListProps> = ({
  messages,
  currentUser,
  typingUsers,
  isLoading,
  hasMoreMessages,
  loadMoreMessages,
  loadingMore,
  onMessageDelete,
  onMessageEdit,
  onMessageReply,
  onMessageReaction,
  mentionedUsers = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevScrollHeight = useRef<number>(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Check if a message is the first in a group (from the same author)
  const isFirstInGroup = (index: number) => {
    if (index === 0) return true;
    
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    
    // Different author = new group
    if (currentMessage.authorId !== previousMessage.authorId) return true;
    
    // Messages more than 5 minutes apart = new group
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const previousTime = new Date(previousMessage.createdAt).getTime();
    const timeDiff = currentTime - previousTime;
    
    return timeDiff > 5 * 60 * 1000; // 5 minutes in milliseconds
  };

  // Check if we need to show a date separator before a message
  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    
    const currentDate = new Date(messages[index].createdAt);
    const previousDate = new Date(messages[index - 1].createdAt);
    
    return !isSameDay(currentDate, previousDate);
  };

  // Get message that is being replied to
  const getReplyToMessage = (message: Message) => {
    if (!message.replyToId) return null;
    return messages.find(m => m.id === message.replyToId) || null;
  };

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      // Check if we're near the bottom
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setAutoScroll(isNearBottom);
      setShowScrollToBottom(!isNearBottom);
      
      // Check if we need to load more messages when scrolling to top
      if (scrollTop < 50 && hasMoreMessages && !loadingMore) {
        // Store current scroll height before loading more
        prevScrollHeight.current = scrollHeight;
        loadMoreMessages();
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMoreMessages, loadingMore, loadMoreMessages]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (loadingMore && containerRef.current && prevScrollHeight.current > 0) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight.current;
      containerRef.current.scrollTop = scrollDiff;
    }
  }, [messages, loadingMore]);

  // Scroll to bottom on new messages if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Auto-scroll on component mount
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollToBottom(false);
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar"
      >
        {/* Loading indicator for more messages */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        )}
        
        {/* No messages indicator */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mb-4 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
              />
            </svg>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message!</p>
          </div>
        )}
        
        {/* Load more button */}
        {!loadingMore && hasMoreMessages && (
          <div className="text-center my-2">
            <button 
              onClick={loadMoreMessages}
              className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 rounded-md text-sm transition-colors"
            >
              Load earlier messages
            </button>
          </div>
        )}
        
        {/* Message list */}
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            {/* Date separator */}
            {shouldShowDateSeparator(index) && (
              <div className="flex justify-center my-4">
                <div className="px-3 py-1 rounded-full bg-gray-800/70 text-gray-300 text-xs">
                  {isToday(new Date(message.createdAt)) 
                    ? 'Today' 
                    : isYesterday(new Date(message.createdAt))
                      ? 'Yesterday'
                      : format(new Date(message.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
            )}
            
            <LiveChatMessage
              message={message}
              currentUserId={currentUser.id}
              mentionedUsers={mentionedUsers}
              replyToMessage={getReplyToMessage(message)}
              onDelete={onMessageDelete}
              onEdit={onMessageEdit}
              onReply={onMessageReply}
              onReact={onMessageReaction}
              isFirst={isFirstInGroup(index)}
            />
          </React.Fragment>
        ))}
        
        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-gray-400 mt-2 ml-2">
            <div className="flex -space-x-2">
              {typingUsers.slice(0, 3).map(user => (
                <div key={user.userId} className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <span className="text-sm">
                {typingUsers.length === 1 
                  ? `${typingUsers[0].name} is typing` 
                  : typingUsers.length === 2 
                    ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing` 
                    : typingUsers.length === 3 
                      ? `${typingUsers[0].name}, ${typingUsers[1].name}, and ${typingUsers[2].name} are typing` 
                      : `${typingUsers[0].name}, ${typingUsers[1].name}, and ${typingUsers.length - 2} others are typing`}
              </span>
              <span className="ml-1 flex space-x-1">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-150">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </div>
          </div>
        )}
        
        {/* Placeholder for auto-scrolling */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}; 