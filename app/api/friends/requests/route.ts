import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Pusher from 'pusher'; // Import Pusher

// Initialize Pusher (ensure environment variables are set)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  status?: string;
  [key: string]: any; // For any additional fields
}

interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface SafeUser extends Omit<User, 'passwordHash'> {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: string;
}

// POST endpoint for sending a friend request
export async function POST(req: NextRequest) {
  try {
    const { senderId, recipientId } = await req.json();
    
    if (!senderId || !recipientId) {
      return NextResponse.json(
        { error: 'Both sender and recipient IDs are required' },
        { status: 400 }
      );
    }
    
    // Don't allow sending a request to yourself
    if (senderId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot send a friend request to yourself' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get both users
    const [sender, recipient] = await Promise.all([
      db.collection('users').findOne({ id: senderId }),
      db.collection('users').findOne({ id: recipientId })
    ]);
    
    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    // Check if they are already friends
    const senderFriendIds = sender.friendIds || [];
    if (senderFriendIds.includes(recipientId)) {
      return NextResponse.json(
        { error: 'Users are already friends' },
        { status: 400 }
      );
    }
    
    // Check if there's already a pending request
    const senderOutgoingRequests = sender.outgoingFriendRequests || [];
    const recipientIncomingRequests = recipient.incomingFriendRequests || [];
    
    if (senderOutgoingRequests.includes(recipientId) || recipientIncomingRequests.includes(senderId)) {
      return NextResponse.json(
        { error: 'Friend request already sent' },
        { status: 400 }
      );
    }
    
    // Ensure arrays exist before pushing to them
    await Promise.all([
      // Initialize arrays if they don't exist
      db.collection('users').updateOne(
        { id: senderId, outgoingFriendRequests: { $exists: false } },
        { $set: { outgoingFriendRequests: [] } }
      ),
      db.collection('users').updateOne(
        { id: recipientId, incomingFriendRequests: { $exists: false } },
        { $set: { incomingFriendRequests: [] } }
      )
    ]);
    
    console.log(`Sending friend request from ${senderId} to ${recipientId}`);
    
    // Update sender's outgoing requests
    const senderUpdate = await db.collection('users').updateOne(
      { id: senderId },
      { 
        $set: { updatedAt: new Date() },
        $addToSet: { outgoingFriendRequests: recipientId } 
      }
    );
    
    // Update recipient's incoming requests
    const recipientUpdate = await db.collection('users').updateOne(
      { id: recipientId },
      { 
        $set: { updatedAt: new Date() },
        $addToSet: { incomingFriendRequests: senderId } 
      }
    );
    
    // Log the update results
    console.log('Sender update result:', senderUpdate);
    console.log('Recipient update result:', recipientUpdate);
    
    if (senderUpdate.matchedCount === 0 || recipientUpdate.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update users' },
        { status: 500 }
      );
    }

    // Trigger Pusher event for the recipient
    const recipientChannel = `private-user-${recipientId}`;
    const eventName = 'incoming_friend_request';
    const eventData = {
      sender: {
        id: sender.id,
        name: sender.name,
        avatarUrl: sender.avatarUrl,
        discriminator: sender.discriminator
      },
      requestId: `${sender.id}_${recipient.id}` // Or however you uniquely identify requests
    };

    try {
      await pusher.trigger(recipientChannel, eventName, eventData);
      console.log(`Pusher event '${eventName}' triggered on channel '${recipientChannel}' for user ${recipientId}`);
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError);
      // Decide if this should cause the request to fail or just log the error
    }
    
    return NextResponse.json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving a user's friend requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received'; // 'received' or 'sent'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    // Get the user document
    const userDoc = await db.collection('users').findOne({ id: userId });
    
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Log the entire user document for debugging
    console.log(`User document for ${userId}:`, JSON.stringify(userDoc, null, 2));
    
    const user = userDoc as unknown as User;
    
    // Check if the arrays exist in the user document
    if (!user.incomingFriendRequests && type === 'received') {
      console.log(`incomingFriendRequests array doesn't exist for user ${userId}`);
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { incomingFriendRequests: [] } }
      );
    }
    
    if (!user.outgoingFriendRequests && type === 'sent') {
      console.log(`outgoingFriendRequests array doesn't exist for user ${userId}`);
      await db.collection('users').updateOne(
        { id: userId },
        { $set: { outgoingFriendRequests: [] } }
      );
    }
    
    // Get request IDs from user document
    const requestIds = type === 'received' 
      ? (user.incomingFriendRequests || [])
      : (user.outgoingFriendRequests || []);
    
    console.log(`${type} request IDs for user ${userId}:`, requestIds);
    
    // For debugging: check if the arrays are actually arrays
    if (!Array.isArray(requestIds)) {
      console.log(`WARNING: ${type} requests is not an array for user ${userId}:`, requestIds);
      return NextResponse.json({ requests: [] });
    }
    
    if (!requestIds.length) {
      console.log(`No ${type} requests found for user ${userId}`);
      return NextResponse.json({ requests: [] });
    }
    
    console.log(`Found ${requestIds.length} ${type} requests for user ${userId}:`, requestIds);
    
    // Get user details for each request
    const requestUserDocs = await db.collection('users')
      .find({ id: { $in: requestIds } })
      .toArray();
    
    const requestUsers = requestUserDocs as unknown as User[];
    
    console.log(`Found ${requestUsers.length} users for requests:`, requestUsers.map(u => u.id));
    
    // Remove sensitive information
    const safeUsers = requestUsers.map((reqUser: User): SafeUser => {
      const { passwordHash, ...safeUser } = reqUser;
      return safeUser;
    });
    
    // Create request objects
    const requests = requestIds.map((otherId: string) => {
      const otherUser = safeUsers.find(u => u.id === otherId);
      return {
        id: `${userId}_${otherId}`, // Generate a unique ID
        senderId: type === 'received' ? otherId : userId,
        recipientId: type === 'received' ? userId : otherId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: otherUser || { id: otherId, name: 'Unknown User' }
      };
    });
    
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for canceling a friend request
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const senderId = searchParams.get('senderId');
    const recipientId = searchParams.get('recipientId');
    
    if (!senderId || !recipientId) {
      return NextResponse.json(
        { error: 'Both sender and recipient IDs are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get both users
    const [sender, recipient] = await Promise.all([
      db.collection('users').findOne({ id: senderId }),
      db.collection('users').findOne({ id: recipientId })
    ]);
    
    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    // Verify there is a pending request
    const senderOutgoingRequests = sender.outgoingFriendRequests || [];
    const recipientIncomingRequests = recipient.incomingFriendRequests || [];
    
    console.log(`Canceling request from ${senderId} to ${recipientId}`);
    console.log(`Sender's outgoing requests:`, senderOutgoingRequests);
    console.log(`Recipient's incoming requests:`, recipientIncomingRequests);
    
    // Check if the arrays are actually arrays
    if (!Array.isArray(senderOutgoingRequests) || !Array.isArray(recipientIncomingRequests)) {
      console.log(`WARNING: Friend request arrays are not arrays:`, {
        senderOutgoingRequests,
        recipientIncomingRequests
      });
      
      // Fix the arrays if they're not arrays
      if (!Array.isArray(senderOutgoingRequests)) {
        await db.collection('users').updateOne(
          { id: senderId },
          { $set: { outgoingFriendRequests: [] } }
        );
      }
      
      if (!Array.isArray(recipientIncomingRequests)) {
        await db.collection('users').updateOne(
          { id: recipientId },
          { $set: { incomingFriendRequests: [] } }
        );
      }
      
      return NextResponse.json(
        { error: 'Friend request data was corrupted but has been fixed. Please try again.' },
        { status: 400 }
      );
    }
    
    // We'll proceed even if the request isn't found in both places, to clean up any inconsistencies
    
    // Remove request from both users
    const updates = await Promise.all([
      db.collection('users').updateOne(
        { id: senderId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { outgoingFriendRequests: recipientId } 
        } as any
      ),
      db.collection('users').updateOne(
        { id: recipientId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { incomingFriendRequests: senderId } 
        } as any
      )
    ]);
    
    console.log('Friend request cancellation update results:', updates);
    
    if (updates[0].matchedCount === 0 || updates[1].matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update users' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Friend request canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling friend request:', error);
    return NextResponse.json(
      { error: 'Failed to cancel friend request' },
      { status: 500 }
    );
  }
} 

// PATCH endpoint for accepting a friend request
export async function PATCH(req: NextRequest) {
  try {
    const { senderId, recipientId } = await req.json(); // recipientId is the user accepting the request

    if (!senderId || !recipientId) {
      return NextResponse.json(
        { error: 'Both sender (original requester) and recipient (acceptor) IDs are required' },
        { status: 400 }
      );
    }

    if (senderId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot accept a friend request from yourself' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Get both users
    const [sender, recipient] = await Promise.all([
      db.collection('users').findOne({ id: senderId }),
      db.collection('users').findOne({ id: recipientId })
    ]);

    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if the request exists (sender has recipient in outgoing, recipient has sender in incoming)
    const senderOutgoing = sender.outgoingFriendRequests || [];
    const recipientIncoming = recipient.incomingFriendRequests || [];

    if (!senderOutgoing.includes(recipientId) || !recipientIncoming.includes(senderId)) {
      // If already friends, it might be a stale request UI, still proceed to ensure friend status.
      const recipientFriendIds = recipient.friendIds || [];
      if (recipientFriendIds.includes(senderId)) {
          // Already friends, perhaps clean up request arrays if they still exist by mistake
          await db.collection('users').updateOne(
            { id: recipientId },
            { $pull: { incomingFriendRequests: senderId } }
          );
          await db.collection('users').updateOne(
            { id: senderId },
            { $pull: { outgoingFriendRequests: recipientId } }
          );
        return NextResponse.json({ success: true, message: 'Already friends. Request lists cleaned.' });
      }
      return NextResponse.json(
        { error: 'No pending friend request found or users are already friends.' },
        { status: 404 } // Or 400 if considered a bad request
      );
    }

    // Initialize friendIds arrays if they don't exist for both users
    await Promise.all([
        db.collection('users').updateOne(
            { id: senderId, friendIds: { $exists: false } },
            { $set: { friendIds: [] } }
        ),
        db.collection('users').updateOne(
            { id: recipientId, friendIds: { $exists: false } },
            { $set: { friendIds: [] } }
        )
    ]);

    // Perform the acceptance:
    // 1. Remove from outgoing/incoming request lists
    // 2. Add to each other's friendIds list
    const updateOperations = await Promise.all([
      db.collection('users').updateOne(
        { id: senderId },
        {
          $pull: { outgoingFriendRequests: recipientId },
          $addToSet: { friendIds: recipientId },
          $set: { updatedAt: new Date() }
        }
      ),
      db.collection('users').updateOne(
        { id: recipientId },
        {
          $pull: { incomingFriendRequests: senderId },
          $addToSet: { friendIds: senderId },
          $set: { updatedAt: new Date() }
        }
      )
    ]);

    if (updateOperations.some(op => op.matchedCount === 0)) {
      // This might indicate one user was deleted mid-process, or an ID was wrong.
      // Consider if rollback or further cleanup is needed.
      console.error('Failed to update one or both users during friend request acceptance.', updateOperations);
      return NextResponse.json(
        { error: 'Failed to fully process friend request acceptance. Please check user data.' },
        { status: 500 }
      );
    }
    
    // TODO: Consider sending a real-time notification (e.g., via Pusher) to the sender
    // that their friend request was accepted.

    return NextResponse.json({
      success: true,
      message: 'Friend request accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}