import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs if needed
import clientPromise from '../../../lib/mongodb'; // Added for DB access
import { ObjectId } from 'mongodb'; // Added for DB types if needed

// Initialize Pusher (ensure your .env variables are set)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Define interfaces for expected payloads
interface NewMessagePayload {
  channelId: string;
  serverId: string;
  currentUserId: string; 
  author: { 
    id: string; // This should match currentUserId
    name: string;
    avatarUrl?: string;
    roleColor?: string;
  };
  content: string;
  replyToMessageId?: string | null;
  attachments?: any[]; 
  mentions?: string[];
  clientTempId?: string; 
  timestamp: number; // client-generated timestamp
  gifDetails?: { 
    id: string;
    title: string;
    previewUrl: string;
    url: string; 
    width: number;
    height: number;
  };
}

// Minimal Message interface for DB insertion
interface DbMessage {
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
  replyToId?: string | null;
  gifDetails?: NewMessagePayload['gifDetails'];
  // _id will be added by MongoDB automatically
}

interface DeleteMessagePayload {
  messageId: string;
  channelId: string;
  serverId: string; 
  currentUserId: string; 
}

interface EditMessagePayload {
  messageId: string;
  newContent: string;
  channelId: string;
  serverId: string;
  currentUserId: string;
}

interface ChatEventRequest {
  eventType: 'new_message' | 'edit_message' | 'delete_message' | 'new_reaction' | 'user_typing'; 
  payload: NewMessagePayload | DeleteMessagePayload | EditMessagePayload | any; 
  pusherSocketId?: string; 
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatEventRequest;
    const { eventType, payload, pusherSocketId } = body;

    // TODO: Add user authentication/authorization here based on currentUserId in payload
    // This is crucial for security, ensuring the user is allowed to perform the action.

