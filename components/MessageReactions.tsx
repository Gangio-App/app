'use client';

import React, { useState, useRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';

// Common reaction emojis
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👎', '🎉'];

type Reaction = {
  emoji: string;
  userId: string;
  username?: string;
  timestamp: Date;
};

type MessageReactionsProps = {
  messageId: string;
  reactions: Reaction[];
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
};

const MessageReactions = ({
  messageId,
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Group reactions by emoji for counting and displaying
  const groupedReactions = reactions?.reduce<Record<string, Reaction[]>>(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    },
    {}
  ) || {};

  // Check if current user has reacted with a specific emoji
  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(r => r.userId === currentUserId);
  };

  // Handle reaction click (toggle add/remove)
  const handleReactionClick = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center space-x-1 mt-1">
      {/* Display existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, users]) => (
        <TooltipPrimitive.Provider key={emoji}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                className={`px-2 py-0.5 rounded-full text-xs flex items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
                  hasUserReacted(emoji) ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                }`}
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="mr-1">{emoji}</span>
                <span className="text-xs">{users.length}</span>
              </button>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                className="bg-black text-white px-2 py-1 rounded text-xs z-50"
                sideOffset={5}
              >
                {users.map(u => u.username || 'User').join(', ')}
                <TooltipPrimitive.Arrow className="fill-black" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      ))}

      {/* Add reaction button with emoji picker */}
      <div className="relative">
        <button
          className="px-2 py-0.5 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Add reaction"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <span className="text-gray-500 dark:text-gray-400">+</span>
        </button>
        
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full left-0 mb-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-2 w-40">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                  onClick={() => {
                    onAddReaction(messageId, emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;
