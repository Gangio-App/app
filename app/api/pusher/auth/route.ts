"use server";

import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, getCollection } from '@/lib/db';
import jwt from 'jsonwebtoken';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: NextRequest) {
  console.log('[Pusher Auth] Request received');
  try {
    let currentUserId: string | null = null;
    let userName: string | null = null;
    let userAvatar: string | null = null;
    let authSource: string = '';

    // Try NextAuth session first
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      currentUserId = session.user.id;
      userName = session.user.name || 'User';
      userAvatar = session.user.image || null;
      authSource = 'next-auth';
      console.log(`[Pusher Auth] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      // If no NextAuth session, try Authorization header (Bearer token)
      const authHeader = request.headers.get('Authorization');

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer '
        console.log(`[Pusher Auth] Attempting token authentication with token: '${token}'`);
        
        if (token && process.env.JWT_SECRET) { 
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string; [key: string]: any };
            const jwtUserId = decoded.userId;

            if (jwtUserId) {
              console.log(`[Pusher Auth] JWT decoded. Extracted userId: ${jwtUserId}`);
              // Connect to database to validate the token
              const db = await connectToDatabase();
              const usersCollection = getCollection(db, 'users');
              
              const user = await usersCollection.findOne({ id: jwtUserId }); 
              
              if (user) {
                currentUserId = user.id;
                userName = user.name || 'User';
                userAvatar = user.avatarUrl || user.steamAvatarUrl || null;
                authSource = 'jwt'; 
                console.log(`[Pusher Auth] Authenticated via JWT: ${currentUserId}`);
              } else {
                console.error(`[Pusher Auth] User not found in DB for JWT userId: ${jwtUserId}`);
              }
            } else {
              console.error('[Pusher Auth] userId not found in JWT payload');
            }
          } catch (jwtError: any) {
            console.error('[Pusher Auth] JWT verification/decoding error:', jwtError.message);
            // If JWT verification fails, user remains unauthenticated from token path
          }
        } else if (!process.env.JWT_SECRET) {
            console.error('[Pusher Auth] JWT_SECRET not configured on the server.');
        } else {
            console.log('[Pusher Auth] No token provided in Authorization header after Bearer.');
        }
      }
    }

    if (!currentUserId) {
      console.error('[Pusher Auth] User could not be authenticated');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 403 });
    }

    console.log(`[Pusher Auth] User ${currentUserId} authenticated via ${authSource}`);

    // Pusher client sends data as x-www-form-urlencoded
    const formData = await request.formData();
    const socket_id = formData.get('socket_id') as string;
    const channel_name = formData.get('channel_name') as string;

    if (!socket_id || !channel_name) {
      console.error('[Pusher Auth] Missing socket_id or channel_name from formData');
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    const userId = currentUserId; 
    const userData = { user_id: userId }; // For presence channels, more info can be added to user_info

    console.log(`[Pusher Auth] Authorizing user ${userId} for channel ${channel_name} (socket: ${socket_id})`);

    let authorized = false;
    // Authorization logic based on channel type
    if (channel_name.startsWith('presence-')) {
      // For presence channels, typically all authenticated users are allowed
      // More specific logic can be added if needed (e.g., server membership for presence-server-id)
      authorized = true;
      console.log(`[Pusher Auth] Authorized for presence channel: ${channel_name}`);
    } else if (channel_name.startsWith('private-dm-')) {
      const combinedIds = channel_name.substring('private-dm-'.length);
      if (combinedIds.includes(userId)) {
        authorized = true;
        console.log(`[Pusher Auth] Authorized for DM channel: ${channel_name}. User ${userId} is part of combined IDs: ${combinedIds}`);
      } else {
        console.error(`[Pusher Auth] User ${userId} NOT part of DM channel ${channel_name}. Combined IDs: ${combinedIds}`);
      }
    } else if (channel_name.startsWith('private-text-channel-')) {
      const textChannelId = channel_name.substring('private-text-channel-'.length);
      console.log(`[Pusher Auth] Attempting to authorize for private-text-channel: ${textChannelId}`);
      try {
        // Verify server membership (simplified - in production, check actual membership)
        const db = await connectToDatabase();
        const serverMembersCollection = getCollection(db, 'serverMembers');
        
        const membership = await serverMembersCollection.findOne({
          serverId: textChannelId,
          userId: currentUserId
        });
        
        if (membership) {
          authorized = true;
          console.log(`[Pusher Auth] User ${currentUserId} authorized for server channel ${channel_name}`);
        }
      } catch (error) {
        console.error(`[Pusher Auth] Error checking server membership: ${error}`);
      }
    } else if (channel_name.startsWith('private-')) {
      // For now, authorize all authenticated users for other private channels
      // In production, implement specific authorization logic
      authorized = true;
      console.log(`[Pusher Auth] User ${currentUserId} authorized for private channel ${channel_name}`);
    }

    if (authorized) {
      let authResponse;
      
      if (channel_name.startsWith('presence-')) {
        // For presence channels, include user info
        authResponse = pusher.authorizeChannel(socket_id, channel_name, {
          user_id: currentUserId,
          user_info: {
            name: userName || 'User', // Ensure userName is available from session/DB
            id: currentUserId,
            avatar: userAvatar       // Ensure userAvatar is available
          }
        });
      } else {
        // For private channels
        authResponse = pusher.authorizeChannel(socket_id, channel_name);
      }
      
      return NextResponse.json(authResponse);
    } else {
      console.error(`[Pusher Auth] User ${currentUserId} NOT authorized for channel ${channel_name}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

  } catch (error) {
    console.error('Pusher auth general error:', error);
    return NextResponse.json({ error: 'Pusher authentication failed due to server error.' }, { status: 500 });
  }
}
