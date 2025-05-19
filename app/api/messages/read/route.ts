import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST endpoint to mark messages as read
export async function POST(request: NextRequest) {
  try {
    // Determine user from session or token
    let currentUserId: string | null = null;
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    
    if (session?.user?.id) {
      currentUserId = session.user.id;
      console.log(`[Messages Read API] Authenticated via NextAuth: ${currentUserId}`);
    } else {
      // If no NextAuth session, try Authorization header (Bearer token)
      const authHeader = request.headers.get('Authorization');
      
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Remove 'Bearer '
        
        if (token) {
          try {
            // Connect to database to validate the token
            const db = await connectToDatabase();
            const usersCollection = getCollection(db, 'users');
            
            // Find user by token or ID
            const user = await usersCollection.findOne({ id: token });
            
            if (user) {
              currentUserId = user.id;
              console.log(`[Messages Read API] Authenticated via token: ${currentUserId}`);
            } else {
              console.error(`[Messages Read API] User not found for token: ${token}`);
            }
          } catch (dbError) {
            console.error('[Messages Read API] Database error during token validation:', dbError);
          }
        }
      }
    }

    if (!currentUserId) {
      console.error('[Messages Read API] User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { senderId } = await request.json();

    if (!senderId) {
      console.error('[Messages Read API] Missing senderId parameter');
      return NextResponse.json({ error: 'Missing senderId parameter' }, { status: 400 });
    }

    console.log(`[Messages Read API] Marking messages from ${senderId} to ${currentUserId} as read`);
    const db = await connectToDatabase();
    const messagesCollection = getCollection(db, 'directMessages');
    
    // Mark all unread messages from the sender to the current user as read
    const result = await messagesCollection.updateMany(
      { 
        senderId: senderId,
        receiverId: currentUserId,
        read: false
      },
      { $set: { read: true } }
    );

    console.log(`[Messages Read API] Marked ${result.modifiedCount} messages as read`);
    return NextResponse.json({ 
      success: true,
      messagesRead: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
