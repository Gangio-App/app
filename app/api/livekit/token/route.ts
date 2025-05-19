import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/livekit/token - Generate a LiveKit token from query parameters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get('roomName');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    
    // Validate required parameters
    if (!roomName || !userId || !userName) {
      return NextResponse.json(
        { error: 'Room name, user ID, and user name are required' },
        { status: 400 }
      );
    }
    
    // Authenticate the user
    let isAuthenticated = false;
    let currentUserId: string | null = null;
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      currentUserId = session.user.id;
      isAuthenticated = true;
      console.log(`[LiveKit Token] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      // If no NextAuth session, try Authorization header (Bearer token)
      const authHeader = req.headers.get('Authorization');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer '
        
        if (token && process.env.JWT_SECRET) {
          try {
            console.log(`[LiveKit Token] Attempting to verify JWT token: ${token.substring(0, 20)}...`);
            console.log(`[LiveKit Token] JWT_SECRET starts with: ${process.env.JWT_SECRET.substring(0, 5)}...`);
            
            // Try to decode the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string; id?: string; [key: string]: any };
            console.log('[LiveKit Token] JWT decoded successfully:', JSON.stringify(decoded, null, 2));
            
            // Check for userId in different possible locations
            currentUserId = decoded.userId || decoded.id || decoded.sub || null;
            
            if (currentUserId) {
              isAuthenticated = true;
              console.log(`[LiveKit Token] Authenticated via JWT: ${currentUserId}`);
            } else {
              console.error('[LiveKit Token] JWT verified but no userId/id/sub found in payload');
            }
          } catch (error) {
            console.error('[LiveKit Token] JWT verification error:', error);
            
            // Try to decode without verification (for debugging)
            try {
              const decodedWithoutVerify = jwt.decode(token);
              console.log('[LiveKit Token] JWT decoded without verification:', JSON.stringify(decodedWithoutVerify, null, 2));
            } catch (e) {
              console.error('[LiveKit Token] Failed to decode JWT even without verification:', e);
            }
          }
        } else {
          console.log('[LiveKit Token] Missing token or JWT_SECRET');
        }
      }
    }
    
    // Ensure the authenticated user matches the requested userId
    if (!isAuthenticated || currentUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    
    // Create token with user's identity
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: userId,
        name: userName,
        ttl: '1h' // Token expires after 1 hour
      }
    );
    
    // Add permissions to join the room
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });
    
    // Generate JWT token
    const token = at.toJwt();
    
    return NextResponse.json({
      token,
      roomName,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

// POST /api/livekit/token - Generate a LiveKit token for a user to join a room
export async function POST(req: NextRequest) {
  try {
    const { userId, channelId } = await req.json();
    
    if (!userId || !channelId) {
      return NextResponse.json(
        { error: 'User ID and channel ID are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Get user data
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get channel data
    const channel = await db.collection('channels').findOne({ id: channelId });
    
    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }
    
    // Check if channel type is voice or video
    if (channel.type !== 'voice' && channel.type !== 'video') {
      return NextResponse.json(
        { error: 'Channel is not a voice or video channel' },
        { status: 400 }
      );
    }
    
    // Check if user is a member of the server
    const serverMember = await db.collection('serverMembers').findOne({
      userId: userId,
      serverId: channel.serverId
    });
    
    if (!serverMember) {
      return NextResponse.json(
        { error: 'User is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Generate a room name based on the channel ID
    const roomName = `channel_${channelId}`;
    
    // Create token with user's identity
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: userId,
        name: user.name,
        ttl: '1h' // Token expires after 1 hour
      }
    );
    
    // Add permissions to join the room
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });
    
    // Generate JWT token
    const token = await at.toJwt();
    
    return NextResponse.json({
      token,
      roomName,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL
    });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 