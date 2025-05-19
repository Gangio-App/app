import React, { useState, useEffect, useRef } from 'react';
import {
  useDataChannel,
  useMaybeRoomContext,
  LiveKitRoom
} from '@livekit/components-react';
import '@livekit/components-styles';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

// Types from your existing code
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

interface TypingUser {
  userId: string;
  name: string;
  avatarUrl?: string;
  discriminator: string;
}

interface LiveKitChatProps {
  channelId: string;
  serverId: string;
  channelName: string;
  currentUser: any;
  isDirect?: boolean;
  socket: any;
}

// Message types for LiveKit data channel
type LiveKitMessageType = 
  | 'CHAT_MESSAGE' 
  | 'TYPING_INDICATOR' 
  | 'MESSAGE_REACTION' 
  | 'MESSAGE_DELETE' 
  | 'MESSAGE_EDIT';

interface LiveKitMessagePayload {
  type: LiveKitMessageType;
  data: any;
}

export const LiveKitChat: React.FC<LiveKitChatProps> = ({
  channelId,
  serverId,
  channelName,
  currentUser,
  isDirect = false,
  socket
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [serverMembers, setServerMembers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);

  // Add function to encode message to Uint8Array
  const encodeMessage = (message: any): Uint8Array => {
    const jsonString = JSON.stringify(message);
    const encoder = new TextEncoder();
    return encoder.encode(jsonString);
  };

  // Fetch LiveKit token on component mount
  useEffect(() => {
    const fetchToken = async () => {
      if (!currentUser?.id || !channelId) return;
      
      try {
        // Change from POST to GET request with URL parameters
        const url = `/api/livekit-token?roomName=${encodeURIComponent(`chat_${serverId}_${channelId}`)}&participantName=${encodeURIComponent(currentUser.id)}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setLivekitToken(data.token);
        } else {
          const errorData = await response.json();
          console.error('Failed to fetch LiveKit token:', errorData.error);
        }
      } catch (error) {
        console.error('Error fetching LiveKit token:', error);
      }
    };

    fetchToken();
  }, [currentUser?.id, channelId, serverId]);

  // Inside the LiveKitRoom component wrapper
  const ChatContent = () => {
    // Get LiveKit room context
    const room = useMaybeRoomContext();
    
    // Initialize data channel for real-time messaging
    const { send: sendData, message: dataMessage } = useDataChannel();

    // Add typing indicator handler
    const handleTypingIndicator = (isTyping: boolean) => {
      if (!room || !sendData) return;
      
      sendData(encodeMessage({
        type: 'TYPING_INDICATOR',
        data: {
          channelId,
          userId: currentUser.id,
          isTyping
        }
      }), {});
    };

    // Effect to handle incoming data channel messages
    useEffect(() => {
      if (!dataMessage) return;
      try {
        const parsedMessage = JSON.parse(new TextDecoder().decode(dataMessage.payload)) as LiveKitMessagePayload;
        
        switch (parsedMessage.type) {
          case 'CHAT_MESSAGE':
            handleNewMessage(parsedMessage.data);
            break;
          case 'TYPING_INDICATOR':
            handleTyping(parsedMessage.data);
            break;
          case 'MESSAGE_REACTION':
            handleMessageReaction(parsedMessage.data);
            break;
          case 'MESSAGE_DELETE':
            handleMessageDelete(parsedMessage.data);
            break;
          case 'MESSAGE_EDIT':
            handleMessageUpdate(parsedMessage.data);
            break;
          default:
            console.log('Unknown message type', parsedMessage.type);
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    }, [dataMessage]);

    // Fetch initial messages when component mounts
    useEffect(() => {
      fetchMessages();
      fetchServerMembers();
    }, [channelId, serverId]);

    // Scroll to bottom when messages change
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]);

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        // Determine the API endpoint based on whether this is a DM or channel message
        const endpoint = isDirect 
          ? `/api/direct-messages?${new URLSearchParams({
              senderId: currentUser.id,
              recipientId: channelId.replace(currentUser.id, '').replace('-', '')
            })}`
          : `/api/messages?${new URLSearchParams({
              channelId,
              serverId
            })}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data);
        setHasMoreMessages(data.length >= 50); // Assuming API returns 50 messages per page
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchServerMembers = async () => {
      if (isDirect) return; // No need to fetch members for DMs
      
      try {
        const response = await fetch(`/api/servers/${serverId}/members`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch server members');
        }
        
        const data = await response.json();
        setServerMembers(data.members || []);
      } catch (error) {
        console.error('Error fetching server members:', error);
      }
    };

    const handleNewMessage = (message: Message) => {
      // Only add the message if it's for the current channel
      if (message.channelId === channelId) {
        setMessages(prev => [...prev, message]);
        
        // Remove typing indicator for the user who sent the message
        if (message.authorId) {
          setTypingUsers(prev => prev.filter(user => user.userId !== message.authorId));
        }
      }
    };

    const handleMessageUpdate = (updatedMessage: Message) => {
      if (updatedMessage.channelId === channelId) {
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      }
    };

    const handleMessageDelete = (data: { id: string, channelId: string }) => {
      if (data.channelId === channelId) {
        setMessages(prev => prev.filter(msg => msg.id !== data.id));
      }
    };

    const handleTyping = (data: { channelId: string; userId: string; isTyping: boolean }) => {
      if (data.channelId !== channelId || data.userId === currentUser.id) return;
      
      if (data.isTyping) {
        // Find user in server members
        const typingUser = serverMembers.find(member => member.userId === data.userId);
        
        if (typingUser && !typingUsers.some(user => user.userId === data.userId)) {
          setTypingUsers(prev => [...prev, {
            userId: data.userId,
            name: typingUser.nickname || typingUser.user.name,
            discriminator: typingUser.user.discriminator,
            avatarUrl: typingUser.user.avatarUrl
          }]);
        }
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    };

    const handleMessageReaction = (data: { 
      messageId: string, 
      userId: string, 
      emoji: string, 
      channelId: string,
      type: 'add' | 'remove'
    }) => {
      if (data.channelId !== channelId) return;
      
      setMessages(prev => prev.map(message => {
        if (message.id !== data.messageId) return message;
        
        let reactions = [...(message.reactions || [])];
        
        if (data.type === 'add') {
          // Check if the reaction already exists
          const existingReaction = reactions.find(r => r.emoji === data.emoji);
          
          if (existingReaction) {
            // Add user to existing reaction if not already added
            if (!existingReaction.userIds.includes(data.userId)) {
              existingReaction.userIds.push(data.userId);
            }
          } else {
            // Create new reaction
            reactions.push({
              emoji: data.emoji,
              userIds: [data.userId]
            });
          }
        } else {
          // Remove user from reaction
          reactions = reactions.map(r => {
            if (r.emoji === data.emoji) {
              return {
                ...r,
                userIds: r.userIds.filter(id => id !== data.userId)
              };
            }
            return r;
          }).filter(r => r.userIds.length > 0); // Remove reactions with no users
        }
        
        return {
          ...message,
          reactions
        };
      }));
    };

    const handleSendMessage = async (content: string, attachments: any[] = [], mentions: string[] = []) => {
      try {
        // Prepare the message data
        const messageData = isDirect 
          ? {
              content,
              senderId: currentUser.id,
              recipientId: channelId.replace(currentUser.id, '').replace('-', ''),
              attachments,
              mentions,
              replyToId: replyToMessageId
            }
          : {
              content,
              authorId: currentUser.id,
              channelId,
              serverId,
              attachments,
              mentions,
              replyToId: replyToMessageId
            };
        
        // First, send via REST API to persist in database
        const endpoint = isDirect ? '/api/direct-messages' : '/api/messages';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const newMessage = await response.json();
        
        // Then, broadcast via LiveKit data channel for real-time updates
        if (sendData) {
          sendData(encodeMessage({
            type: 'CHAT_MESSAGE',
            data: newMessage
          }), {});
        }
        
        // Reset reply state
        if (replyToMessageId) {
          setReplyToMessageId(null);
        }
        
        return newMessage;
      } catch (error) {
        console.error('Error sending message:', error);
        return null;
      }
    };

    const handleEditMessage = (id: string) => {
      const message = messages.find(msg => msg.id === id);
      
      if (message && message.authorId === currentUser.id) {
        setEditingMessageId(id);
        setEditContent(message.content);
      }
    };

    const handleSaveEdit = async () => {
      if (!editingMessageId || !editContent.trim()) return;
      
      try {
        const endpoint = isDirect ? '/api/direct-messages' : '/api/messages';
        const response = await fetch(`${endpoint}/${editingMessageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: editContent,
            authorId: currentUser.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update message');
        }
        
        const updatedMessage = await response.json();
        
        // Update local state
        setMessages(prev => 
          prev.map(msg => msg.id === editingMessageId ? updatedMessage : msg)
        );
        
        // Broadcast via LiveKit data channel
        if (sendData) {
          sendData(encodeMessage({
            type: 'MESSAGE_EDIT',
            data: updatedMessage
          }), {});
        }
      } catch (error) {
        console.error('Error updating message:', error);
      } finally {
        setEditingMessageId(null);
        setEditContent('');
      }
    };

    const handleCancelEdit = () => {
      setEditingMessageId(null);
      setEditContent('');
    };

    const handleDeleteMessage = async (id: string) => {
      const message = messages.find(msg => msg.id === id);
      
      if (!message || message.authorId !== currentUser.id) return;
      
      try {
        const endpoint = isDirect ? '/api/direct-messages' : '/api/messages';
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            authorId: currentUser.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete message');
        }
        
        // Update local state
        setMessages(prev => prev.filter(msg => msg.id !== id));
        
        // Broadcast via LiveKit data channel
        if (sendData) {
          sendData(encodeMessage({
            type: 'MESSAGE_DELETE',
            data: {
              id,
              channelId,
              serverId
            }
          }), {});
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    };

    const handleReaction = async (messageId: string, emoji: string) => {
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;
      
      // Check if user already reacted with this emoji
      const hasReacted = message.reactions?.some(r => 
        r.emoji === emoji && r.userIds.includes(currentUser.id)
      );
      
      const type = hasReacted ? 'remove' : 'add';
      
      try {
        const endpoint = isDirect ? '/api/direct-messages' : '/api/messages';
        const response = await fetch(`${endpoint}/${messageId}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: currentUser.id,
            emoji,
            type
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update reaction');
        }
        
        // Broadcast via LiveKit data channel
        if (sendData) {
          sendData(encodeMessage({
            type: 'MESSAGE_REACTION',
            data: {
              messageId,
              userId: currentUser.id,
              emoji,
              channelId,
              type
            }
          }), {});
        }
        
        // Update local state optimistically
        setMessages(prev => prev.map(message => {
          if (message.id !== messageId) return message;
          
          let reactions = [...(message.reactions || [])];
          
          if (type === 'add') {
            const existingReaction = reactions.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              if (!existingReaction.userIds.includes(currentUser.id)) {
                existingReaction.userIds.push(currentUser.id);
              }
            } else {
              reactions.push({
                emoji,
                userIds: [currentUser.id]
              });
            }
          } else {
            reactions = reactions.map(r => {
              if (r.emoji === emoji) {
                return {
                  ...r,
                  userIds: r.userIds.filter(id => id !== currentUser.id)
                };
              }
              return r;
            }).filter(r => r.userIds.length > 0);
          }
          
          return {
            ...message,
            reactions
          };
        }));
      } catch (error) {
        console.error('Error updating reaction:', error);
      }
    };

    const handleReplyToMessage = (messageId: string) => {
      setReplyToMessageId(messageId);
    };

    const handleCancelReply = () => {
      setReplyToMessageId(null);
    };

    const loadMoreMessages = async () => {
      if (!hasMoreMessages || isLoading) return;
      
      try {
        setIsLoading(true);
        
        const oldestMessage = messages[0];
        const before = oldestMessage?.createdAt;
        
        const endpoint = isDirect 
          ? `/api/direct-messages?${new URLSearchParams({
              senderId: currentUser.id,
              recipientId: channelId.replace(currentUser.id, '').replace('-', ''),
              before: before || ''
            })}`
          : `/api/messages?${new URLSearchParams({
              channelId,
              serverId,
              before: before || ''
            })}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch more messages');
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
          setHasMoreMessages(false);
          return;
        }
        
        // Save current scroll position
        const container = messagesContainerRef.current;
        const scrollHeight = container?.scrollHeight || 0;
        
        // Update messages
        setMessages(prev => [...data, ...prev]);
        
        // Restore scroll position after messages are added
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - scrollHeight;
          }
        }, 0);
        
        setHasMoreMessages(data.length >= 50);
      } catch (error) {
        console.error('Error fetching more messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const getMentionedUsers = (message: Message) => {
      if (!message.mentions?.length) return [];
      
      return message.mentions.map(mentionId => {
        const member = serverMembers.find(m => m.userId === mentionId);
        return member ? {
          id: mentionId,
          name: member.nickname || member.user.name,
          discriminator: member.user.discriminator,
          avatarUrl: member.user.avatarUrl
        } : null;
      }).filter(Boolean);
    };

    const getReplyToMessage = (replyId: string) => {
      return messages.find(msg => msg.id === replyId);
    };

    // Render chat interface
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden relative">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto px-4 py-4 custom-scrollbar"
          >
            {/* Replace with your MessageList component */}
            <div className="space-y-4">
              {hasMoreMessages && !isLoading && (
                <button 
                  onClick={loadMoreMessages}
                  className="w-full py-2 bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-700/80 transition-colors"
                >
                  Load more messages
                </button>
              )}
              
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className="message-container">
                  {/* You should implement your message component here */}
                  <div className="bg-gray-800/70 rounded-lg p-3">
                    <div className="flex items-start">
                      {message.author?.avatarUrl ? (
                        <img src={message.author.avatarUrl} alt={message.author.name} className="w-10 h-10 rounded-full mr-3" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center mr-3">
                          {message.author?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="font-semibold text-white">{message.author?.name}</span>
                          <span className="text-gray-400 text-xs ml-2">#{message.author?.discriminator}</span>
                          <span className="text-gray-500 text-xs ml-auto">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {message.replyToId && (
                          <div className="mt-1 text-sm text-gray-400 border-l-2 border-gray-600 pl-2">
                            Replying to {getReplyToMessage(message.replyToId)?.author?.name || 'a message'}
                          </div>
                        )}
                        <div className="mt-1 text-gray-200">
                          {message.content}
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                              <button
                                key={`${reaction.emoji}-${index}`}
                                className={`px-2 py-1 rounded-full text-xs flex items-center ${
                                  reaction.userIds.includes(currentUser.id)
                                    ? 'bg-emerald-700/40 text-emerald-300'
                                    : 'bg-gray-700/40 text-gray-300 hover:bg-gray-700/60'
                                }`}
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                              >
                                <span className="mr-1">{reaction.emoji}</span>
                                <span>{reaction.userIds.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {message.authorId === currentUser.id && (
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="text-gray-400 hover:text-gray-300 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleReplyToMessage(message.id)}
                        className="text-gray-400 hover:text-gray-300 text-xs flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 bg-gray-800/50 px-4 py-3">
          {typingUsers.length > 0 && (
            <div className="text-gray-400 text-sm mb-1 italic">
              {typingUsers.map(user => `${user.name}#${user.discriminator}`).join(', ')} 
              {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
            </div>
          )}
          
          {editingMessageId ? (
            <div className="pb-2">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <span className="flex-1">Editing message</span>
                <button 
                  onClick={handleCancelEdit}
                  className="text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              </div>
              {/* Custom logic for editing */}
              <div className="flex">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Edit your message..."
                />
                <button
                  onClick={handleSaveEdit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-md transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : replyToMessageId ? (
            <div className="pb-2">
              <div className="flex items-center text-sm text-gray-400 mb-1">
                <span className="flex-1">
                  Replying to {getReplyToMessage(replyToMessageId)?.author?.name || 'message'}
                </span>
                <button 
                  onClick={handleCancelReply}
                  className="text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              </div>
              {/* Custom input for reply */}
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Reply to ${getReplyToMessage(replyToMessageId)?.author?.name || 'message'}...`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    handleSendMessage(input.value);
                    input.value = '';
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-md transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            /* Default input */
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={`Message ${isDirect ? channelName : '#' + channelName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                onChange={(e) => {
                  // Typing indicator logic
                  const isTyping = e.target.value.length > 0;
                  handleTypingIndicator(isTyping);
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleSendMessage(input.value);
                  input.value = '';
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!livekitToken) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Connecting to chat...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={livekitToken}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gangio-1iknik3h.livekit.cloud"}
      connect={true}
      data-lk-theme="default"
      audio={false}
      video={false}
    >
      <ChatContent />
    </LiveKitRoom>
  );
}