import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: string) => {
  /* const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    const socketInstance = io({
      path: '/socket.io',
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId
      },
      // These options help with automatic reconnection
      reconnection: true,
      timeout: 20000, // Longer timeout for slow connections
      autoConnect: true,
    });

    // Set up event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setConnected(true);
      setReconnecting(false);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        // Need to manually reconnect
        socketInstance.connect();
      }
      // Else the socket will automatically try to reconnect
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
      setReconnecting(true);
    });
    
    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      setReconnecting(false);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.log('Socket reconnection failed');
      setReconnecting(false);
      // Could implement a manual reconnect strategy here
    });
    
    // Handle online users status
    socketInstance.on('user_status_change', (data: { userId: string, status: 'online' | 'offline' }) => {
      setOnlineUsers(prev => {
        if (data.status === 'online' && !prev.includes(data.userId)) {
          return [...prev, data.userId];
        } else if (data.status === 'offline') {
          return prev.filter(id => id !== data.userId);
        }
        return prev;
      });
    });

    // Save socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Helper function to check if a user is online
  const isUserOnline = useCallback((checkUserId: string) => {
    return onlineUsers.includes(checkUserId);
  }, [onlineUsers]);

  // Helper to manually reconnect if needed
  const reconnect = useCallback(() => {
    if (socket && !connected) {
      socket.connect();
    }
  }, [socket, connected]);

  return { 
    socket, 
    connected,
    reconnecting,
    onlineUsers,
    isUserOnline,
    reconnect
  }; */
  return { socket: null, connected: false, reconnecting: false, onlineUsers: [], isUserOnline: () => false, reconnect: () => {} };
}; 