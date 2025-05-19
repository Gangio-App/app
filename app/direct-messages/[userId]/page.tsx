'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FiSmile, FiPaperclip, FiSend, FiPlus, FiSearch, FiChevronDown, FiChevronUp, FiThumbsUp, FiMessageSquare, FiSettings, FiLogOut, FiTrash2, FiUsers, FiEdit3, FiCornerUpLeft, FiImage } from 'react-icons/fi';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { v4 as uuidv4 } from 'uuid'; // For client-side temporary ID generations
import debounce from 'lodash/debounce';
import MessageReactions from '@/components/MessageReactions';
import LinkPreview from '@/components/LinkPreview';
import { getPusherClient, getPrivateChannelName, cleanupPusher } from '@/lib/pusher-client';
import { Channel } from 'pusher-js';
import ThreeBackground from '@/components/ui/ThreeBackground'; // Assuming this component exists
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';

// Define types
interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  steamAvatarUrl?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  editedAt?: Date; // Added for message edit tracking
  reactions?: Array<{
    emoji: string;
    userId: string;
    username?: string;
    timestamp: Date;
  }>;
}

export default function DirectMessagePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();

  // State
  const [recipient, setRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [addingReaction, setAddingReaction] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [searchGif, setSearchGif] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [selectedGif, setSelectedGif] = useState<any>(null);
  // State for new messages indicator
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [showJumpButton, setShowJumpButton] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const pusherRef = useRef<any>(null); // pusher-js client is not strictly typed
  const channelRef = useRef<Channel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const gifButtonRef = useRef<HTMLButtonElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const firstUnreadMessageRef = useRef<HTMLDivElement>(null);

  // Get recipient ID from URL params
  const recipientUserId = params?.userId as string;

  // Get current user ID and auth tokens
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authTokenForPusher, setAuthTokenForPusher] = useState<string | null>(null);
  const [authTokenForApi, setAuthTokenForApi] = useState<string | null>(null);

  // Initialize authentication variables
  useEffect(() => {
    let userId: string | null = null;
    let tokenForPusher: string | null = null;
    let tokenForApi: string | null = null;

    if (session?.user?.id) {
      userId = session.user.id;
    } else if (typeof window !== 'undefined') {
      const localUserStr = localStorage.getItem('currentUser');
      if (localUserStr) {
        try {
          const localUserData = JSON.parse(localUserStr);
          userId = localUserData?.id || null;
          if (userId) {
            tokenForPusher = localStorage.getItem('authToken');
          }
        } catch (e) {
          console.error('Failed to parse currentUser from localStorage:', e);
        }
      }
    }

    if (typeof window !== 'undefined') {
      tokenForApi = localStorage.getItem('authToken');
    }

    setCurrentUserId(userId);
    setAuthTokenForPusher(tokenForPusher);
    setAuthTokenForApi(tokenForApi);
  }, [session]);

  // Load the last read timestamp from localStorage
  useEffect(() => {
    if (recipientUserId && typeof window !== 'undefined') {
      const lastRead = localStorage.getItem(`dm_last_read_${recipientUserId}`);
      if (lastRead) {
        setLastReadTimestamp(parseInt(lastRead, 10));
      }
    }
  }, [recipientUserId]);

  // Update the last read timestamp when viewing messages and track unread messages
  useEffect(() => {
    if (messages.length > 0 && !loading && recipientUserId) {
      const now = Date.now();
      localStorage.setItem(`dm_last_read_${recipientUserId}`, now.toString());
      
      // Count unread messages
      if (lastReadTimestamp) {
        const unreadCount = messages.filter(
          message => new Date(message.timestamp).getTime() > lastReadTimestamp && message.senderId !== currentUserId
        ).length;
        
        setUnreadMessageCount(unreadCount);
        // Check if we should show the jump button based on message count and scroll height
        const scrollHeight = messagesContainerRef.current?.scrollHeight || 0;
        const clientHeight = messagesContainerRef.current?.clientHeight || 0;
        setShowJumpButton(unreadCount > 0 && scrollHeight > clientHeight * 1.5);
      }
    }
  }, [messages, loading, recipientUserId, lastReadTimestamp, currentUserId]);
  
  // Clear the unread indicator when user interacts with the chat
  useEffect(() => {
    // Clear unread messages when user types a message or sends one
    if (newMessage.length > 0 || sendingMessage) {
      setUnreadMessageCount(0);
      setShowJumpButton(false);
      
      if (recipientUserId) {
        const now = Date.now();
        localStorage.setItem(`dm_last_read_${recipientUserId}`, now.toString());
        setLastReadTimestamp(now);
      }
    }
  }, [newMessage, sendingMessage, recipientUserId]);

  // Fetch recipient data and messages
  useEffect(() => {
    const fetchData = async () => {
      if (sessionStatus === 'loading') {
        setLoading(true);
        return;
      }

      // Check authentication
      if (sessionStatus === 'unauthenticated' && !authTokenForApi) {
        toast.error('Please log in to view messages');
        router.push('/login');
        return;
      }

      if (!recipientUserId || !currentUserId) {
        setLoading(false);
        //setError('User information is missing.'); // Avoid setting error before IDs are ready
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Prepare headers
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (authTokenForApi && !session?.user?.id) {
          headers['Authorization'] = `Bearer ${authTokenForApi}`;
        }

        // Fetch recipient data
        const userResponse = await fetch(`/api/users/${recipientUserId}`, { headers });
        if (!userResponse.ok) {
          if (userResponse.status === 404) setError('Recipient not found.');
          else setError('Failed to fetch user data.');
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setRecipient(userData);

        // Fetch messages
        const messagesResponse = await fetch(`/api/messages/direct/${recipientUserId}`, { headers });
        if (!messagesResponse.ok) {
            setError('Failed to fetch messages.');
            throw new Error('Failed to fetch messages');
        }
        const messagesData = await messagesResponse.json();

        // Convert timestamps to Date objects
        const formattedMessages = messagesData.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        setMessages(formattedMessages);

        // Mark messages as read
        const unreadMessages = formattedMessages.filter(
          (m: Message) => m.senderId === recipientUserId && !m.read
        );

        if (unreadMessages.length > 0) {
          await fetch('/api/messages/read', {
            method: 'POST',
            headers,
            body: JSON.stringify({ senderId: recipientUserId })
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (!error) {
             setError(err instanceof Error ? err.message : 'Failed to load conversation');
        }
        // toast.error('Failed to load messages'); // Avoid redundant toasts if error state is used
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) { // Ensure currentUserId is set before fetching
        fetchData();
    }
  }, [recipientUserId, sessionStatus, currentUserId, authTokenForApi, session?.user?.id, router, error]); // Added error to dependency array

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Pusher and subscribe to channel
  useEffect(() => {
    if (!currentUserId || !recipientUserId) return;

    try {
      const channelName = getPrivateChannelName(currentUserId, recipientUserId);
      
      if (!pusherRef.current) {
        const token = !session?.user?.id ? (authTokenForPusher || undefined) : undefined;
        pusherRef.current = getPusherClient(token);
      }

      if (channelRef.current?.name === channelName && channelRef.current?.subscribed) {
        return; // Already subscribed to the correct channel
      }

      if (channelRef.current) {
        pusherRef.current.unsubscribe(channelRef.current.name);
      }

      channelRef.current = pusherRef.current.subscribe(channelName);

      if (channelRef.current) {
        channelRef.current.bind('pusher:subscription_succeeded', () => {
          console.log('Successfully subscribed to channel:', channelName);
          // For presence channels, trigger an event to get current members
          // if (channelRef.current?.members) {
          //   const initialOnlineStatus: Record<string, boolean> = {};
          //   channelRef.current.members.each((member: {id: string}) => initialOnlineStatus[member.id] = true);
          //   setOnlineStatus(initialOnlineStatus);
          // }
        });

        channelRef.current.bind('pusher:subscription_error', (status: any) => {
          console.error('Subscription error:', status);
          toast.error('Failed to connect to chat. Please refresh.');
        });

        channelRef.current.bind('new_message', (data: Message) => {
          setMessages(prev => {
            if (!prev.some(m => m.id === data.id)) {
              const newMessageWithDate = {
                ...data,
                timestamp: new Date(data.timestamp)
              };
              const updatedMessages = [...prev, newMessageWithDate].sort((a, b) => 
                a.timestamp.getTime() - b.timestamp.getTime()
              );
              
              // If the message is from the other user
              if (data.senderId === recipientUserId) {
                // If user is not actively viewing the chat (page not in focus or minimized)
                if (document.hidden || !document.hasFocus()) {
                  // Increment unread count and save to localStorage
                  const newUnreadCount = unreadMessageCount + 1;
                  setUnreadMessageCount(newUnreadCount);
                  setShowJumpButton(true);
                  
                  // Save to localStorage for the direct messages list page
                  if (recipientUserId) {
                    localStorage.setItem(`dm_unread_count_${recipientUserId}`, newUnreadCount.toString());
                  }
                } else {
                  // User is actively viewing, mark as read
                  const headers: HeadersInit = { 'Content-Type': 'application/json' };
                  if (authTokenForApi && !session?.user?.id) {
                      headers['Authorization'] = `Bearer ${authTokenForApi}`;
                  }
                  fetch('/api/messages/read', {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({ senderId: recipientUserId })
                  }).catch(err => console.error('Error marking message as read via Pusher event:', err));
                }
              }
              return updatedMessages;
            }
            return prev;
          });
        });

        channelRef.current.bind('typing_event', (data: { userId: string; isTyping: boolean }) => {
          if (data.userId === recipientUserId) {
            setIsUserTyping(data.isTyping);
          }
        });

        // Example for presence channels (you need to use `pusher.subscribe('presence-channelName')`)
        // channelRef.current.bind('pusher:member_added', (member: { id: string }) => {
        //   setOnlineStatus(prev => ({ ...prev, [member.id]: true }));
        // });

        // channelRef.current.bind('pusher:member_removed', (member: { id: string }) => {
        //   setOnlineStatus(prev => ({ ...prev, [member.id]: false }));
        // });

      } 
    } catch (err) {
      console.error('Error setting up Pusher:', err);
      toast.error('Failed to initialize chat service.');
    }

    // Automatically focus the message input when chat is ready
    if (messageInputRef.current && document.activeElement !== messageInputRef.current && !showEmojiPicker && !showGifPicker) {
      // Small delay to allow other UI elements to settle, e.g., if pickers were just closed
      setTimeout(() => {
        if (messageInputRef.current) { // Re-check ref after timeout
          messageInputRef.current.focus();
        }
      }, 100); 
    }

    return () => {
      if (pusherRef.current && channelRef.current?.name) {
        if (channelRef.current) {
          channelRef.current.unbind('new_message');
        }
        cleanupPusher(pusherRef.current, channelRef.current.name);
        // channelRef.current = null; // Pusher client manages channel instances internally
      }
    };
  }, [currentUserId, recipientUserId, session?.user?.id, authTokenForPusher, authTokenForApi, showEmojiPicker, showGifPicker]);



  const handleTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!currentUserId || !channelRef.current?.name) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (authTokenForApi && !session?.user?.id) {
            headers['Authorization'] = `Bearer ${authTokenForApi}`;
        }

        await fetch('/api/pusher/trigger', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                channel: channelRef.current.name,
                event: 'typing_event',
                data: { userId: currentUserId, isTyping }
            })
        });

        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              handleTypingIndicator(false);
            }, 3000); // Auto-stop typing after 3s
        }
    } catch (err) {
        console.error('Error sending typing indicator:', err);
    }
  }, [currentUserId, authTokenForApi, session?.user?.id]);

  // Handle message changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Auto-resize textarea
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = `${Math.min(messageInputRef.current.scrollHeight, 150)}px`;
    }

    // Send typing indicator
    handleTypingIndicator(value.length > 0);

    // Mark messages as read when user starts typing
    if (value.length === 1) { // Only on the first character
      setUnreadMessageCount(0);
      setShowJumpButton(false);
      if (recipientUserId) {
        const now = Date.now();
        localStorage.setItem(`dm_last_read_${recipientUserId}`, now.toString());
        localStorage.setItem(`dm_unread_count_${recipientUserId}`, '0');
        setLastReadTimestamp(now);
      }
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !recipientUserId || sendingMessage) return;

    try {
      setSendingMessage(true);

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authTokenForApi && !session?.user?.id) {
        headers['Authorization'] = `Bearer ${authTokenForApi}`;
      }

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: recipientUserId,
          type: 'text' // Assuming default type is text
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      // const result = await response.json(); // Message will be added via Pusher
      setNewMessage(''); // Clear input after successful send

    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
      handleTypingIndicator(false); // Stop typing indicator
      if (messageInputRef.current) {
        messageInputRef.current.focus(); // Re-focus after sending
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // URL detection regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Function to handle adding a reaction to a message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (addingReaction || !currentUserId) return;
    
    try {
      setAddingReaction(true);
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authTokenForApi && !session?.user?.id) {
        headers['Authorization'] = `Bearer ${authTokenForApi}`;
      }
      
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messageId,
          userId: currentUserId,
          emoji
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add reaction');
      }
      
      // Update the messages state with the updated message
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), {
                emoji,
                userId: currentUserId,
                username: session?.user?.name || 'You',
                timestamp: new Date()
              }]
            };
          }
          return msg;
        });
      });
      
    } catch (err) {
      console.error('Error adding reaction:', err);
      toast.error('Failed to add reaction');
    } finally {
      setAddingReaction(false);
    }
  };
  
  // Function to handle removing a reaction from a message
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    if (addingReaction || !currentUserId) return;
    
    try {
      setAddingReaction(true);
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authTokenForApi && !session?.user?.id) {
        headers['Authorization'] = `Bearer ${authTokenForApi}`;
      }
      
      const response = await fetch('/api/messages/reactions', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          messageId,
          userId: currentUserId,
          emoji
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove reaction');
      }
      
      // Update the messages state by removing the reaction
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                r => !(r.emoji === emoji && r.userId === currentUserId)
              )
            };
          }
          return msg;
        });
      });
      
    } catch (err) {
      console.error('Error removing reaction:', err);
      toast.error('Failed to remove reaction');
    } finally {
      setAddingReaction(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderId === currentUserId;
    const messageClasses = isCurrentUser
      ? 'bg-emerald-600 text-white self-end rounded-tl-lg rounded-tr-lg rounded-bl-lg'
      : 'bg-gray-700 text-white self-start rounded-tl-lg rounded-tr-lg rounded-br-lg';
    
    // Check for URLs in message content
    const hasUrl = message.type === 'text' && urlRegex.test(message.content);
    // Reset regex lastIndex
    urlRegex.lastIndex = 0;
    // Extract the first URL if available
    const urls = message.type === 'text' ? message.content.match(urlRegex) : null;
    const firstUrl = urls && urls.length > 0 ? urls[0] : null;
    
    return (
      <motion.div 
        key={message.id || index} 
        className={`flex flex-col max-w-[90%] md:max-w-[80%] ${isCurrentUser ? 'items-end ml-auto' : 'items-start mr-auto'} mb-3 md:mb-4 group relative`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isCurrentUser && recipient && (
          <div className="text-xs text-gray-400 mb-1 ml-1">
            {recipient.name}
          </div>
        )}
        
        <div className={`p-2 md:p-3 shadow-md ${messageClasses} ${hasUrl ? 'w-full' : ''}`}>
          {message.type === 'text' ? (
            <p className="whitespace-pre-wrap break-words text-sm md:text-base">{message.content}</p>
          ) : message.type === 'image' && message.mediaUrl ? (
            <div className="max-w-full overflow-hidden">
              <img 
                src={message.mediaUrl} 
                alt="Shared content" 
                className="max-w-full md:max-w-xs rounded" 
                loading="lazy"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  // Try fallback URL if available
                  if ((message as any).mp4Url) {
                    (e.target as HTMLImageElement).src = (message as any).mp4Url;
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-gray-300 text-sm">Unsupported message type</p>
          )}
          
          {/* Link Preview */}
          {firstUrl && (
            <div className="mt-3 -mb-1 mx-[-0.5rem]">
              <LinkPreview url={firstUrl} />
            </div>
          )}
        </div>
        
        {/* Reaction Button - appears on hover */}
        {/* Message Action Icons - appear on hover */}
        <div className={`absolute top-1/2 transform -translate-y-1/2 flex items-center space-x-1 p-1 rounded-md bg-gray-800 bg-opacity-75 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isCurrentUser ? 'left-[-30px] md:left-[-40px]' : 'right-[-30px] md:right-[-40px]'}`}>
          <button
            onClick={() => console.log('Reply to:', message.id)}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Reply"
          >
            <FiCornerUpLeft size={14} />
          </button>
          {isCurrentUser && (
            <>
              <button
                onClick={() => console.log('Edit:', message.id)}
                className="p-1 text-gray-300 hover:text-white transition-colors"
                title="Edit"
              >
                <FiEdit3 size={14} />
              </button>
              <button
                onClick={() => console.log('Delete:', message.id)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            </>
          )}
          {/* Reaction Button moved into this group or kept separate based on desired UX - for now, keeping separate as per existing code */}
        </div>

        {/* Reaction Button - existing logic - consider integrating into the above group for cleaner look */}
        <div className={`absolute ${isCurrentUser ? 'left-[-60px] md:left-[-70px]' : 'right-[-60px] md:right-[-70px]'} top-1/3 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
          <button
            onClick={() => handleAddReaction(message.id, '👍')}
            className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors shadow-md"
            aria-label="Add reaction"
          >
            <span className="text-sm">👍</span>
          </button>
        </div>
        
        {/* Reactions Display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`${isCurrentUser ? 'pr-2' : 'pl-2'} mt-1 w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-wrap gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
              {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                const count = message.reactions?.filter(r => r.emoji === emoji).length || 0;
                const userReacted = message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId);
                
                return (
                  <button
                    key={`${message.id}-${emoji}`}
                    className={`px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 ${userReacted ? 'bg-emerald-600/50' : 'bg-gray-700/50 hover:bg-gray-600/50'}`}
                    onClick={() => userReacted 
                      ? handleRemoveReaction(message.id, emoji) 
                      : handleAddReaction(message.id, emoji)
                    }
                  >
                    <span>{emoji}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        <div className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'mr-1' : 'ml-1'} flex items-center`}>
          {format(new Date(message.timestamp), 'p')}
          {message.editedAt && <span className="ml-1 text-gray-400">(edited)</span>}
          {isCurrentUser && (
            <span className="ml-2">
              {message.read ? (
                <span className="text-emerald-400">✓✓</span>
              ) : (
                <span className="text-gray-400">✓</span>
              )}
            </span>
          )}
        </div>

        {/* We've replaced this with a hover reaction button */}
      </motion.div>
    );
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Handle GIF selection
  const handleGifSelect = (gif: any) => {
    setSelectedGif(gif);
    setShowGifPicker(false);
    // Automatically send message with GIF
    handleSendGif(gif);
  };

  // Search for GIFs using the server-side API
  const searchGifs = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setGifs([]);
        return;
      }

      setIsLoadingGifs(true);
      try {
        // Use the server-side Tenor API route instead of direct GIPHY API calls
        const response = await fetch(`/api/gifs?q=${encodeURIComponent(query)}&limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch GIFs');
        }
        
        const data = await response.json();
        console.log('GIF response data:', data); // Debugging log
        
        if (data.gifs && Array.isArray(data.gifs)) {
          // Format based on our server's actual response structure
          setGifs(data.gifs);
        } else {
          console.warn('Unexpected GIF response format:', data);
          setGifs([]);
        }
      } catch (error) {
        console.error('Error searching for GIFs:', error);
        toast.error('Failed to load GIFs');
      } finally {
        setIsLoadingGifs(false);
      }
    }, 500),
    []
  );

  // Handle GIF search input change
  const handleGifSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchGif(value);
    searchGifs(value);
  };

  // Handle sending a message with a GIF
  const handleSendGif = async (gif: any) => {
    if (!currentUserId || !recipientUserId || sendingMessage) return;
    
    setSendingMessage(true);
    console.log('Sending GIF with data:', gif);
    
    // Determine the best URL to use based on available options
    const gifUrl = gif.gifUrl || gif.previewUrl || gif.mp4Url || gif.webmUrl;
    
    if (!gifUrl) {
      toast.error('This GIF cannot be sent. Please try another.');
      setSendingMessage(false);
      return;
    }
    
    const messageData = {
      senderId: currentUserId,
      receiverId: recipientUserId,
      content: '🖼️ [GIF]',
      mediaUrl: gifUrl,
      mp4Url: gif.mp4Url,  // Add mp4Url as fallback
      webmUrl: gif.webmUrl, // Add webmUrl as another fallback
      type: 'image' as 'text' | 'image' | 'file', // Explicitly typed as one of the allowed types
      read: false,
      timestamp: new Date()
    };
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authTokenForApi && !session?.user?.id) {
        headers['Authorization'] = `Bearer ${authTokenForApi}`;
      }
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send GIF');
      }
      
      const data = await response.json();
      
      // Update the UI optimistically
      const newMessage: Message = {
        ...messageData,
        id: data.id || uuidv4()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setSelectedGif(null);
    } catch (error) {
      console.error('Error sending GIF:', error);
      toast.error('Failed to send GIF. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Close emoji and GIF pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && emojiPickerRef.current && emojiButtonRef.current && 
          !emojiPickerRef.current.contains(event.target as Node) && 
          !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      
      if (showGifPicker && gifPickerRef.current && gifButtonRef.current && 
          !gifPickerRef.current.contains(event.target as Node) && 
          !gifButtonRef.current.contains(event.target as Node)) {
        setShowGifPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showGifPicker]);

  // Main component render
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900 text-white relative overflow-hidden">
      <ThreeBackground /> 
      
      {/* Mobile-responsive sidebar - hidden on small screens, visible on md and up */}
      <div className="hidden md:block">
        <UniversalSidebarNew />
      </div>
      
      <div className="flex-1 flex flex-col z-10 relative h-full w-full max-w-full">
        {/* Header */}
        <div className="border-b border-gray-800 p-3 md:p-4 flex items-center sticky top-0 bg-gray-900/80 backdrop-blur-md z-20">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 shrink-0">
            {recipient?.avatarUrl || recipient?.steamAvatarUrl ? (
              <img 
                src={recipient.avatarUrl || recipient.steamAvatarUrl!} 
                alt={recipient.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
                {recipient?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{recipient?.name || 'Loading User...'}</h2>
            <div className="text-xs text-gray-400">
              {isUserTyping && recipientUserId !== currentUserId ? `${recipient?.name} is typing...` : 
               (onlineStatus[recipientUserId] ? <span className="text-emerald-400">Online</span> : 'Offline')}
            </div>
          </div>
          <button
            onClick={() => router.back()} // More generic back navigation
            className="p-2 rounded-full hover:bg-gray-700 transition-colors ml-2 shrink-0"
            aria-label="Back"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
        
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-2 md:px-4 py-3 space-y-2 md:space-y-3 scroll-smooth" 
          id="message-list"
        >
          {error && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-red-400 bg-red-500/10 p-3 rounded-md">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
              >
                Try Reloading
              </button>
            </div>
          )}
          {!error && loading && messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                className="w-10 h-10 border-4 border-t-emerald-500 border-gray-700 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
          {!error && !loading && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
              <FiMessageSquare className="w-16 h-16 mb-4 text-gray-600" />
              <p>No messages yet with {recipient?.name || 'this user'}.</p>
              <p>Send a message to start the conversation!</p>
            </div>
          )}
          {!error && messages.length > 0 && (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              {unreadMessageCount > 0 && (
                <div className="px-2 py-1 my-3 flex justify-between items-center">
                    <div 
                      className="bg-red-500/10 text-red-300 text-xs font-medium px-3 py-1.5 rounded-md"
                      ref={firstUnreadMessageRef}
                    >
                      {unreadMessageCount} new message{unreadMessageCount !== 1 ? 's' : ''}
                    </div>
                    
                    {showJumpButton && (
                      <button
                        onClick={() => {
                          // Scroll to the first unread message
                          firstUnreadMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          
                          // Mark as read after jumping to the messages
                          setTimeout(() => {
                            setUnreadMessageCount(0);
                            setShowJumpButton(false);
                            
                            // Update last read timestamp
                            if (recipientUserId) {
                              const now = Date.now();
                              localStorage.setItem(`dm_last_read_${recipientUserId}`, now.toString());
                              setLastReadTimestamp(now);
                            }
                          }, 500);
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-xs text-white px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                        Jump to new messages
                      </button>
                    )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Message Input Area */}
        {!error && (
        <div className="border-t border-gray-800 p-2 md:p-4 bg-gray-900/80 backdrop-blur-md mt-auto">
          <div className="flex items-end bg-gray-800 rounded-lg p-2 shadow-md">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${recipient?.name || '...'}`}
              className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder:text-gray-500 max-h-28 text-sm sm:text-base"
              rows={1}
              disabled={sendingMessage || loading}
              autoFocus
            />
            
            <div className="flex space-x-1 sm:space-x-2 ml-2">
              {/* Emoji Button */}
              <button
                ref={emojiButtonRef}
                type="button"
                className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                aria-label="Add emoji"
                disabled={sendingMessage || loading}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifPicker(false);
                }}
              >
                <FiSmile className="w-5 h-5" />
              </button>
              
              {/* GIF Button */}
              <button
                ref={gifButtonRef}
                type="button"
                className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                aria-label="Add GIF"
                disabled={sendingMessage || loading}
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
              >
                <FiImage className="w-5 h-5" />
              </button>
              
              {/* Send Button */}
              <button
                type="button"
                className={`p-2.5 rounded-full transition-colors flex items-center justify-center 
                  ${ newMessage.trim() && !sendingMessage && !loading
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage || loading}
                aria-label="Send message"
              >
                {sendingMessage ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-[80px] right-2 md:right-4 z-50 max-w-[90vw] md:max-w-[300px]"
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                searchPlaceHolder="Search emoji..."
                width={300}
                height={400}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          {/* GIF Picker */}
          {showGifPicker && (
            <div 
              ref={gifPickerRef}
              className="absolute bottom-[80px] right-2 md:right-4 z-50 bg-gray-800 rounded-lg shadow-xl w-[90vw] md:w-80 p-3"
            >
              <div className="mb-3">
                <input 
                  type="text"
                  value={searchGif}
                  onChange={handleGifSearchChange}
                  placeholder="Search GIFs..."
                  className="w-full p-2 rounded bg-gray-700 text-white outline-none border border-gray-600 focus:border-emerald-500"
                />
              </div>
              
              <div className="overflow-y-auto max-h-80 grid grid-cols-2 gap-2">
                {isLoadingGifs ? (
                  <div className="col-span-2 py-10 flex justify-center">
                    <motion.div 
                      className="w-8 h-8 border-4 border-t-emerald-500 border-gray-700 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                ) : gifs.length > 0 ? (
                  gifs.map((gif) => (
                    <div 
                      key={gif.id}
                      className="cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden rounded"
                      onClick={() => handleGifSelect(gif)}
                    >
                      <img 
                        src={gif.previewUrl || gif.gifUrl || gif.mp4Url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R0lGPC90ZXh0Pjwvc3ZnPg=='} 
                        alt={gif.title || 'GIF'}
                        className="w-full h-auto object-cover rounded-md"
                        loading="lazy"
                        onError={(e) => {
                          console.error('Preview image failed to load:', e);
                          // Try other formats or use placeholder
                          if (gif.mp4Url) {
                            (e.target as HTMLImageElement).src = gif.mp4Url;
                          } else if (gif.gifUrl) {
                            (e.target as HTMLImageElement).src = gif.gifUrl;
                          } else {
                            // Add a placeholder if the image fails to load
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R0lGPC90ZXh0Pjwvc3ZnPg==';
                          }
                        }}
                      />
                    </div>
                  ))
                ) : searchGif && (
                  <div
                  className="col-span-2 py-5 text-center text-gray-400"
                >
                  No GIFs found for "{searchGif}"
                </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}