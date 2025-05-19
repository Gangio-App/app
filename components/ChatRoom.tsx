import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import PusherJsClient, { Channel as PusherChannel } from 'pusher-js';
import { v4 as uuidv4 } from 'uuid';

interface Gif {
  id: string;
  url: string;
  previewUrl?: string;
  title?: string;
  width?: number;
  height?: number;
}

interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  createdAt: any;
  updatedAt: any;
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
  attachments?: {
    id: string;
    type: string;
    url: string;
    previewUrl?: string;
    width?: number;
    height?: number;
    title?: string;
  }[];
  gifDetails?: Gif;
  clientTempId?: string; // Added for optimistic updates
}

interface TypingUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  discriminator: string;
}

interface ChatRoomProps {
  channelId: string;
  serverId: string;
  channelName: string;
  currentUser: any;
  pusherClient: PusherJsClient | null;
  pusherSocketId: string | null;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  channelId,
  serverId,
  channelName,
  currentUser,
  pusherClient,
  pusherSocketId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [serverMembers, setServerMembers] = useState<any[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const lastVisibleMessageTimestamp = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const currentPusherChannelRef = useRef<PusherChannel | null>(null);

  useEffect(() => {
    if (channelId && serverId) {
      fetchInitialMessages();
    }
    // Clear messages if channel or server changes
    return () => {
      setMessages([]);
      setLoading(true);
      setError(null);
      setHasMore(true);
      lastVisibleMessageTimestamp.current = null;
    };
  }, [channelId, serverId]);

  useEffect(() => {
    if (!pusherClient || !channelId || !currentUser?.id) {
      // If pusherClient is not ready, or no channelId, or no current user, do nothing or cleanup
      if (currentPusherChannelRef.current) {
        console.log(`[Pusher ChatRoom] Unsubscribing from ${currentPusherChannelRef.current.name}`);
        currentPusherChannelRef.current.unsubscribe();
        currentPusherChannelRef.current.unbind_all(); // Remove all event listeners
        currentPusherChannelRef.current = null;
      }
      return;
    }

    let pusherChannelName = '';
    if (serverId === 'direct-messages') {
      pusherChannelName = `private-dm-${channelId}`; // channelId is already user1-user2 sorted string
    } else if (serverId) { // For regular server text channels
      pusherChannelName = `private-text-channel-${channelId}`;
    } else {
      console.log('[Pusher ChatRoom] serverId is missing, cannot subscribe.');
      return;
    }

    // If already subscribed to a different channel, unsubscribe first
    if (currentPusherChannelRef.current && currentPusherChannelRef.current.name !== pusherChannelName) {
      console.log(`[Pusher ChatRoom] Channel changed. Unsubscribing from ${currentPusherChannelRef.current.name}`);
      currentPusherChannelRef.current.unsubscribe();
      currentPusherChannelRef.current.unbind_all();
      currentPusherChannelRef.current = null;
    }

    // Subscribe if not already subscribed to the current channel
    if (!currentPusherChannelRef.current || currentPusherChannelRef.current.name !== pusherChannelName) {
      console.log(`[Pusher ChatRoom] Subscribing to ${pusherChannelName}`);
      const channel = pusherClient.subscribe(pusherChannelName);
      currentPusherChannelRef.current = channel;

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`[Pusher ChatRoom] Successfully subscribed to ${pusherChannelName}`);
      });

      channel.bind('pusher:subscription_error', (status: any) => {
        console.error(`[Pusher ChatRoom] Subscription error for ${pusherChannelName}:`, status);
        // Potentially handle different error statuses, e.g., 403 for auth failure
        if (status === 403) {
          setError('Not authorized to join this chat.');
        }
      });

      channel.bind('new-message', (newMessage: Message) => {
        console.log('[Pusher ChatRoom] Received new message:', newMessage);
        setMessages((prevMessages) => {
          // Check if message with same clientTempId exists (for optimistic update replacement)
          if (newMessage.clientTempId) {
            const existingIndex = prevMessages.findIndex(msg => msg.clientTempId === newMessage.clientTempId);
            if (existingIndex !== -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[existingIndex] = newMessage; // Replace temp message with final one
              return updatedMessages;
            }
          }
          // Check if message with same ID already exists (to avoid duplicates)
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages; // Already have this message
          }
          return [...prevMessages, newMessage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        scrollToBottom();
      });

      // TODO: Bind to other events like 'message-updated', 'message-deleted', 'user-typing'
      // channel.bind('user-typing', (data: TypingUser) => { ... });

    }

    // Cleanup function for when component unmounts or dependencies change
    return () => {
      if (currentPusherChannelRef.current && currentPusherChannelRef.current.name === pusherChannelName) {
        console.log(`[Pusher ChatRoom] Unsubscribing from ${currentPusherChannelRef.current.name} on cleanup.`);
        currentPusherChannelRef.current.unsubscribe();
        currentPusherChannelRef.current.unbind_all(); // Ensure all listeners are removed
        currentPusherChannelRef.current = null;
      }
    };
  }, [pusherClient, channelId, serverId, currentUser?.id]); // Dependencies for subscription

