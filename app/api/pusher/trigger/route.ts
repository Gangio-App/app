import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getCollection } from '@/lib/db';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  console.log('[Pusher Trigger] Request received');
  try {
    let currentUserId: string | null = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      currentUserId = session.user.id;
      console.log(`[Pusher Trigger] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log(`[Pusher Trigger] Attempting token authentication with token: '${token}'`);
        if (token && process.env.JWT_SECRET) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string; [key: string]: any };
            const jwtUserId = decoded.userId;
            if (jwtUserId) {
              currentUserId = jwtUserId; // No DB lookup needed if just using ID for trigger source
              console.log(`[Pusher Trigger] Authenticated via JWT. UserID: ${currentUserId}`);
            } else {
              console.error('[Pusher Trigger] userId not found in JWT payload');
            }
          } catch (jwtError: any) {
            console.error('[Pusher Trigger] JWT verification/decoding error:', jwtError.message);
          }
        } else if (!process.env.JWT_SECRET) {
          console.error('[Pusher Trigger] JWT_SECRET not configured.');
        } else {
          console.log('[Pusher Trigger] No token provided after Bearer.');
        }
      }
    }

    if (!currentUserId) {
      console.error('[Pusher Trigger] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { channel, event, data } = body;

    const channelNameForAuth = channel;
    const eventNameForTrigger = event;

    if (!channelNameForAuth || !eventNameForTrigger || data === undefined) {
      console.error(`[Pusher Trigger] Missing channel, event, or data in request body. Received: channel='${channel}', event='${event}'`);
      return NextResponse.json({ error: 'Missing channel, event, or data' }, { status: 400 });
    }

    // Add sender's ID to data if not already present, to avoid self-triggering if needed client-side
    const eventData = { ...data, senderId: currentUserId };

    console.log(`[Pusher Trigger] Triggering event '${eventNameForTrigger}' on channel '${channelNameForAuth}' for user ${currentUserId}`);

    // Validate that the user is authorized to trigger events on this channel
    let authorized = false;
    console.log(`[Pusher Trigger] Checking authorization for user ${currentUserId} on channel ${channelNameForAuth}`);

    if (channelNameForAuth.startsWith('private-dm-')) {
      const combinedIds = channelNameForAuth.substring('private-dm-'.length);
      console.log(`[Pusher Trigger - DM Auth] Checking DM. Channel's combined IDs: '${combinedIds}', UserID: '${currentUserId!}'`);
      if (currentUserId && combinedIds.includes(currentUserId)) { // Explicitly check currentUserId is not null
        authorized = true;
        console.log(`[Pusher Trigger - DM Auth] User IS part of combined IDs. Authorized.`);
      } else {
        console.error(`[Pusher Trigger - DM Auth] User IS NOT part of combined IDs. Not authorized. currentUserId is null? ${!currentUserId}. combinedIds.includes? ${currentUserId ? combinedIds.includes(currentUserId) : 'N/A (userId null)'}`);
      }
    } else if (channelNameForAuth.startsWith('private-user-')) {
      // For user-specific channels, only allow the user to send events to their own channel
      const channelUserId = channelNameForAuth.replace('private-user-', '');
      if (channelUserId === currentUserId) {
        authorized = true;
        console.log(`[Pusher Trigger] User ${currentUserId} authorized for user channel ${channelNameForAuth}`);
      }
    } else if (channelNameForAuth.startsWith('presence-')) {
      // For presence channels, allow if authenticated
      authorized = true;
      console.log(`[Pusher Trigger] User ${currentUserId} authorized for presence channel ${channelNameForAuth}`);
    } else if (channelNameForAuth.startsWith('private-text-channel-')) {
      // For private text channels, verify channel membership
      // This would require channel membership lookup in a production app
      const textChannelId = channelNameForAuth.substring('private-text-channel-'.length);
      console.log(`[Pusher Trigger] Attempting to authorize for private-text-channel: ${textChannelId}`);
      authorized = true; // Simplified for now
      console.log(`[Pusher Trigger] User ${currentUserId} authorized for text channel ${channelNameForAuth}`);
    }

    if (!authorized) {
      console.error(`[Pusher Trigger] User ${currentUserId} not authorized to send events to channel ${channelNameForAuth}`);
      return NextResponse.json({ error: 'Not authorized to send events to this channel' }, { status: 403 });
    }

    await pusher.trigger(channelNameForAuth, eventNameForTrigger, eventData);

    return NextResponse.json({ message: 'Event triggered successfully' });

  } catch (error: any) {
    console.error('[Pusher Trigger] Error:', error.message);
    if (error.message.includes('Unexpected token') || error.message.includes('JSON at position')) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to trigger event' }, { status: 500 });
  }
}
