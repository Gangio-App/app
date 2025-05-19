import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db';

// Define socket server type
export interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

// Define the extended response type - this needs to be compatible with NextApiResponse
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: SocketServer;
  };
};

export default async function socketHandler(
  req: NextApiRequest,
  res: any // Using any type to bypass TypeScript issues
) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_API_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Connect to database once
    const db = await connectToDatabase();

    // Handle socket connections
    io.on('connection', async (socket) => {
      console.log('User connected:', socket.id);
      
      // Extract user ID from query params
      const userId = socket.handshake.query.userId as string;
      if (!userId) {
        console.error('No user ID provided, disconnecting socket');
        socket.disconnect();
        return;
      }
      
      console.log(`User ${userId} connected`);
      
      // Join server room
      socket.on('join_server', (serverId: string) => {
        socket.join(`server:${serverId}`);
        console.log(`User ${userId} joined server ${serverId}`);
      });
      
      // Join channel room
      socket.on('join_channel', (channelId: string) => {
        socket.join(`channel:${channelId}`);
        console.log(`User ${userId} joined channel ${channelId}`);
      });
      
      // Leave channel room
      socket.on('leave_channel', (channelId: string) => {
        socket.leave(`channel:${channelId}`);
        console.log(`User ${userId} left channel ${channelId}`);
      });
      
      // Handle new message
      socket.on('new_message', async (message: any, callback: Function) => {
        try {
          const { channelId, serverId, content, authorId } = message;
          
          // Validate required fields
          if (!channelId || !serverId || !content || !authorId) {
            socket.emit('error', { message: 'Missing required fields' });
            if (callback) callback({ error: 'Missing required fields' });
            return;
          }
          
          // Create new message in database
          const newMessage = {
            id: crypto.randomUUID(),
            content,
            authorId,
            channelId,
            serverId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...(message.replyToId && { replyToId: message.replyToId }),
            ...(message.mentions && { mentions: message.mentions }),
            ...(message.attachments && { attachments: message.attachments })
          };
          
          await db.collection('messages').insertOne(newMessage);
          
          // Get author information
          const author = await db.collection('users').findOne({ id: authorId });
          
          const messageWithAuthor = {
            ...newMessage,
            author: {
              id: author?.id,
              name: author?.name,
              discriminator: author?.discriminator,
              avatarUrl: author?.avatarUrl
            }
          };
          
          // Emit to all clients in the channel
          io.to(`channel:${channelId}`).emit('message', messageWithAuthor);
          
          if (callback) callback({ success: true, message: messageWithAuthor });
        } catch (error) {
          console.error('Error handling new message:', error);
          socket.emit('error', { message: 'Failed to process message' });
          if (callback) callback({ error: 'Failed to process message' });
        }
      });
      
      // Handle message update
      socket.on('update_message', async (data: any) => {
        try {
          const { messageId, content, authorId } = data;
          
          // Validate required fields
          if (!messageId || !content || !authorId) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }
          
          // Find the message
          const message = await db.collection('messages').findOne({ id: messageId });
          
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }
          
          // Check if user is the author
          if (message.authorId !== authorId) {
            socket.emit('error', { message: 'Unauthorized to edit this message' });
            return;
          }
          
          // Update the message
          await db.collection('messages').updateOne(
            { id: messageId },
            { $set: { content, updatedAt: new Date(), isEdited: true } }
          );
          
          // Get updated message with author info
          const updatedMessage = await db.collection('messages').findOne({ id: messageId });
          const author = await db.collection('users').findOne({ id: authorId });
          
          const messageWithAuthor = {
            ...updatedMessage,
            author: {
              id: author?.id,
              name: author?.name,
              discriminator: author?.discriminator,
              avatarUrl: author?.avatarUrl
            }
          };
          
          // Emit to all clients in the channel
          io.to(`channel:${message.channelId}`).emit('message_update', messageWithAuthor);
        } catch (error) {
          console.error('Error updating message:', error);
          socket.emit('error', { message: 'Failed to update message' });
        }
      });
      
      // Handle typing indicator
      socket.on('typing', (data: { channelId: string, isTyping: boolean }) => {
        const { channelId, isTyping } = data;
        if (!channelId) return;
        
        socket.to(`channel:${channelId}`).emit('typing', {
          channelId,
          userId,
          isTyping
        });
      });
      
      // Handle reaction
      socket.on('reaction', async (data: any) => {
        try {
          const { messageId, emoji, channelId, type } = data;
          if (!messageId || !emoji || !channelId || !type) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }
          
          // Find the message
          const message = await db.collection('messages').findOne({ id: messageId });
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }
          
          // Update reactions in database
          if (type === 'add') {
            // Check if reaction exists
            const reactionExists = await db.collection('messages').findOne({
              id: messageId,
              'reactions.emoji': emoji
            });
            
            if (!reactionExists) {
              // Create new reaction
              await db.collection('messages').updateOne(
                { id: messageId },
                { $push: { reactions: { emoji, userIds: [userId] } } } as any
              );
            } else {
              // Add user to existing reaction
              await db.collection('messages').updateOne(
                { id: messageId, 'reactions.emoji': emoji },
                { $addToSet: { 'reactions.$.userIds': userId } } as any
              );
            }
          } else if (type === 'remove') {
            // Remove user from reaction
            await db.collection('messages').updateOne(
              { id: messageId, 'reactions.emoji': emoji },
              { $pull: { 'reactions.$.userIds': userId } } as any
            );
            
            // Clean up empty reactions
            await db.collection('messages').updateOne(
              { id: messageId },
              { $pull: { reactions: { userIds: { $size: 0 } } } } as any
            );
          }
          
          // Broadcast to channel
          io.to(`channel:${channelId}`).emit('reaction', {
            messageId,
            userId,
            emoji,
            channelId,
            type
          });
        } catch (error) {
          console.error('Error handling reaction:', error);
          socket.emit('error', { message: 'Failed to process reaction' });
        }
      });
      
      // Handle delete message
      socket.on('delete_message', async (data: any) => {
        try {
          const { messageId, authorId, channelId } = data;
          
          if (!messageId || !authorId || !channelId) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }
          
          // Find the message
          const message = await db.collection('messages').findOne({ id: messageId });
          if (!message) {
            socket.emit('error', { message: 'Message not found' });
            return;
          }
          
          // Check permissions (author or server owner)
          if (message.authorId !== authorId) {
            const server = await db.collection('servers').findOne({ id: message.serverId });
            if (server?.ownerId !== authorId) {
              socket.emit('error', { message: 'Unauthorized to delete this message' });
              return;
            }
          }
          
          // Delete the message
          await db.collection('messages').deleteOne({ id: messageId });
          
          // Emit to channel
          io.to(`channel:${channelId}`).emit('message_delete', {
            id: messageId,
            channelId
          });
        } catch (error) {
          console.error('Error deleting message:', error);
          socket.emit('error', { message: 'Failed to delete message' });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
      });
    });

    // Store io instance on server
    res.socket.server.io = io;
  }
  
  res.end();
} 