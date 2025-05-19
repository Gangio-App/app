import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get('currentUserId');
    
    if (!userId || !currentUserId) {
      return NextResponse.json(
        { error: 'Both user IDs are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get both users
    const [user, currentUser] = await Promise.all([
      db.collection('users').findOne({ id: userId }),
      db.collection('users').findOne({ id: currentUserId })
    ]);
    
    if (!user || !currentUser) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }
    
    // Get friend IDs for both users
    const userFriendIds = user.friendIds || [];
    const currentUserFriendIds = currentUser.friendIds || [];
    
    // Find intersection of friend IDs
    const mutualFriendIds = userFriendIds.filter((id: string) => 
      currentUserFriendIds.includes(id)
    );
    
    // Get friend details
    const mutualFriends = await db.collection('users')
      .find({ id: { $in: mutualFriendIds } })
      .toArray();
    
    // Remove sensitive information
    const safeFriends = mutualFriends.map(friend => {
      const { passwordHash, ...safeFriend } = friend;
      return safeFriend;
    });
    
    return NextResponse.json({ friends: safeFriends });
  } catch (error) {
    console.error('Error fetching mutual friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutual friends' },
      { status: 500 }
    );
  }
} 
 