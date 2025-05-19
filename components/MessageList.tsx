import React from 'react';
import { format } from 'date-fns';

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
}

interface MessageListProps {
  message: Message;
  currentUserId: string;
  mentionedUsers?: {
    id: string;
    name: string;
    discriminator: string;
    avatarUrl?: string;
  }[];
  replyToMessage?: Message;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onReply: (id: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  message,
  currentUserId,
  mentionedUsers = [],
  replyToMessage,
  onDelete,
  onEdit,
  onReply,
  onReact
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const isCurrentUserAuthor = message.authorId === currentUserId;
  const messageDate = new Date(message.createdAt);
  const formattedDate = format(messageDate, 'MMM d, yyyy h:mm a');
  
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
        {/* Author Avatar */}
        <div className="mr-3 flex-shrink-0">
          {message.author.avatarUrl ? (
            <img 
              src={message.author.avatarUrl} 
              alt={message.author.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-semibold">
              {message.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-medium text-gray-200">
              {message.author.name}
            </span>
            <span className="text-gray-400 text-xs ml-2">
              {message.author.discriminator}
            </span>
            <span className="text-gray-500 text-xs ml-3">
              {formattedDate}
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
          
          <div 
            className="text-gray-100 mt-1 break-words" 
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
          />
          
          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={`${reaction.emoji}-${index}`}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs
                    ${reaction.userIds.includes(currentUserId) 
                      ? 'bg-blue-500/30 text-blue-300' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
        {showActions && (
          <div className="absolute right-2 top-2 flex items-center space-x-1 bg-gray-800 rounded-md shadow-lg p-0.5">
            {/* Reply Button */}
            <button
              onClick={() => onReply(message.id)}
              className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
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
                className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
                title="Add Reaction"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {showEmojiPicker && (
                <div className="absolute right-0 mt-1 bg-gray-800 rounded-md shadow-lg p-2 z-10">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {quickEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="text-xl hover:bg-gray-700 p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Edit Button - Only for author */}
            {isCurrentUserAuthor && (
              <button
                onClick={() => onEdit(message.id)}
                className="p-1.5 rounded hover:bg-gray-700 text-gray-300"
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
                className="p-1.5 rounded hover:bg-red-600 text-gray-300"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 