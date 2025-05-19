import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  status?: string;
  friendIds?: string[];
  [key: string]: any; // For any additional fields
}

interface SafeUser extends Omit<User, 'passwordHash'> {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status?: string;
  friendIds?: string[];
}

// GET endpoint for retrieving a user's friends
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get user
    const user = await db.collection('users').findOne({ id: userId }) as User;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const friendIds = user.friendIds || [];
    
    // Get user details for each friend
    const friends = await db.collection('users')
      .find({ id: { $in: friendIds } })
      .toArray() as User[];
    
    // Remove sensitive information
    const safeFriends = friends.map((friend: User): SafeUser => {
      const { passwordHash, ...safeFriend } = friend;
      return safeFriend;
    });
    
    // Return the array directly instead of an object with a 'friends' property
    return NextResponse.json(safeFriends);
  } catch (error) {
    console.error('Error getting friends:', error);
    return NextResponse.json(
      { error: 'Failed to get friends' },
      { status: 500 }
    );
  }
}

// POST endpoint for accepting friend requests
export async function POST(req: NextRequest) {
  try {
    const { userId, friendId, action } = await req.json();
    
    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'Both user and friend IDs are required' },
        { status: 400 }
      );
    }
    
    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (accept or reject) is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get both users
    const [user, friend] = await Promise.all([
      db.collection('users').findOne({ id: userId }),
      db.collection('users').findOne({ id: friendId })
    ]);
    
    if (!user || !friend) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    // Verify there is an incoming request
    const incomingRequests = user.incomingFriendRequests || [];
    const outgoingRequests = friend.outgoingFriendRequests || [];
    
    if (!incomingRequests.includes(friendId) || !outgoingRequests.includes(userId)) {
      return NextResponse.json(
        { error: 'No pending friend request found' },
        { status: 400 }
      );
    }
    
    // Remove request from both users
    const updates = [
      db.collection('users').updateOne(
        { id: userId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { incomingFriendRequests: friendId } 
        }
      ),
      db.collection('users').updateOne(
        { id: friendId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { outgoingFriendRequests: userId } 
        }
      )
    ];
    
    // If accepting, add as friends
    if (action === 'accept') {
      updates.push(
        db.collection('users').updateOne(
          { id: userId },
          { $addToSet: { friendIds: friendId } }
        ),
        db.collection('users').updateOne(
          { id: friendId },
          { $addToSet: { friendIds: userId } }
        )
      );
    }
    
    await Promise.all(updates);
    
    return NextResponse.json({
      success: true,
      message: action === 'accept' 
        ? 'Friend request accepted' 
        : 'Friend request rejected'
    });
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json(
      { error: 'Failed to handle friend request' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing a friend
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');
    
    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'Both user and friend IDs are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Remove from both users' friend lists
    const updates = await Promise.all([
      db.collection('users').updateOne(
        { id: userId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { friendIds: friendId } 
        } as any
      ),
      db.collection('users').updateOne(
        { id: friendId },
        { 
          $set: { updatedAt: new Date() },
          $pull: { friendIds: userId } 
        } as any
      )
    ]);
    
    if (updates[0].matchedCount === 0 || updates[1].matchedCount === 0) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
} 
 