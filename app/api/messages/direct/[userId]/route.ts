import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase, getCollection } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Determine user from session or token
    let currentUserId: string | null = null;
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      currentUserId = session.user.id;
      console.log(`[DM API] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      // If no NextAuth session, try Authorization header (Bearer token)
      const authHeader = request.headers.get('Authorization');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer '
        console.log(`[DM API] Attempting token authentication with token: '${token}'`);
        
        if (token && process.env.JWT_SECRET) { 
          try {
            const secretForVerification = process.env.JWT_SECRET;
            if (secretForVerification) {
              console.log(`[DM API] JWT_SECRET loaded, starts with: '${secretForVerification.substring(0, 5)}...'`);
            } else {
              console.error('[DM API] JWT_SECRET is NOT LOADED or is empty!');
            }
            const decoded = jwt.verify(token, secretForVerification) as { userId?: string; [key: string]: any };
            const jwtUserId = decoded.userId;

            if (jwtUserId) {
              console.log(`[DM API] JWT decoded. Extracted userId: ${jwtUserId}`);
              const db = await connectToDatabase();
              const usersCollection = getCollection(db, 'users');
              const user = await usersCollection.findOne({ id: jwtUserId }); 
              
              if (user) {
                currentUserId = user.id;
                console.log(`[DM API] Authenticated via JWT: ${currentUserId}`);
              } else {
                console.error(`[DM API] User not found in DB for JWT userId: ${jwtUserId}`);
              }
            } else {
              console.error('[DM API] userId not found in JWT payload');
            }
          } catch (jwtError: any) {
            console.error('[DM API] JWT verification/decoding error:', jwtError.name, jwtError.message, JSON.stringify(jwtError));
          }
        } else if (!process.env.JWT_SECRET) {
            console.error('[DM API] JWT_SECRET not configured on the server.');
        } else {
            console.log('[DM API] No token provided in Authorization header after Bearer.');
        }
      }
    }
    
    if (!currentUserId) {
      console.error('[DM API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const recipientId = params.userId;
    
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const messagesCollection = getCollection(db, 'directMessages');
    
    // Get messages between the current user and the recipient
    const messages = await messagesCollection
      .find({
        $or: [
          { senderId: currentUserId, receiverId: recipientId },
          { senderId: recipientId, receiverId: currentUserId }
        ]
      })
      .sort({ timestamp: 1 })
      .toArray();
    
    console.log(`[DM API] Found ${messages.length} messages between ${currentUserId} and ${recipientId}`);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('[DM API] Error fetching direct messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
