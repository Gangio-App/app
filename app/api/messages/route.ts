import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, WithId, Document } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getPusherClient, getPrivateChannelName, cleanupPusher } from '@/lib/pusher-client';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

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
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isPinned: boolean;
  attachments: any[];
  mentions: string[];
  replyToId?: string;
  replyTo?: Message;
  reactions?: any[];
  gifDetails?: Gif;
  _id?: ObjectId;
}

interface User {
  id: string;
  name: string;
  discriminator: string;
  avatarUrl?: string;
  _id?: ObjectId;
  [key: string]: any;
}

// GET handler to fetch messages for a channel with optional pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const serverId = searchParams.get('serverId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Timestamp for pagination
    
    console.log(`GET /api/messages - channelId: ${channelId}, serverId: ${serverId}`);
    
    if (!channelId || !serverId) {
      return NextResponse.json(
        { error: 'Channel ID and Server ID are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Build query
    const query: any = { channelId, serverId };
    
    // Add pagination if 'before' timestamp is provided
    if (before) {
      query.createdAt = { $lt: new Date(parseInt(before)) };
    }
    
    // Ensure we have an index on channelId and serverId for better performance
    try {
      await db.collection('messages').createIndex({ channelId: 1, serverId: 1, createdAt: -1 });
    } catch (indexError) {
      console.warn('Could not create index on messages collection:', indexError);
      // Continue even if index creation fails
    }
    
    // Fetch messages with pagination, sorted by creation time
    const messages: WithId<Document>[] = await db.collection('messages')
      .find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .toArray();
    
    console.log(`Found ${messages.length} messages in database`);

    // ---- START DIAGNOSTIC LOG ----
    if (messages.length > 0) {
      console.log('Sample authorIds from messages:', messages.slice(0, 3).map(msg => msg.authorId));
    }
    // ---- END DIAGNOSTIC LOG ----
    
    if (messages.length === 0) {
      // Return empty array early if no messages found
      return NextResponse.json([]);
    }
    
    // Fetch authors for messages
    const authorIds = Array.from(new Set(messages.map((message) => message.authorId as string)));
    
    const authors: WithId<Document>[] = await db.collection('users')
      .find({ id: { $in: authorIds } })
      .toArray();
    
    console.log(`Found ${authors.length} authors for messages`);
    
    // Create a lookup map for authors, casting author to User
    const authorMap = authors.reduce((map: Record<string, User>, authorDoc: WithId<Document>) => {
      const author = authorDoc as User;
      map[author.id] = author;
      return map;
    }, {});
    
    // Enrich messages with author data, casting message to Message
    const enrichedMessages = messages.map((messageDoc: WithId<Document>) => {
      const message = messageDoc as unknown as Message;
      const authorData = authorMap[message.authorId as string];
      
      // Convert MongoDB ObjectId to string if present
      const messageObj = {
        ...message,
        _id: message._id ? message._id.toString() : undefined,
        // Ensure dates are properly serialized
        createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
        updatedAt: message.updatedAt instanceof Date ? message.updatedAt.toISOString() : message.updatedAt,
        author: authorData || { // Provide a default author object if not found
          id: message.authorId, // Use the original authorId
          name: 'Unknown User',   // Default name
          discriminator: '0000', // Default discriminator
          avatarUrl: '',         // Default avatar URL or a placeholder
        },
        // Ensure attachments are arrays
        attachments: Array.isArray(message.attachments) ? message.attachments : [],
        reactions: Array.isArray(message.reactions) ? message.reactions : [],
      };
      
      return messageObj;
    });
    
    // Check for reply message IDs and fetch those messages
    const replyIds = enrichedMessages
      .filter((msg) => msg.replyToId)
      .map((msg) => msg.replyToId as string);
    
    if (replyIds.length > 0) {
      const replyMessagesDocs: WithId<Document>[] = await db.collection('messages')
        .find({ id: { $in: replyIds } })
        .toArray();
      
      console.log(`Found ${replyMessagesDocs.length} reply messages`);
      
      // Enrich reply messages with author data
      const enrichedReplyMessages = replyMessagesDocs.map((replyDoc: WithId<Document>) => {
        const message = replyDoc as unknown as Message;
        return {
          ...message,
          _id: message._id ? message._id.toString() : undefined,
          createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
          updatedAt: message.updatedAt instanceof Date ? message.updatedAt.toISOString() : message.updatedAt,
          author: authorMap[message.authorId] || { 
            id: message.authorId,
            name: 'Unknown User',
            discriminator: '0000'
          }
        };
      });
        
      // Create a lookup map for reply messages
      const replyMap = enrichedReplyMessages.reduce((map: Record<string, any>, message: any) => {
        if (message.id) {
          map[message.id] = message;
        }
        return map;
      }, {});
      
      // Add reply messages to their parent messages
      enrichedMessages.forEach((message: any) => {
        if (message.replyToId && replyMap[message.replyToId]) {
          message.replyTo = replyMap[message.replyToId];
        }
      });
    }
    
    // Sort in reverse order to display oldest first (for the client)
    return NextResponse.json(enrichedMessages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST handler to create a new message
export async function POST(req: NextRequest) {
  console.log('[Messages API - POST] Request received');
  try {
    let currentUserId: string | null = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      currentUserId = session.user.id;
      console.log(`[Messages API - POST] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log(`[Messages API - POST] Attempting token authentication with token: '${token}'`);
        if (token && process.env.JWT_SECRET) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string; [key: string]: any };
            const jwtUserId = decoded.userId;
            if (jwtUserId) {
              currentUserId = jwtUserId;
              console.log(`[Messages API - POST] Authenticated via JWT. UserID: ${currentUserId}`);
            } else {
              console.error('[Messages API - POST] userId not found in JWT payload');
            }
          } catch (jwtError: any) {
            console.error('[Messages API - POST] JWT verification/decoding error:', jwtError.message);
          }
        } else if (!process.env.JWT_SECRET) {
          console.error('[Messages API - POST] JWT_SECRET not configured.');
        } else {
          console.log('[Messages API - POST] No token provided after Bearer.');
        }
      }
    }

    if (!currentUserId) {
      console.error('[Messages API - POST] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messageData = await req.json();
    console.log('[Messages API - POST] Received messageData from client:', JSON.stringify(messageData, null, 2));

    const {
      content,
      channelId,         // For server/text channel messages
      serverId,          // For server/text channel messages
      receiverId,        // For direct messages
      replyToId,         // For replies
      mentions,          // For mentions
      attachments,       // For attachments
      gifDetails,        // For GIFs
      clientTempId,      // Optional: client can send a temp ID to match response
      pusherSocketId     // Optional: client can send its Pusher socket_id to avoid self-trigger
    } = messageData;

    if (!content) {
      console.error(`[Messages API - POST] Missing content. Authenticated User: ${currentUserId}`);
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let messageType: 'direct' | 'channel' | 'unknown' = 'unknown';
    let dbOperationSuccessful = false; // Placeholder for DB operation status
    let savedMessageData: any = { content, authorId: currentUserId, timestamp: new Date() }; // Placeholder

    if (receiverId) {
      // This is a Direct Message
      if (channelId || serverId) {
        console.warn(`[Messages API - POST] DM received for user ${receiverId} but also got channelId '${channelId}' and/or serverId '${serverId}'. Ignoring channel/server specifics for DM.`);
      }
      messageType = 'direct';
      console.log(`[Messages API - POST] Processing Direct Message from ${currentUserId} to ${receiverId}.`);
      
      const db = await connectToDatabase();
      const directMessagesCollection = getCollection(db, 'directMessages');

      const newMessageDocument = {
        id: uuidv4(), // Generate a unique ID for the message
        senderId: currentUserId,
        receiverId: receiverId,
        content: content,
        timestamp: new Date(),
        read: false, // Default to unread
        type: messageData.type || 'text', // Use provided type or default to 'text'
        attachments: attachments || [],
        mentions: mentions || [],
        replyToId: replyToId,
        gifDetails: gifDetails,
        reactions: [], // Initialize empty reactions array
      };

      const result = await directMessagesCollection.insertOne(newMessageDocument);

      if (result.insertedId) {
        dbOperationSuccessful = true;
        savedMessageData = { ...newMessageDocument, _id: result.insertedId }; 
        // Ensure savedMessageData has all necessary fields for Pusher payload
        // and matches the client-side Message interface as much as possible.
        // The client expects 'authorId' for sender, so let's align that if it's different from 'senderId'.
        // However, our Message interface on client uses senderId, so this is fine.
      } else {
        console.error('[Messages API - POST] Failed to insert direct message into DB.');
      }

    } else if (channelId && serverId) {
      // This is a Server/Text Channel Message
      messageType = 'channel';
      console.log(`[Messages API - POST] Processing Channel Message from ${currentUserId} to channel ${channelId} in server ${serverId}.`);
      // TODO: Implement DB logic for saving channel message
      // Example:
      // savedMessageData.channelId = channelId;
      // savedMessageData.serverId = serverId;
      // const result = await db.collection('channelMessages').insertOne({ ...savedMessageData });
      // if (result.insertedId) { dbOperationSuccessful = true; savedMessageData.id = result.insertedId.toString(); }
      dbOperationSuccessful = true; // Simulate success for now
      savedMessageData.channelId = channelId; // For placeholder response
      savedMessageData.serverId = serverId;   // For placeholder response
      savedMessageData.id = clientTempId || new Date().getTime().toString(); // Simulate ID generation

    } else {
      console.error(`[Messages API - POST] Invalid payload: Must provide EITHER 'receiverId' (for DMs) OR BOTH 'channelId' AND 'serverId' (for channel messages). Payload:`, messageData);
      return NextResponse.json(
        { error: "Invalid message payload: Provide 'receiverId' (for DMs) OR 'channelId' AND 'serverId' (for channel messages)." },
        { status: 400 }
      );
    }

    if (!dbOperationSuccessful) {
      console.error('[Messages API - POST] Failed to save message to database.');
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Pusher trigger logic
    if (dbOperationSuccessful && savedMessageData) {
      let targetChannelForPusher: string | null = null;
      const eventName = 'new_message'; // Consistent with client

      if (messageType === 'direct' && currentUserId && receiverId) {
        targetChannelForPusher = getPrivateChannelName(currentUserId, receiverId);
      } else if (messageType === 'channel' && channelId) {
        // For channel messages, the channel ID itself is often used, or a prefixed version
        // Example: targetChannelForPusher = `presence-channel-${channelId}` or `private-server-${serverId}-channel-${channelId}`;
        // This needs to align with how your client subscribes to channel messages.
        // For now, let's assume a simple model for channel messages if needed later.
        // console.log('[Messages API - POST] Pusher trigger for channel messages not fully implemented yet.');
      }

      if (targetChannelForPusher) {
        try {
          console.log(`[Messages API - POST] Triggering Pusher event '${eventName}' on channel '${targetChannelForPusher}'`);
          await pusher.trigger(targetChannelForPusher, eventName, savedMessageData, { socket_id: pusherSocketId });
          console.log('[Messages API - POST] Pusher event triggered successfully.');
        } catch (pusherError) {
          console.error('[Messages API - POST] Pusher trigger error:', pusherError);
          // Decide if this should be a hard fail or just a logged error
        }
      }
    }

    console.log('[Messages API - POST] Message processed and event triggered, returning 201.');
    return NextResponse.json({ 
      message: 'Message processed successfully (simulated)', 
      data: savedMessageData, 
      clientTempId 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages/:messageId - Edit a message
export async function PATCH(request: NextRequest) {
  console.log('[Messages API - PATCH] Request received');
  try {
    // Determine user from session or token
    let currentUserId: string | null = null;
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      currentUserId = session.user.id;
      console.log(`[Messages API - PATCH] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      // If no NextAuth session, try Authorization header (Bearer token)
      const authHeader = request.headers.get('Authorization');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer '
        console.log(`[Messages API - PATCH] Attempting token authentication with token: '${token}'`);
        
        if (token && process.env.JWT_SECRET) { // Check for JWT_SECRET
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string; [key: string]: any };
            const jwtUserId = decoded.userId;

            if (jwtUserId) {
              // currentUserId = jwtUserId; // Already assigned if logic requires DB check
              console.log(`[Messages API - PATCH] JWT decoded. Extracted userId: ${jwtUserId}`);
              // Perform DB lookup if needed to confirm user exists, or trust JWT if sufficient
              const db = await connectToDatabase(); 
              const usersCollection = getCollection(db, 'users'); 
              const user = await usersCollection.findOne({ id: jwtUserId });
              
              if (user) {
                currentUserId = user.id; // Assign if user confirmed in DB
                console.log(`[Messages API - PATCH] Authenticated and user confirmed via JWT: ${currentUserId}`);
              } else {
                console.error(`[Messages API - PATCH] User not found in DB for JWT userId: ${jwtUserId}`);
                // currentUserId remains null, will lead to 401
              }
            } else {
              console.error('[Messages API - PATCH] userId not found in JWT payload');
            }
          } catch (jwtError: any) {
            console.error('[Messages API - PATCH] JWT verification/decoding error:', jwtError.message);
            // currentUserId remains null
          }
        } else if (!process.env.JWT_SECRET) {
            console.error('[Messages API - PATCH] JWT_SECRET not configured on the server.');
        } else {
            console.log('[Messages API - PATCH] No token provided in Authorization header after Bearer.');
        }
      }
    }
    
    if (!currentUserId) {
      console.error('[Messages API - PATCH] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { messageId, content } = await request.json(); // Removed authorId from destructuring
    
    if (!messageId || !content) { // Removed authorId from check
      console.error(`[Messages API - PATCH] Missing required fields. MessageId: ${messageId}, Content: ${content}, Authenticated User: ${currentUserId}`);
      return NextResponse.json(
        { error: 'Message ID and content are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if message exists
    const message = await db.collection('messages').findOne({ id: messageId });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the author of the message
    if (message.authorId !== currentUserId) { // Use authenticated currentUserId for check
      console.warn(`[Messages API - PATCH] Forbidden. User ${currentUserId} trying to edit message ${messageId} owned by ${message.authorId}`);
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }
    
    // Update message
    await db.collection('messages').updateOne(
      { id: messageId },
      {
        $set: {
          content,
          edited: true,
          updatedAt: new Date()
        }
      }
    );
    
    // Get updated message
    const updatedMessage = await db.collection('messages').findOne({ id: messageId });
    
    // Get author data
    const author = await db.collection('users').findOne({ id: currentUserId });
    
    if (author) {
      const { passwordHash, ...authorData } = author;
      return NextResponse.json({
        ...updatedMessage,
        author: authorData
      });
    }
    
    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/:messageId - Delete a message
export async function DELETE(req: NextRequest) {
  try {
    const { messageId, authorId } = await req.json();
    
    if (!messageId || !authorId) {
      return NextResponse.json(
        { error: 'Message ID and author ID are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if message exists
    const message = await db.collection('messages').findOne({ id: messageId });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the author of the message
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
          return NextResponse.json(
            { error: 'You can only delete your own messages or need administrator permissions' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'User is not a member of this server' },
          { status: 403 }
        );
      }
    }
    
    // Delete message
    await db.collection('messages').deleteOne({ id: messageId });
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
} 