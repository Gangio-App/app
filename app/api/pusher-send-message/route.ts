import { NextResponse } from 'next/server';
import Pusher from 'pusher';

// Initialize Pusher server instance
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

interface MessagePayload {
  text: string;
  sender: string;
  timestamp: number;
  socketId?: string;
  // Add any other relevant fields from your Message interface in page.tsx
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as MessagePayload;
    const { socketId, ...messageData } = body;

    if (!messageData.text || !messageData.sender || !messageData.timestamp) {
      return NextResponse.json({ message: 'Invalid message payload' }, { status: 400 });
    }

    // Trigger the event on Pusher
    // Channel: 'public-chat-channel'
    // Event: 'new-message-event'
    // The fourth argument (params) can include the socket_id to exclude that client
    await pusher.trigger('public-chat-channel', 'new-message-event', messageData, { socket_id: socketId });

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending message via Pusher:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to send message', error: errorMessage }, { status: 500 });
  }
}
