import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  isPinned: boolean;
  replyToId?: string;
  replyTo?: any;
  reactions?: any[];
  attachments?: any[];
  [key: string]: any;
}

// GET a specific message by ID
export async function GET(
  request: NextRequest,
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
    
    // Get the author information
    const author = await db.collection('users').findOne({ id: message.authorId });
    
    // Construct the response object according to the Message type
    const response: Message = {
      id: message.id, // Ensure all fields from Message interface are included
      content: message.content,
      authorId: message.authorId,
      channelId: message.channelId,
      serverId: message.serverId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      isEdited: message.isEdited,
      isPinned: message.isPinned,
      replyToId: message.replyToId, // Optional field
      reactions: message.reactions, // Assuming reactions is part of the Message type
      attachments: message.attachments, // Assuming attachments is part of the Message type
      author: author ? {
        id: author.id,
        name: author.name,
        discriminator: author.discriminator,
        avatarUrl: author.avatarUrl
      } : {
        id: message.authorId,
        name: 'Unknown User',
        discriminator: '0000'
      }
    };
    
    // If message is a reply, fetch the original message
    if (message.replyToId) {
      const originalMessage = await db.collection('messages').findOne({ id: message.replyToId });
      
      if (originalMessage) {
        // Get the original message author
        const originalAuthor = await db.collection('users').findOne({ id: originalMessage.authorId });
        
        response.replyTo = {
          ...originalMessage,
          author: originalAuthor ? {
            id: originalAuthor.id,
            name: originalAuthor.name,
            discriminator: originalAuthor.discriminator,
            avatarUrl: originalAuthor.avatarUrl
          } : {
            id: originalMessage.authorId,
            name: 'Unknown User',
            discriminator: '0000'
          }
        };
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

// PATCH to update a message
export async function PATCH(
  request: NextRequest,
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
    
    const { content, authorId } = await request.json();
    
    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
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
    
    // Verify the author is updating their own message
    if (message.authorId !== authorId) {
      return NextResponse.json(
        { error: 'You can only edit your own messages' },
        { status: 403 }
      );
    }
    
    // Update the message
    await db.collection('messages').updateOne(
      { id: messageId },
      { 
        $set: { 
          content,
          updatedAt: new Date(),
          isEdited: true
        } 
      }
    );
    
    // Get the updated message
    const updatedMessage = await db.collection('messages').findOne({ id: messageId });
    
    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated message' },
        { status: 500 }
      );
    }
    
    // Get author information
    const author = await db.collection('users').findOne({ id: updatedMessage.authorId });
    
    return NextResponse.json({
      ...updatedMessage,
      author: author ? {
        id: author.id,
        name: author.name,
        discriminator: author.discriminator,
        avatarUrl: author.avatarUrl
      } : {
        id: updatedMessage.authorId,
        name: 'Unknown User',
        discriminator: '0000'
      }
    });
    
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE a message
export async function DELETE(
  request: NextRequest,
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
    
    // Get the body for author ID verification
    const { authorId } = await request.json();
    
    if (!authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
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
    
    // Verify the author is deleting their own message
    if (message.authorId !== authorId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }
    
    // Delete the message
    await db.collection('messages').deleteOne({ id: messageId });
    
    return NextResponse.json({
      success: true,
      id: messageId,
      channelId: message.channelId,
      serverId: message.serverId
    });
    
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
} 