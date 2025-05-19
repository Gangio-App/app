import React, { useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

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

interface LiveChatMessageProps {
  message: Message;
  currentUserId: string;
  mentionedUsers?: {
    id: string;
    name: string;
    discriminator: string;
    avatarUrl?: string;
  }[];
  replyToMessage?: Message | null;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onReply: (id: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  isFirst?: boolean;
  showDate?: boolean;
}

export const LiveChatMessage: React.FC<LiveChatMessageProps> = ({
  message,
  currentUserId,
  mentionedUsers = [],
  replyToMessage,
  onDelete,
  onEdit,
  onReply,
  onReact,
  isFirst = false,
  showDate = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isCurrentUserAuthor = message.authorId === currentUserId;
  const messageDate = new Date(message.createdAt);
  const formattedDate = format(messageDate, 'MMM d, yyyy h:mm a');
  const formattedTime = format(messageDate, 'h:mm a');
  
  // Format message content to highlight mentions
  const formatMessageContent = (content: string) => {
    if (!mentionedUsers.length) return content;
    
    let formattedContent = content;
    
    mentionedUsers.forEach(user => {
      const mentionRegex = new RegExp(`@${user.name}`, 'g');
      formattedContent = formattedContent.replace(
        mentionRegex,
        `<span class="text-blue-400 font-medium">@${user.name}</span>`
      );
    });
    
    return formattedContent;
  };
  
  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowEmojiPicker(false);
  };
  
  // Common emoji reactions
  const quickEmojis = ['👍', '❤️', '😂', '🎉', '😮', '😢'];
  
  return (
    <>
      {/* Date separator */}
      {showDate && (
        <div className="flex justify-center my-4">
          <div className="px-3 py-1 rounded-full bg-gray-800/70 text-gray-300 text-xs">
            {format(messageDate, 'MMMM d, yyyy')}
          </div>
        </div>
      )}
      
      <div 
        className="group relative rounded-md hover:bg-gray-800/50 p-2 -mx-2 transition-colors"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Reply reference if this message is a reply */}
        {replyToMessage && (
          <div className="flex items-center text-sm text-gray-400 ml-10 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-gray-300 mr-1">Replying to</span>
            <span className="text-blue-400">{replyToMessage.author.name}</span>
            <span className="ml-2 truncate text-gray-500 max-w-[150px]">{replyToMessage.content}</span>
          </div>
        )}
        
        <div className="flex">
          {/* Author Avatar - only show on first message or if date break */}
          {isFirst && (
            <div className="mr-3 flex-shrink-0">
              {message.author.avatarUrl ? (
                <img 
                  src={message.author.avatarUrl} 
                  alt={message.author.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold shadow-md">
                  {message.author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          
          {/* Space for alignment when no avatar */}
          {!isFirst && <div className="w-10 mr-3 flex-shrink-0"></div>}
          
          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Author info - only show on first message */}
            {isFirst && (
              <div className="flex items-center">
                <span className="font-medium text-gray-200">
                  {message.author.name}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  {message.author.discriminator}
                </span>
                <span className="text-gray-500 text-xs ml-3">
                  {formattedTime}
                </span>
                {message.isEdited && (
                  <span className="text-gray-500 text-xs ml-2">(edited)</span>
                )}
                {message.isPinned && (
                  <span className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-sm">
                    Pinned
                  </span>
                )}
              </div>
            )}
            
            {/* Message text */}
            <div 
              className="text-gray-100 mt-1 break-words" 
              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
            />
            
            {/* Message Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={`${attachment.id || index}`} className="rounded overflow-hidden max-w-md">
                    {attachment.type === 'gif' && (
                      <div className="rounded overflow-hidden bg-gray-900/50 border border-gray-700">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={attachment.previewUrl || attachment.url} 
                            alt={attachment.title || 'GIF'} 
                            className="max-h-[300px] w-auto object-contain"
                          />
                        </a>
                        <div className="p-2 text-xs text-gray-400 flex justify-between">
                          <span>{attachment.title || 'GIF'}</span>
                          <span className="text-emerald-400">GIPHY</span>
                        </div>
                      </div>
                    )}
                    {attachment.type === 'image' && (
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={attachment.url} 
                          alt="Image attachment" 
                          className="max-h-[300px] rounded border border-gray-700/50"
                        />
                      </a>
                    )}
                    {attachment.type === 'file' && (
                      <a 
                        href={attachment.url} 
                        download={attachment.fileName}
                        className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{attachment.fileName}</div>
                          <div className="text-xs text-gray-400">{attachment.fileSize}</div>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={`${reaction.emoji}-${index}`}
                    onClick={() => onReact(message.id, reaction.emoji)}
                    className={`
                      flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors
                      ${reaction.userIds.includes(currentUserId) 
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/30' 
                        : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/60 border border-gray-700/30'
                      }
                    `}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.userIds.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Message Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-2 top-2 flex items-center space-x-1 bg-gray-800 rounded-md shadow-lg p-0.5 border border-gray-700/50"
              >
                {/* Reply Button */}
                <button
                  onClick={() => onReply(message.id)}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                  title="Reply"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                
                {/* Emoji Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                    title="Add Reaction"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg p-2 z-10 border border-gray-700"
                      >
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {quickEmojis.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(emoji)}
                              className="text-xl hover:bg-gray-700 p-1 rounded transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Edit Button - Only for author */}
                {isCurrentUserAuthor && (
                  <button
                    onClick={() => onEdit(message.id)}
                    className="p-1.5 rounded hover:bg-gray-700 text-gray-300 transition-colors"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                
                {/* Delete Button - Only for author */}
                {isCurrentUserAuthor && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1.5 rounded hover:bg-red-600 text-gray-300 transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}; 