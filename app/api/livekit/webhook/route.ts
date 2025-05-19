import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver, WebhookEvent } from 'livekit-server-sdk';
import clientPromise from '@/lib/mongodb';

// Helper function to validate and process webhooks
async function processWebhook(req: NextRequest) {
  // Get the raw body as text
  const rawBody = await req.text();
  
  // Get the authorization header
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return { 
      error: 'Missing Authorization header',
      status: 401 
    };
  }
  
  // Initialize the webhook receiver
  const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );
  
  try {
    // Validate and parse the webhook
    const event = await receiver.receive(rawBody, authHeader);
    return { event };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return { 
      error: 'Failed to validate webhook',
      status: 400 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await processWebhook(req);
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    
    const { event } = result;
    const client = await clientPromise;
    const db = client.db();
    
    // Process different webhook events
    switch (event.event) {
      case 'room_started': {
        console.log('Room started:', event.room);
        
        // You could record this in a room_sessions collection
        if (event.room) {
          await db.collection('room_sessions').insertOne({
            roomName: event.room.name,
            startedAt: new Date(),
            status: 'active'
          });
        }
        break;
      }
      
      case 'room_finished': {
        console.log('Room finished:', event.room);
        
        // Update the room session
        if (event.room) {
          // Check for room properties directly from the event data
          const roomData = event.room as any; // Cast to any to access potential properties
          
          await db.collection('room_sessions').updateOne(
            { roomName: event.room.name, status: 'active' },
            { 
              $set: { 
                status: 'finished',
                endedAt: new Date(),
                // Store duration if available
                duration: roomData && typeof roomData.duration === 'number' ? roomData.duration : undefined
              } 
            }
          );
        }
        break;
      }
      
      case 'participant_joined': {
        if (!event.participant) break;
        
        console.log('Participant joined:', event.participant);
        
        // Update user status if the identity is a user ID
        if (event.participant.identity) {
          await db.collection('users').updateOne(
            { id: event.participant.identity },
            { 
              $set: { 
                status: 'online',
                updatedAt: new Date() 
              } 
            }
          );
        }
        
        // Record the join event
        await db.collection('room_events').insertOne({
          type: 'participant_joined',
          roomName: event.room?.name,
          participantIdentity: event.participant.identity,
          participantName: event.participant.name,
          timestamp: new Date()
        });
        break;
      }
      
      case 'participant_left': {
        if (!event.participant) break;
        
        console.log('Participant left:', event.participant);
        
        // Update user status
        if (event.participant.identity) {
          await db.collection('users').updateOne(
            { id: event.participant.identity },
            { 
              $set: { 
                status: 'online', // Just set to online, they left the room but might still be active in the app
                updatedAt: new Date() 
              } 
            }
          );
        }
        
        // Record the leave event
        await db.collection('room_events').insertOne({
          type: 'participant_left',
          roomName: event.room?.name,
          participantIdentity: event.participant.identity,
          participantName: event.participant.name,
          timestamp: new Date()
        });
        break;
      }
      
      // You can add more cases for other events you want to handle
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 