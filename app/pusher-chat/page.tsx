'use client';

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import Pusher from 'pusher-js';

interface Message {
  id?: string; // Optional: if server assigns an ID
  text: string;
  sender: string;
  timestamp: number;
}

export default function PusherChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));
  const [socketId, setSocketId] = useState<string | null>(null); // Added state for socket_id
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null); // Pusher.Channel type can be more specific if needed

  useEffect(() => {
    // Ensure Pusher is initialized only once
    if (!pusherRef.current) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

      if (!pusherKey || !pusherCluster) {
        console.error('Pusher environment variables not set!');
        return;
      }

      Pusher.logToConsole = true; // Enable pusher logging - don't include this in production

      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
      });

      // Listen for connection established to get socket_id
      pusherRef.current.connection.bind('connected', () => {
        if (pusherRef.current) { // Check if current is not null
          const currentSocketId = pusherRef.current.connection.socket_id;
          setSocketId(currentSocketId);
          console.log('Pusher connected, socket_id:', currentSocketId);
        }
      });

      channelRef.current = pusherRef.current.subscribe('public-chat-channel');

      channelRef.current.bind('new-message-event', (data: Message) => {
        console.log('Received message via Pusher:', data);
        // Prevent adding own messages if they are already added optimistically
        // or if the server echoes back the sender's message with an ID.
        // For now, assuming server doesn't echo back to sender or provides unique ID.
        setMessages((prevMessages) => [...prevMessages, data]);
      });
    }

    // Cleanup on component unmount
    return () => {
      if (pusherRef.current && channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current.unsubscribe('public-chat-channel');
        // pusherRef.current.disconnect(); // Disconnect if no other subscriptions are active
        console.log('Pusher channel unbound and unsubscribed');
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newMessage.trim()) return;

    const messageData: Message = {
      text: newMessage,
      sender: username,
      timestamp: Date.now(),
    };

    // Optimistically update UI for the sender
    // Note: If the server echoes back messages to the sender via Pusher,
    // and Pusher updates the state, this optimistic update might lead to duplicates
    // unless handled (e.g., by assigning a temporary client-side ID and reconciling).
    // For this basic setup, we'll keep the optimistic update and assume the Pusher event
    // might re-add it if not handled on the client or if server sends to all including sender.
    // A more robust solution would involve temporary IDs or server not echoing to sender.
    setMessages(prevMessages => [...prevMessages, messageData]); 
    setNewMessage('');

    try {
      const payload = {
        ...messageData,
        socketId: socketId // Include socket_id in the payload
      };

      const response = await fetch('/api/pusher-send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send the payload with socket_id
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      console.log('Message sent successfully via API');
      // Message will be added to the list via Pusher event for other clients.
      // For the sender, it's already optimistically added.
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally: revert optimistic update or show error to user
      // For example, remove the optimistically added message if API call fails:
      setMessages(prevMessages => prevMessages.filter(msg => 
        !(msg.text === messageData.text && msg.sender === messageData.sender && msg.timestamp === messageData.timestamp)
      )); 
      alert(`Error: ${error instanceof Error ? error.message : 'Could not send message'}`);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4 text-emerald-400 text-center">Pusher Chat</h1>
      
      <div className="flex-grow overflow-y-auto mb-4 p-3 bg-gray-800 rounded-lg shadow-md">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-2 rounded-md ${msg.sender === username ? 'bg-emerald-600 ml-auto' : 'bg-gray-700 mr-auto'}`} style={{maxWidth: '75%'}}>
            <p className="text-xs text-gray-400">{msg.sender} - {new Date(msg.timestamp).toLocaleTimeString()}</p>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-md font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