  const fetchInitialMessages = async () => {
    try {
      setLoading(true);
      console.log(`Fetching messages for channelId=${channelId} and serverId=${serverId}`);
      const response = await fetch(`/api/messages?channelId=${channelId}&serverId=${serverId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching messages: ${response.status} ${response.statusText}`);
      }

      const fetchedMessages = await response.json();
      console.log('Fetched messages:', fetchedMessages);

      // Check if the response is an array or if it has a messages property
      const messagesArray = Array.isArray(fetchedMessages) ? fetchedMessages :
        (fetchedMessages.messages ? fetchedMessages.messages : []);

      if (messagesArray.length > 0) {
        // Sort messages by createdAt in ASCENDING order (oldest first)
        const sortedMessages = [...messagesArray].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB; // Ascending order (oldest first)
        });

        console.log(`Loaded ${sortedMessages.length} messages`);
        setMessages(sortedMessages);
        setHasMore(sortedMessages.length >= 25); // If we got 25 messages, there might be more

        // Store the timestamp of the oldest message for pagination
        const oldestMessage = sortedMessages[sortedMessages.length - 1]; // Last message is oldest when sorted oldest first
        if (oldestMessage && oldestMessage.createdAt) {
          lastVisibleMessageTimestamp.current = new Date(oldestMessage.createdAt);
        }
      } else {
        console.log('No messages found');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching initial messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageData: {
    clientTempId: string;
    content: string;
    author: { 
      id: string;
      name: string;
      avatarUrl?: string;
      roleColor?: string; 
    };
    attachments?: any[];
    mentions?: string[];
    replyToMessageId?: string | null;
    currentUserId: string; 
    serverId: string;
    channelId: string;
    timestamp: number;
    gifDetails?: any; 
    pusherSocketId?: string; 
  }) => {
    if (!currentUser || sendingMessage) return;
    setSendingMessage(true);

    const tempMessage: Message = {
      id: messageData.clientTempId, // Use clientTempId as temporary ID
      clientTempId: messageData.clientTempId,
      content: messageData.content,
      authorId: messageData.author.id,
      channelId: messageData.channelId,
      serverId: messageData.serverId,
      createdAt: new Date(messageData.timestamp).toISOString(), // Use provided timestamp
      updatedAt: new Date(messageData.timestamp).toISOString(),
      isEdited: false,
      isPinned: false,
      attachments: messageData.attachments || [],
      mentions: messageData.mentions || [],
      replyToId: messageData.replyToMessageId || undefined,
      gifDetails: messageData.gifDetails || undefined,
      author: {
        id: messageData.author.id,
        name: messageData.author.name,
        discriminator: currentUser.discriminator || '0000', // Assuming discriminator is on currentUser
        avatarUrl: messageData.author.avatarUrl,
        // roleColor: messageData.author.roleColor, // If you have role color logic
      },
      // replyTo: if replyToMessageId is present, you might want to fetch and populate it here or handle it
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    setReplyToMessageId(null); // Clear reply state
    scrollToBottom();

    try {
      const response = await fetch('/api/chat-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'new_message',
          pusherSocketId: pusherSocketId,
          payload: {
            channelId: messageData.channelId,
            serverId: messageData.serverId,
            currentUserId: messageData.author.id,
            author: messageData.author,
            content: messageData.content,
            replyToMessageId: messageData.replyToMessageId,
            attachments: messageData.attachments,
            mentions: messageData.mentions,
            clientTempId: messageData.clientTempId,
            timestamp: messageData.timestamp,
            gifDetails: messageData.gifDetails,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send message. Unknown error.' }));
        throw new Error(errorData.message || `Failed to send message. Status: ${response.status}`);
      }

      // Message sent successfully, server will broadcast via Pusher.
      // The server now returns the full saved message data.
      const { data: savedMessage } = await response.json();
      console.log('[ChatRoom] Received saved message from API:', savedMessage);

      // Update the optimistic message with the confirmed data from the server
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageData.clientTempId ? { ...savedMessage, clientTempId: undefined } : msg
        )
      );

    } catch (error) {
      console.error('Error sending message fetch:', error);
      setError('Failed to send message. Network error or server issue.');
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageData.clientTempId));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditMessage = (id: string) => {
    const message = messages.find(msg => msg.id === id);
    if (message) {
      setEditingMessageId(id);
      setEditedContent(message.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editedContent.trim() || !currentUser || !channelId || !serverId) return;

    const originalMessages = messages;
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === editingMessageId
          ? {
              ...msg,
              content: editedContent,
              isEdited: true,
              updatedAt: new Date().toISOString(), 
            }
          : msg
      )
    );

    const originalEditingMessageId = editingMessageId;
    const originalEditedContent = editedContent; 

    setEditingMessageId(null);
    setEditedContent('');

    try {
      const response = await fetch('/api/chat-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'edit_message',
          pusherSocketId: pusherSocketId,
          payload: {
            messageId: originalEditingMessageId, 
            newContent: originalEditedContent,    
            channelId: channelId,
            serverId: serverId,
            currentUserId: currentUser.id,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to edit message. Server error.' }));
        throw new Error(errorData.message || `Failed to edit message. Status: ${response.status}`);
      }

      console.log(`[ChatRoom] Message ${originalEditingMessageId} edit event sent to API.`);
    } catch (error) {
      console.error('Error editing message via API:', error);
      setMessages(originalMessages);
      alert(`Failed to edit message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleDeleteMessage = async (id: string) => {
    if (!currentUser || !channelId || !serverId) return; 

    const originalMessages = messages;
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));

    try {
      const response = await fetch('/api/chat-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'delete_message',
          pusherSocketId: pusherSocketId, 
          payload: {
            messageId: id,
            channelId: channelId,
            serverId: serverId,
            currentUserId: currentUser.id, 
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete message. Server error.' }));
        throw new Error(errorData.message || `Failed to delete message. Status: ${response.status}`);
      }

      console.log(`[ChatRoom] Message ${id} delete event sent to API.`);
    } catch (error) {
      console.error('Error deleting message via API:', error);
      setMessages(originalMessages);
      alert(`Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!pusherClient) return;

    try {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;

      const existingReaction = message.reactions?.find(r => r.emoji === emoji);
      const userReacted = existingReaction?.userIds.includes(currentUser.id);

      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id !== messageId) return msg;

          let updatedReactions = [...(msg.reactions || [])];

          if (userReacted) {
            updatedReactions = updatedReactions.map(r => {
              if (r.emoji !== emoji) return r;
              return {
                ...r,
                userIds: r.userIds.filter(id => id !== currentUser.id)
              };
            }).filter(r => r.userIds.length > 0); 
          } else {
            const reaction = updatedReactions.find(r => r.emoji === emoji);
            if (reaction) {
              updatedReactions = updatedReactions.map(r => {
                if (r.emoji !== emoji) return r;
                return {
                  ...r,
                  userIds: [...r.userIds, currentUser.id]
                };
              });
            } else {
              updatedReactions.push({
                emoji,
                userIds: [currentUser.id]
              });
            }
          }

          return {
            ...msg,
            reactions: updatedReactions
          };
        })
      );

      const reactionData = {
        messageId,
        emoji,
        userId: currentUser.id,
        channelId,
        type: userReacted ? 'remove' : 'add'
      };

      // Update via Pusher
      // pusherClient.trigger('reaction', reactionData);
    } catch (error) {
      console.error('Error updating reaction:', error);

      try {
        const response = await fetch(`/api/messages?channelId=${channelId}&serverId=${serverId}`);
        if (response.ok) {
          const data = await response.json();
          const messagesArray = Array.isArray(data) ? data :
            (data.messages ? data.messages : []);
          setMessages(messagesArray);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    setReplyToMessageId(messageId);
  };

  const handleCancelReply = () => {
    setReplyToMessageId(null);
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || !lastVisibleMessageTimestamp.current) return;

    try {
      setLoadingMore(true);

      const response = await fetch(
        `/api/messages?channelId=${channelId}&serverId=${serverId}&before=${lastVisibleMessageTimestamp.current.getTime()}&limit=25`
      );

      if (!response.ok) {
        throw new Error(`Error fetching more messages: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const olderMessages = Array.isArray(data) ? data :
        (data.messages ? data.messages : []);

      if (olderMessages.length > 0) {
        setMessages(prevMessages => {
          // Combine and sort, ensuring no duplicates if there's overlap
          const allMessages = [...prevMessages, ...olderMessages];
          const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
          return uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Ascending
        });

        const oldestMessage = olderMessages[olderMessages.length - 1]; 
        if (oldestMessage && oldestMessage.createdAt) {
          lastVisibleMessageTimestamp.current = new Date(oldestMessage.createdAt);
        }

        setHasMore(olderMessages.length >= 25); 
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      setError('Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;

    if (messagesContainer) {
      const handleScroll = () => {
        if (messagesContainer.scrollTop === 0 && hasMore && !loadingMore) {
          loadMoreMessages();
        }
      };

      messagesContainer.addEventListener('scroll', handleScroll);

      return () => {
        messagesContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [hasMore, loadingMore]);

  const getMentionedUsers = (message: Message) => {
    if (!message.content.includes('@')) return [];

    const mentionedNames = (message.content.match(/@(\w+)/g) || [])
      .map(mention => mention.substring(1));

    return serverMembers
      .filter(member => mentionedNames.includes(member.user.name))
      .map(member => member.user);
  };

  const getReplyToMessage = (replyId: string) => {
    return messages.find(msg => msg.id === replyId);
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleTypingIndicator = useCallback((isTyping: boolean) => {
    if (pusherClient && currentPusherChannelRef.current && currentUser) {
      // Ensure channel is active and user is present
      try {
        currentPusherChannelRef.current.trigger('client-typing', {
          userId: currentUser.id,
          name: currentUser.name || 'Anonymous User',
          avatarUrl: currentUser.avatarUrl,
          discriminator: currentUser.discriminator || '0000',
          isTyping: isTyping,
        });
        // console.log(`[Pusher ChatRoom] Sent client-typing: ${isTyping}`);
      } catch (error) {
        console.error('[Pusher ChatRoom] Error sending client-typing event:', error);
      }
    }
  }, [pusherClient, currentUser]); // Note: currentPusherChannelRef.current is a ref, direct usage in deps is okay.

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-3 border-b border-gray-700 bg-gray-800 shadow-md">
        <h2 className="text-white font-semibold flex items-center">
          <span className="text-gray-400 mr-2">#</span>
          {channelName}
        </h2>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/40 m-3 rounded-md text-white">
          {error}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4"
      >
        {loadingMore && (
          <div className="flex justify-center p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {hasMore && !loadingMore && (
          <button
            onClick={loadMoreMessages}
            className="w-full py-2 text-gray-400 hover:text-white text-sm hover:bg-gray-700/30 rounded-md transition-colors"
          >
            Load more messages
          </button>
        )}

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const mentionedUsers = getMentionedUsers(msg);
              const replyToMessage = msg.replyToId ? getReplyToMessage(msg.replyToId) : null;

              const member = serverMembers.find(m => m.userId === msg.author.id);
              let roleColor = null;

              if (member && member.roles && member.roles.length > 0) {
                const sortedRoles = [...member.roles].sort((a, b) => b.position - a.position);
                roleColor = sortedRoles[0].color || null;
              }

              const authorWithRole = {
                ...msg.author,
                roleColor: roleColor
              };

              return (
                <ChatMessage
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  author={authorWithRole}
                  createdAt={msg.createdAt}
                  isEdited={msg.isEdited}
                  isPinned={msg.isPinned}
                  isMine={msg.author.id === currentUser?.id}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReact={handleReaction}
                  onReply={handleReplyToMessage}
                  currentUserId={currentUser?.id}
                  reactions={msg.reactions || []}
                  isEditing={editingMessageId === msg.id}
                  editedContent={editedContent}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditChange={(content) => setEditedContent(content)}
                  mentions={msg.mentions || []}
                  mentionedUsers={mentionedUsers}
                  replyTo={replyToMessage}
                  attachments={[
                    ...(msg.attachments || []),
                    ...(msg.gifDetails ? [{
                      id: msg.gifDetails.id || `gif-${msg.id}-${Date.now()}`,
                      type: 'gif' as const, 
                      url: msg.gifDetails.url,
                      previewUrl: msg.gifDetails.previewUrl,
                      width: msg.gifDetails.width,
                      height: msg.gifDetails.height,
                      title: msg.gifDetails.title || 'GIF',
                    }] : [])
                  ]}
                />
              );
            })}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-2 sm:px-4 py-1 text-gray-400 text-sm flex items-center space-x-2"
          >
            <div className="flex -space-x-2">
              {typingUsers.slice(0, 3).map(user => (
                <UserAvatar
                  key={user.userId}
                  user={{
                    id: user.userId,
                    name: user.name,
                    image: user.avatarUrl,
                    discriminator: user.discriminator
                  }}
                  size="xs"
                  showStatus={false}
                  className="border-2 border-gray-800"
                />
              ))}
            </div>
            <div>
              <span className="font-medium">
                {typingUsers.length === 1
                  ? typingUsers[0].name
                  : typingUsers.length === 2
                    ? `${typingUsers[0].name} and ${typingUsers[1].name}`
                    : typingUsers.length === 3
                      ? `${typingUsers[0].name}, ${typingUsers[1].name}, and ${typingUsers[2].name}`
                      : `${typingUsers[0].name}, ${typingUsers[1].name}, and ${typingUsers.length - 2} others`
                }
              </span>
              {' is typing'}
              <span className="animate-pulse">...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatInput
        channelId={channelId}
        serverId={serverId}
        currentUserId={currentUser?.id}
        currentUserName={currentUser?.name || 'User'}
        currentUserAvatarUrl={currentUser?.avatarUrl || currentUser?.image}
        replyToMessageId={replyToMessageId}
        onCancelReply={handleCancelReply}
        onSend={handleSendMessage}
        isLoading={sendingMessage}
        serverMembers={serverMembers.map(member => ({
          id: member.userId,
          name: member.user.name,
          discriminator: member.user.discriminator,
          avatarUrl: member.user.avatarUrl
        }))}
        onTyping={handleTypingIndicator}
        pusherSocketId={pusherSocketId || undefined}
      />
    </div>
  );
}