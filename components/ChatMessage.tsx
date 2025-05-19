import React, { useState, useRef, useEffect } from 'react';
import AttachmentRenderer from './AttachmentRenderer';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { UserMiniProfile } from './UserMiniProfile';

interface Author {
  id: string;
  name: string;
  discriminator: string;
  avatarUrl?: string;
  roleColor?: string;
  roleId?: string;
}

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface CustomEmoji {
  id: string;
  name: string;
  imageUrl: string;
}

// Interface for GIF objects (consistent with ChatInput.tsx)
interface Gif {
  id: string;
  title: string;
  previewUrl: string; 
  gifUrl: string;
  width: number;
  height: number;
}

// Interface for attachments with a more flexible type field
interface Attachment {
  id: string;
  type: string;
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  title?: string;
}

export interface ChatMessageProps {
  id: string;
  content: string;
  author: Author;
  createdAt: string | Date;
  isEdited?: boolean;
  isPinned?: boolean;
  isMine?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onReact?: (id: string, emoji: string) => void;
  onRemoveReaction?: (id: string, emoji: string) => void;
  onReply?: (id: string) => void;
  currentUserId?: string;
  customEmojis?: CustomEmoji[];
  serverId?: string;
  mentions?: string[];
  mentionedUsers?: Author[];
  isEditing?: boolean;
  editedContent?: string;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onEditChange?: (content: string) => void;
  reactions?: Reaction[];
  attachments?: Attachment[];
  replyTo?: {
    id: string;
    content: string;
    author: Author;
  } | null;
  gifDetails?: Gif;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  id,
  content,
  author,
  createdAt,
  isEdited = false,
  isPinned = false,
  isMine = false,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onRemoveReaction,
  onReply,
  currentUserId = '',
  customEmojis = [],
  serverId = '',
  mentions = [],
  mentionedUsers = [],
  isEditing = false,
  editedContent = '',
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  reactions = [],
  attachments = [],
  replyTo,
  gifDetails
}) => {
  const messageDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true });
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoverMentionUserId, setHoverMentionUserId] = useState<string | null>(null);
  const [mentionPosition, setMentionPosition] = useState<{ x: number, y: number } | null>(null);
  
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Process content to highlight mentions
  const processedContent = mentions && mentionedUsers && mentions.length > 0 
    ? highlightMentions(content, mentionedUsers) 
    : content;
  
  // Handle clicking outside of emoji picker or options menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
      
      if (
        showOptions &&
        optionsRef.current &&
        !optionsRef.current.contains(e.target as Node)
      ) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showOptions]);

  useEffect(() => {
    // Function to handle mention hover
    const handleMentionHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('mention-user')) {
        const userId = target.getAttribute('data-user-id');
        if (userId) {
          setHoverMentionUserId(userId);
          const rect = target.getBoundingClientRect();
          setMentionPosition({ x: rect.right, y: rect.top });
        }
      }
    };
    
    // Function to handle mention leave
    const handleMentionLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Don't hide if hovering over the mini profile
      if (relatedTarget && relatedTarget.closest('.user-mini-profile')) return;
      
      if (target.classList.contains('mention-user')) {
        // Small delay to allow hovering the mini profile
        setTimeout(() => {
          setHoverMentionUserId(null);
          setMentionPosition(null);
        }, 100);
      }
    };
    
    // Add event listeners
    document.addEventListener('mouseover', handleMentionHover);
    document.addEventListener('mouseout', handleMentionLeave);
    
    return () => {
      document.removeEventListener('mouseover', handleMentionHover);
      document.removeEventListener('mouseout', handleMentionLeave);
    };
  }, []);

  const handleReactionClick = (emoji: string) => {
    if (!onReact) return;
    
    const userReacted = reactions.some(r => 
      r.emoji === emoji && r.userIds.includes(currentUserId)
    );
    
    if (userReacted && onRemoveReaction) {
      onRemoveReaction(id, emoji);
    } else {
      onReact(id, emoji);
    }
  };
  
  const handleAddReaction = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const handleEmojiSelect = (emojiData: any) => {
    const emoji = emojiData.emoji || emojiData;
    handleReactionClick(emoji);
    setShowEmojiPicker(false);
  };
  
  const handleCustomEmojiSelect = (emoji: CustomEmoji) => {
    handleReactionClick(`:${emoji.name}:`);
    setShowEmojiPicker(false);
  };
  
  // Handle reply
  const handleReply = () => {
    if (onReply) {
      onReply(id);
    }
  };
  
  // Function to highlight @mentions in content with interactive spans
  function highlightMentions(content: string, mentionedUsers: Author[]): string {
    let processedContent = content;
    
    mentionedUsers.forEach(user => {
      const mentionRegex = new RegExp(`@${user.name}\\b`, 'g');
      const mentionReplacement = `<span class="mention-user bg-blue-900/40 text-blue-300 px-1 rounded hover:bg-blue-800/50 cursor-pointer transition-colors" data-user-id="${user.id}">@${user.name}</span>`;
      processedContent = processedContent.replace(mentionRegex, mentionReplacement);
    });
    
    return processedContent;
  }
  
  if (isEditing) {
    return (
      <div className="p-3 bg-gray-750/50 rounded-md">
        <textarea
          value={editedContent}
          onChange={(e) => onEditChange?.(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSaveEdit}
            className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`group hover:bg-gray-800/30 rounded-md transition-colors relative ${isMine ? 'bg-gray-800/20' : ''}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* Reply preview if this is a reply */}
      {replyTo && (
        <div className="ml-12 -mb-1 mt-1 px-3 pt-2 text-gray-400 text-sm flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 transform rotate-180">
            <path fillRule="evenodd" d="M3.47 3.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L4.5 5.56v9.69a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75h9.69a.75.75 0 010 1.5H5.56l2.72 2.72a.75.75 0 11-1.06 1.06L3.47 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{replyTo.author.name}</span>
          <span className="truncate max-w-xs opacity-75">{replyTo.content.length > 50 ? replyTo.content.substring(0, 50) + '...' : replyTo.content}</span>
        </div>
      )}
      
      <div className="p-3 flex items-start">
        <div className="mr-3 flex-shrink-0">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-700"
              onError={(e) => {
                // If image fails to load, replace with fallback
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.style.display = 'none';
                
                // Get parent element and add fallback
                const parent = target.parentElement;
                if (parent) {
                  // Create fallback element
                  const fallback = document.createElement('div');
                  fallback.className = 'w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center';
                  fallback.innerHTML = `<span class="text-white font-medium text-sm">${author.name.substring(0, 2).toUpperCase()}</span>`;
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {author.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            {/* Username with role color and hover for UserMiniProfile */}
            <div className="relative">
              <span 
                className="font-medium mr-2 cursor-pointer hover:underline"
                style={{ color: author.roleColor || '#FFFFFF' }}
                onMouseEnter={(e) => {
                  setHoverMentionUserId(author.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMentionPosition({ x: rect.right, y: rect.top });
                }}
                onMouseLeave={() => {
                  // Small delay to allow hovering the mini profile
                  setTimeout(() => {
                    const miniProfile = document.querySelector('.user-mini-profile:hover');
                    if (!miniProfile) {
                      setHoverMentionUserId(null);
                      setMentionPosition(null);
                    }
                  }, 100);
                }}
              >
                {author.name}
              </span>
              
              {/* UserMiniProfile is shown globally at the bottom of the component */}
            </div>
            
            <span className="text-gray-400 text-xs">#{author.discriminator}</span>
            <span className="text-gray-400 text-xs ml-2">{timeAgo}</span>
            {isEdited && (
              <span className="text-gray-400 text-xs ml-2">(edited)</span>
            )}
            {isPinned && (
              <span className="text-emerald-400 text-xs ml-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                  <path d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zm0 15a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 16.5zm0-10.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zM21.75 12a.75.75 0 01-.75.75H18a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM6 12a.75.75 0 01-.75.75H2.25a.75.75 0 010-1.5H5.25A.75.75 0 016 12zm10.5-9.75a.75.75 0 10-1.06 1.06l2.1 2.1-2.1 2.1a.75.75 0 001.06 1.06l2.625-2.625a.75.75 0 000-1.06L16.5 2.25zm-9 1.06a.75.75 0 00-1.06-1.06L3.815 5.875a.75.75 0 000 1.06l2.625 2.625a.75.75 0 001.06-1.06l-2.1-2.1 2.1-2.1a.75.75 0 000-1.06zm3.747 14.315a.75.75 0 00-1.06 0l-2.625 2.625a.75.75 0 000 1.06l2.625 2.625a.75.75 0 001.06-1.06l-2.1-2.1 2.1-2.1a.75.75 0 000-1.06zm6.376 1.06a.75.75 0 10-1.06-1.06l-2.1 2.1-2.1-2.1a.75.75 0 00-1.06 1.06l2.625 2.625a.75.75 0 001.06 0l2.625-2.625z" />
                </svg>
                Pinned
              </span>
            )}
          </div>
          
          <div 
            className="text-gray-200 break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          
          {/* GIF Details */}
          {gifDetails && (
            <div className="mt-2">
              <img 
                src={gifDetails.gifUrl} 
                alt={gifDetails.title || 'GIF'}
                className="max-w-xs max-h-64 rounded-md object-contain bg-gray-700" 
                style={{ 
                  aspectRatio: gifDetails.width && gifDetails.height ? `${gifDetails.width} / ${gifDetails.height}` : 'auto',
                  display: 'block' // Ensures proper rendering and spacing
                }}
                onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if GIF fails to load
              />
            </div>
          )}
          
          {/* Attachments - GIFs and Images */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => (
                <div 
                  key={attachment.id || `attachment-${index}`} 
                  className="attachment-container"
                  data-attachment-id={attachment.id || `attachment-${index}`}
                >
                  <AttachmentRenderer 
                    attachment={attachment} 
                    maxHeight={300}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {reactions.map((reaction) => {
                const userReacted = reaction.userIds.includes(currentUserId);
                return (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReactionClick(reaction.emoji)}
                    className={`px-2 py-0.5 rounded-full text-sm border ${
                      userReacted 
                        ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                    } transition-colors flex items-center space-x-1`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.userIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Message options */}
        {showOptions && (
          <div 
            ref={optionsRef}
            className="absolute right-2 top-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex">
              {/* Reply button */}
              {onReply && (
                <button
                  onClick={handleReply}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Reply"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3.47 13.47a.75.75 0 011.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L4.5 11.38V6.5A2.5 2.5 0 017 4h5.5a.75.75 0 000-1.5H7A4 4 0 003 6.5v4.88l-2.22-2.22a.75.75 0 10-1.06 1.06l3.75 3.75z" clipRule="evenodd" />
                    <path d="M3.75 7.5a.75.75 0 000 1.5h12a.75.75 0 000-1.5H3.75zM3.75 10.5a.75.75 0 000 1.5h12a.75.75 0 000-1.5H3.75zM3.75 13.5a.75.75 0 000 1.5h12a.75.75 0 000-1.5H3.75z" />
                  </svg>
                </button>
              )}
              
              {/* React button */}
              {onReact && (
                <button
                  onClick={handleAddReaction}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors"
                  title="Add Reaction"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.536a1 1 0 10-1.414-1.414 1 1 0 001.414 1.414zm-7.072 7.072a1 1 0 10-1.414-1.414 1 1 0 001.414 1.414zm9.9-9.9a1 1 0 00-1.06 1.06l2.1 2.1-2.1 2.1a1 1 0 001.06 1.06l2.625-2.625a1 1 0 000-1.06L16.5 2.25zm-9 1.06a1 1 0 00-1.06-1.06L3.815 5.875a1 1 0 000 1.06l2.625 2.625a1 1 0 001.06-1.06l-2.1-2.1 2.1-2.1a1 1 0 000-1.06zm3.747 14.315a1 1 0 00-1.06 0l-2.625 2.625a1 1 0 000 1.06l2.625 2.625a1 1 0 001.06-1.06l-2.1-2.1 2.1-2.1a1 1 0 000-1.06zm6.376 1.06a1 1 0 10-1.06-1.06l-2.1 2.1-2.1-2.1a1 1 0 00-1.06 1.06l2.625 2.625a1 1 0 001.06 0l2.625-2.625z" />
                  </svg>
                </button>
              )}
              
              {/* Pin button */}
              {onPin && (
                <button
                  onClick={() => onPin(id)}
                  className={`p-2 ${isPinned ? 'text-emerald-400' : 'text-gray-400 hover:text-white'} hover:bg-gray-700 transition-colors`}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 15a1 1 0 100-2 1 1 0 000 2zm0-13.5a.75.75 0 01.75.75v8a.75.75 0 01-1.5 0v-8A.75.75 0 0110 1.5z" />
                  </svg>
                </button>
              )}
              
              {/* Edit button */}
              {isMine && onEdit && (
                <button
                  onClick={() => onEdit(id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918a4 4 0 01-1.343.885l-3.154 1.262a.5.5 0 01-.65-.65zM3.5 15.5a1 1 0 100 2h12a1 1 0 100-2h-12z" />
                  </svg>
                </button>
              )}
              
              {/* Delete button */}
              {isMine && onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0111.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute right-0 bottom-0 z-10"
        >
          <div className="bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-700 w-full max-w-[300px] sm:max-w-[320px]">
            {/* Custom emojis */}
            {customEmojis.length > 0 && (
              <div className="mb-2 border-b border-gray-700 pb-2">
                <h3 className="text-xs font-medium text-gray-400 mb-1">Server Emojis</h3>
                <div className="flex flex-wrap gap-1 max-w-sm">
                  {customEmojis.map(emoji => (
                    <button 
                      key={emoji.id}
                      onClick={() => handleCustomEmojiSelect(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
                    >
                      <img 
                        src={emoji.imageUrl} 
                        alt={emoji.name} 
                        className="w-6 h-6"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Common emojis for quick reaction */}
            <div className="mb-2">
              <h3 className="text-xs font-medium text-gray-400 mb-1">Quick Reactions</h3>
              <div className="flex flex-wrap gap-1">
                {['👍', '👎', '❤️', '😂', '😮', '😢', '🎉', '🔥'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Full emoji picker */}
            <EmojiPicker 
              onEmojiClick={handleEmojiSelect}
              searchPlaceHolder="Search emojis..."
              height={400}
            />
          </div>
        </div>
      )}
      
      {/* User Mini Profile for mentions */}
      {hoverMentionUserId && mentionPosition && (
        <div 
          className="user-mini-profile absolute z-50"
          style={{ 
            position: 'fixed',
            left: `${mentionPosition.x}px`,
            top: `${mentionPosition.y}px`
          }}
        >
          <UserMiniProfile
            userId={hoverMentionUserId}
            position="right"
            onClose={() => {
              setHoverMentionUserId(null);
              setMentionPosition(null);
            }}
          />
        </div>
      )}
    </div>
  );
}; 