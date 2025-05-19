import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST /api/messages/reactions - Add a reaction to a message
export async function POST(req: NextRequest) {
  try {
    const { messageId, userId, emoji } = await req.json();
    
    if (!messageId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'Message ID, user ID, and emoji are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if message exists
    const message = await db.collection('messages').findOne({ id: messageId });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Check if user is in the server
    const member = await db.collection('serverMembers').findOne({
      serverId: message.serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Add reaction or update existing one
    const result = await db.collection('messages').updateOne(
      { id: messageId, 'reactions.emoji': emoji },
      { $addToSet: { 'reactions.$.userIds': userId } }
    );
    
    // If reaction doesn't exist yet, create it
    if (result.matchedCount === 0) {
      await db.collection('messages').updateOne(
        { id: messageId },
        { 
          $push: { 
            reactions: { 
              $each: [{
                emoji,
                userIds: [userId]
              }]
            } 
          } as any,
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    // Get updated message
    const updatedMessage = await db.collection('messages').findOne({ id: messageId });
    
    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/reactions - Remove a reaction from a message
export async function DELETE(req: NextRequest) {
  try {
    const { messageId, userId, emoji } = await req.json();
    
    if (!messageId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'Message ID, user ID, and emoji are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if message exists
    const message = await db.collection('messages').findOne({ id: messageId });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Remove the user's reaction
    await db.collection('messages').updateOne(
      { id: messageId, 'reactions.emoji': emoji },
      { 
        $pull: { 'reactions.$.userIds': userId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Clean up empty reactions
    await db.collection('messages').updateOne(
      { id: messageId },
      { $pull: { reactions: { userIds: { $size: 0 } } } } as any
    );
    
    // Get updated message
    const updatedMessage = await db.collection('messages').findOne({ id: messageId });
    
    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
} 
 