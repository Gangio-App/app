import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const messageId = params.messageId;
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }
    
    const { userId, emoji, type } = await req.json();
    
    if (!userId || !emoji) {
      return NextResponse.json(
        { error: 'User ID and emoji are required' },
        { status: 400 }
      );
    }
    
    // Validate reaction type is either 'add' or 'remove'
    if (type !== 'add' && type !== 'remove') {
      return NextResponse.json(
        { error: 'Type must be either "add" or "remove"' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Find the message
    const message = await db.collection('messages').findOne({ id: messageId });
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    // Initialize reactions array if it doesn't exist
    if (!message.reactions) {
      message.reactions = [];
    }
    
    // Handle reaction based on type
    if (type === 'add') {
      // Check if the emoji already exists in reactions
      const existingReaction = message.reactions.find((r: any) => r.emoji === emoji);
      
      if (existingReaction) {
        // Add user to existing reaction if not already there
        if (!existingReaction.userIds.includes(userId)) {
          await db.collection('messages').updateOne(
            { id: messageId, 'reactions.emoji': emoji },
            { $addToSet: { 'reactions.$.userIds': userId } }
          );
        }
      } else {
        // Add new reaction
        await db.collection('messages').updateOne(
          { id: messageId },
          { 
            $push: { 
              reactions: { 
                emoji, 
                userIds: [userId] 
              } 
            } 
          } as any
        );
      }
    } else {
      // Remove user from reaction
      await db.collection('messages').updateOne(
        { id: messageId, 'reactions.emoji': emoji },
        { $pull: { 'reactions.$.userIds': userId } }
      );
      
      // Remove empty reactions
      await db.collection('messages').updateOne(
        { id: messageId },
        { $pull: { reactions: { userIds: { $size: 0 } } } } as any
      );
    }
    
    // Get updated message
    const updatedMessage = await db.collection('messages').findOne({ id: messageId });
    
    return NextResponse.json({
      success: true,
      message: updatedMessage
    });
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
} 