    switch (eventType) {
      case 'new_message':
        const messagePayload = payload as NewMessagePayload;
        
        if (!messagePayload.channelId || !messagePayload.currentUserId || !messagePayload.author || (!messagePayload.content?.trim() && !messagePayload.gifDetails && (!messagePayload.attachments || messagePayload.attachments.length === 0))) {
            return NextResponse.json({ message: 'Invalid message payload: Missing required fields.' }, { status: 400 });
        }

        // --- Start: Database Save Logic ---
        const client = await clientPromise;
        const db = client.db();

        const now = new Date();
        const newMessageId = uuidv4(); // Generate a new UUID for the message

        const dbMessage: DbMessage = {
          id: newMessageId,
          content: messagePayload.content,
          authorId: messagePayload.currentUserId, // Ensure authorId is the sender
          channelId: messagePayload.channelId,
          serverId: messagePayload.serverId,
          createdAt: now,
          updatedAt: now,
          isEdited: false,
          isPinned: false,
          attachments: messagePayload.attachments || [],
          mentions: messagePayload.mentions || [],
          replyToId: messagePayload.replyToMessageId || undefined,
          gifDetails: messagePayload.gifDetails || undefined,
        };

        try {
          await db.collection('messages').insertOne(dbMessage);
          console.log('[Chat Events API] Message saved to DB with ID:', newMessageId);
        } catch (dbError: any) {
          console.error('[Chat Events API] Error saving message to DB:', dbError);
          return NextResponse.json({ message: 'Failed to save message to database.', error: dbError.message || 'Unknown DB error' }, { status: 500 });
        }
        // --- End: Database Save Logic ---

        // Prepare data for Pusher, ensuring it uses the DB-generated ID and consistent timestamps
        const dataForPusher = {
          ...messagePayload, // Spread original payload which includes author object, clientTempId etc.
          id: newMessageId, // Use the new ID generated for the database
          authorId: messagePayload.currentUserId, // Ensure this is set correctly
          createdAt: now.toISOString(), // Use the server-generated timestamp
          updatedAt: now.toISOString(), // Use the server-generated timestamp
          // clientTempId is still useful for the client to match optimistic message
        };

        const channelName = messagePayload.serverId === 'direct-messages'
          ? `private-dm-${messagePayload.channelId}`
          : `private-text-channel-${messagePayload.channelId}`;
        
        try {
          // Log the payload being sent to Pusher
          console.log(`[Chat Events API] Triggering ${eventType} on channel:`, channelName, 'with payload:', JSON.stringify(dataForPusher, null, 2));
          
          const pusherResponse = await pusher.trigger(
            channelName,
            eventType, // Use dynamic eventType 'new_message'
            dataForPusher,
            { socket_id: pusherSocketId }
          );
          
          // Detailed logging for pusherResponse
          console.log('[Chat Events API] Type of pusherResponse:', typeof pusherResponse, ', Is Array:', Array.isArray(pusherResponse));
          if (pusherResponse) {
            console.log('[Chat Events API] pusherResponse object keys:', Object.keys(pusherResponse));
          }
          console.log('[Chat Events API] Raw Pusher trigger response (JSON.stringify):', JSON.stringify(pusherResponse, null, 2));

          let responseStatus;
          let responseBodyText = "Could not read body or body not applicable";

          // Check if pusherResponse is defined and has properties before accessing them
          if (pusherResponse && typeof pusherResponse.status === 'number') {
            responseStatus = pusherResponse.status;
            // Assuming pusherResponse might be a Response-like object from `fetch` used internally by Pusher SDK or a custom wrapper
            // Check if text() method exists before calling
            if (typeof (pusherResponse as any).text === 'function') {
              try {
                responseBodyText = await (pusherResponse as any).text();
              } catch (textError) {
                console.warn('[Chat Events API] Error reading pusherResponse body text:', textError);
                responseBodyText = "Error reading response body";
              }
            }
          }

          // Return the saved message data (dbMessage) along with Pusher status
          // The client will use this full message object to update its state.
          return NextResponse.json({
            message: 'Message processed and sent via Pusher',
            data: { // Send the data that was actually saved and used for Pusher
              ...dataForPusher, // This now includes the DB ID, server timestamps, and original author object
              _id: (dbMessage as any)._id?.toString(), // if MongoDB ObjectId is added, convert to string
            },
            pusherApiResponseStatus: responseStatus,
            pusherApiResponseBody: responseBodyText
          }, { status: 200 });

        } catch (pusherError: any) {
          console.error('[Chat Events API] Error triggering Pusher for new_message:', pusherError);
          // Log more details from the error if available
          if (pusherError.status) console.error('[Chat Events API] Pusher error status:', pusherError.status);
          if (pusherError.message) console.error('[Chat Events API] Pusher error message:', pusherError.message);
          if (pusherError.body) console.error('[Chat Events API] Pusher error body:', pusherError.body);
          return NextResponse.json({ message: 'Failed to send new_message via Pusher.', error: pusherError.message || 'Unknown Pusher error' }, { status: 500 });
        }

      case 'delete_message':
        const deletePayload = payload as DeleteMessagePayload;

        if (!deletePayload.messageId || !deletePayload.channelId || !deletePayload.serverId || !deletePayload.currentUserId) {
          return NextResponse.json({ message: 'Invalid delete_message payload.' }, { status: 400 });
        }

        // Basic permission check (example: only currentUserId can delete)
        // In a real app, you'd check if the currentUserId is the author of the messageId OR has mod/admin rights.
        // Since we don't have message data stored here, this check is simplified or deferred to clients.

        const deleteChannelName = deletePayload.serverId === 'direct-messages'
          ? `private-dm-${deletePayload.channelId}`
          : `private-text-channel-${deletePayload.channelId}`;

        const pusherDeletePayload = {
            messageId: deletePayload.messageId,
            channelId: deletePayload.channelId,
            serverId: deletePayload.serverId,
            // currentUserId: deletePayload.currentUserId, // Optional: if clients need to know who initiated
        };

        try {
          // Log the payload being sent to Pusher
          console.log(`[Chat Events API] Triggering ${eventType} on channel:`, deleteChannelName, 'with payload:', JSON.stringify(pusherDeletePayload, null, 2));

          const pusherResponse = await pusher.trigger(
            deleteChannelName,
            eventType, // Use dynamic eventType 'message_deleted'
            pusherDeletePayload,
            { socket_id: pusherSocketId }
          );

          // Detailed logging for pusherResponse (similar to 'new_message')
          console.log('[Chat Events API] Type of pusherResponse (delete):', typeof pusherResponse, ', Is Array:', Array.isArray(pusherResponse));
          if (pusherResponse) {
            console.log('[Chat Events API] pusherResponse object keys (delete):', Object.keys(pusherResponse));
          }
          console.log('[Chat Events API] Raw Pusher trigger response (JSON.stringify) (delete):', JSON.stringify(pusherResponse, null, 2));
          
          let responseStatus;
          let responseBodyText = "Could not read body or body not applicable";
          if (pusherResponse && typeof pusherResponse.status === 'number') {
            responseStatus = pusherResponse.status;
            if (typeof pusherResponse.text === 'function') responseBodyText = await pusherResponse.text();
          }

          return NextResponse.json({ 
            message: 'Delete instruction processed server-side', 
            data: pusherDeletePayload, 
            pusherApiResponseStatus: responseStatus,
            pusherApiResponseBody: responseBodyText
          }, { status: 200 });
        } catch (pusherError: any) {
          console.error('[Chat Events API] Error triggering Pusher for delete_message:', pusherError);
          if (pusherError.status) console.error('[Chat Events API] Pusher error status:', pusherError.status);
          if (pusherError.message) console.error('[Chat Events API] Pusher error message:', pusherError.message);
          if (pusherError.body) console.error('[Chat Events API] Pusher error body:', pusherError.body);
          return NextResponse.json({ message: 'Failed to send delete instruction via Pusher.', error: pusherError.message || 'Unknown Pusher error' }, { status: 500 });
        }

      case 'edit_message':
        const editPayload = payload as EditMessagePayload;

        if (!editPayload.messageId || !editPayload.newContent?.trim() || !editPayload.channelId || !editPayload.serverId || !editPayload.currentUserId) {
          return NextResponse.json({ message: 'Invalid edit_message payload.' }, { status: 400 });
        }

        // Basic permission check (example: only currentUserId can edit)
        // Similar to delete, real app needs robust checks. This API is now stateless regarding message authorship.

        const editChannelName = editPayload.serverId === 'direct-messages'
            ? `private-dm-${editPayload.channelId}`
            : `private-text-channel-${editPayload.channelId}`;
          
        const pusherEditPayload = {
            messageId: editPayload.messageId,
            channelId: editPayload.channelId,
            serverId: editPayload.serverId,
            content: editPayload.newContent,
            isEdited: true,
            updatedAt: new Date().toISOString(),
            // authorId: editPayload.currentUserId, // Client should preserve original author, server confirms editor
        };

        try {
          // Log the payload being sent to Pusher
          console.log(`[Chat Events API] Triggering ${eventType} on channel:`, editChannelName, 'with payload:', JSON.stringify(pusherEditPayload, null, 2));

          const pusherResponse = await pusher.trigger(
            editChannelName,
            eventType, // Use dynamic eventType 'message_edited'
            pusherEditPayload, 
            { socket_id: pusherSocketId } 
          );

          // Detailed logging for pusherResponse (similar to 'new_message')
          console.log('[Chat Events API] Type of pusherResponse (edit):', typeof pusherResponse, ', Is Array:', Array.isArray(pusherResponse));
          if (pusherResponse) {
            console.log('[Chat Events API] pusherResponse object keys (edit):', Object.keys(pusherResponse));
          }
          console.log('[Chat Events API] Raw Pusher trigger response (JSON.stringify) (edit):', JSON.stringify(pusherResponse, null, 2));

          let responseStatus;
          let responseBodyText = "Could not read body or body not applicable";
          if (pusherResponse && typeof pusherResponse.status === 'number') {
            responseStatus = pusherResponse.status;
            if (typeof pusherResponse.text === 'function') responseBodyText = await pusherResponse.text();
          }

          return NextResponse.json({ 
            message: 'Edit instruction processed server-side', 
            data: pusherEditPayload, 
            pusherApiResponseStatus: responseStatus,
            pusherApiResponseBody: responseBodyText
          }, { status: 200 });
        } catch (pusherError: any) {
          console.error('[Chat Events API] Error triggering Pusher for edit_message:', pusherError);
          if (pusherError.status) console.error('[Chat Events API] Pusher error status:', pusherError.status);
          if (pusherError.message) console.error('[Chat Events API] Pusher error message:', pusherError.message);
          if (pusherError.body) console.error('[Chat Events API] Pusher error body:', pusherError.body);
          return NextResponse.json({ message: 'Failed to send edit instruction via Pusher.', error: pusherError.message || 'Unknown Pusher error' }, { status: 500 });
        }

      default:
        return NextResponse.json({ message: 'Invalid event type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing chat event:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Check if the error is due to JSON parsing, which might happen if request body is not valid JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json({ message: 'Invalid JSON in request body.', error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to process chat event', error: errorMessage }, { status: 500 });
  }
}
