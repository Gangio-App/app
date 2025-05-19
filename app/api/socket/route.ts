import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

// Define the socket server type
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  /* try {
    // Return socket status
    return NextResponse.json({
      status: 'ok',
      socketInitialized: io !== null
    });
  } catch (error) {
    console.error('Socket status error:', error);
    return NextResponse.json(
      { error: 'Failed to get socket status' },
      { status: 500 }
    );
  } */
  return NextResponse.json({ status: 'Socket.IO GET endpoint disabled' });
}

export async function POST(req: NextRequest) {
  /* try {
    // This endpoint is used to initialize the socket server
    // It should be called from the client-side socket context
    
    // Get socket.io server instance
    const res = new NextResponse();
    
    if (!io) {
      console.log('Initializing Socket.IO server...');
      
      // @ts-ignore - NextResponse doesn't have socket property in types
      const httpServer = res.socket?.server;
      
      if (!httpServer) {
        throw new Error('HTTP server not available');
      }
      
      io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_API_URL || '*',
          methods: ['GET', 'POST'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });
      
      // Connect to database
      const client = await clientPromise;
      const db = client.db();
      
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
              id: message.id || uuidv4(),
              content,
              authorId,
              channelId,
              serverId,
              createdAt: new Date(),
              updatedAt: new Date(),
              isEdited: false,
              isPinned: false,
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
            
            // If there's a reply, get the reply message
            if (message.replyToId) {
              const replyMessage = await db.collection('messages').findOne({ id: message.replyToId });
              if (replyMessage) {
                const replyAuthor = await db.collection('users').findOne({ id: replyMessage.authorId });
                messageWithAuthor.replyTo = {
                  ...replyMessage,
                  author: {
                    id: replyAuthor?.id,
                    name: replyAuthor?.name,
                    discriminator: replyAuthor?.discriminator,
                    avatarUrl: replyAuthor?.avatarUrl
                  }
                };
              }
            }
            
            // Emit to all clients in the channel
            if (io) {
              io.to(`channel:${channelId}`).emit('message', messageWithAuthor);
            }
            
            if (callback) callback({ success: true, message: messageWithAuthor });
          } catch (error) {
            console.error('Error handling new message:', error);
            socket.emit('error', { message: 'Failed to process message' });
            if (callback) callback({ error: 'Failed to process message' });
          }
        });
        
        // Handle edit message
        socket.on('edit_message', async (data: any) => {
          try {
            const { messageId, content, authorId, channelId } = data;
            
            if (!messageId || !content || !authorId || !channelId) {
              socket.emit('error', { message: 'Missing required fields' });
              return;
            }
            
            // Find the message
            const message = await db.collection('messages').findOne({ id: messageId });
            if (!message) {
              socket.emit('error', { message: 'Message not found' });
              return;
            }
            
            // Check if the user is the author of the message
            if (message.authorId !== authorId) {
              socket.emit('error', { message: 'You can only edit your own messages' });
              return;
            }
            
            // Update message
            await db.collection('messages').updateOne(
              { id: messageId },
              {
                $set: {
                  content,
                  isEdited: true,
                  updatedAt: new Date()
                }
              }
            );
            
            // Get updated message
            const updatedMessage = await db.collection('messages').findOne({ id: messageId });
            
            // Get author data
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
            if (io) {
              io.to(`channel:${channelId}`).emit('message_update', messageWithAuthor);
            }
          } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('error', { message: 'Failed to edit message' });
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
            
            // Check permissions (author or admin)
            if (message.authorId !== authorId) {
              // Check if user has admin rights
              const member = await db.collection('serverMembers').findOne({
                serverId: message.serverId,
                userId: authorId
              });
              
              if (member) {
                // Check if user has admin role
                const adminRoles = await db.collection('roles').find({
                  id: { $in: member.roleIds || [] },
                  permissions: 'ADMINISTRATOR'
                }).toArray();
                
                if (adminRoles.length === 0) {
                  socket.emit('error', { message: 'You can only delete your own messages or need administrator permissions' });
                  return;
                }
              } else {
                socket.emit('error', { message: 'User is not a member of this server' });
                return;
              }
            }
            
            // Delete message
            await db.collection('messages').deleteOne({ id: messageId });
            
            // Emit to channel
            if (io) {
              io.to(`channel:${channelId}`).emit('message_delete', {
                id: messageId,
                channelId
              });
            }
          } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('error', { message: 'Failed to delete message' });
          }
        });
        
        // Handle typing indicator
        socket.on('typing', (data: any) => {
          const { channelId, user } = data;
          
          if (!channelId || !user) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
          }
          
          // Broadcast to channel except sender
          socket.to(`channel:${channelId}`).emit('typing', {
            userId: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            discriminator: user.discriminator
          });
        });
        
        // Handle reaction
        socket.on('reaction', async (data: any) => {
          try {
            const { messageId, emoji, userId, channelId, type } = data;
            if (!messageId || !emoji || !userId || !channelId || !type) {
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
                  { $push: { reactions: { emoji, userIds: [userId] } } as any }
                );
              } else {
                // Add user to existing reaction
                await db.collection('messages').updateOne(
                  { id: messageId, 'reactions.emoji': emoji },
                  { $addToSet: { 'reactions.$.userIds': userId } }
                );
              }
            } else if (type === 'remove') {
              // Remove user from reaction
              await db.collection('messages').updateOne(
                { id: messageId, 'reactions.emoji': emoji },
                { $pull: { 'reactions.$.userIds': userId } }
              );
              
              // Clean up empty reactions
              await db.collection('messages').updateOne(
                { id: messageId },
                { $pull: { reactions: { userIds: { $size: 0 } } } as any }
              );
            }
            
            // Get updated message with reactions
            const updatedMessage = await db.collection('messages').findOne({ id: messageId });
            
            // Broadcast to channel
            if (io) {
              io.to(`channel:${channelId}`).emit('reaction', {
                messageId,
                reactions: updatedMessage?.reactions || []
              });
            }
          } catch (error) {
            console.error('Error handling reaction:', error);
            socket.emit('error', { message: 'Failed to process reaction' });
          }
        });
        
        // Handle disconnect
        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected`);
        });
      });
    }
    
    return NextResponse.json({ status: 'ok', initialized: true });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize socket' },
      { status: 500 }
    );
  } */
  return NextResponse.json({ status: 'Socket.IO POST endpoint disabled' });
}
