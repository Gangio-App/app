import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// GET endpoint to fetch direct messages between current user and another user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('otherUserId');

    if (!otherUserId) {
      return NextResponse.json({ error: 'Missing otherUserId parameter' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Fetch messages sent in either direction between the two users
    const messages = await db.collection('directMessages')
      .find({
        $or: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST endpoint to send a new direct message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const messageData = await request.json();
    
    // Validate messageData
    if (!messageData.content || !messageData.receiverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create complete message object
    const message = {
      id: uuidv4(),
      content: messageData.content,
      senderId: currentUserId,
      receiverId: messageData.receiverId,
      timestamp: new Date(),
      read: false,
      type: messageData.type || 'text',
      mediaUrl: messageData.mediaUrl,
    };

    const db = await connectToDatabase();
    await db.collection('directMessages').insertOne(message);

    // Create a consistent channel name by sorting the user IDs
    const [firstId, secondId] = [currentUserId, messageData.receiverId].sort();
    const channelName = `private-dm-${firstId}-${secondId}`;

    // Trigger a Pusher event to notify about new message
    await pusher.trigger(channelName, 'new_message', message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending direct message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
