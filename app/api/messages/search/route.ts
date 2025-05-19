import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Route segment config
export const dynamic = 'force-dynamic';

// GET /api/messages/search - Search messages
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const serverId = searchParams.get('serverId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user is a member of the server
    const member = await db.collection('serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Get channels the user has access to
    const channels = await db.collection('channels')
      .find({ serverId })
      .project({ id: 1 })
      .toArray();
    
    const channelIds = channels.map(channel => channel.id);
    
    // Search messages by content
    const searchQuery = {
      serverId,
      channelId: { $in: channelIds },
      $or: [
        { content: { $regex: query, $options: 'i' } },
        // Also search mentions if the query starts with @
        ...(query.startsWith('@') 
          ? [{ 'mentions': { $in: [query.substring(1)] } }] 
          : []),
      ]
    };
    
    const totalCount = await db.collection('messages').countDocuments(searchQuery);
    
    const messages = await db.collection('messages')
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    // Get author information for each message
    const authorIds = Array.from(new Set(messages.map(msg => msg.authorId)));
    
    let messagesWithAuthors = messages;
    
    if (authorIds.length) {
      const authors = await db.collection('users')
        .find({ id: { $in: authorIds } })
        .project({ id: 1, name: 1, avatarUrl: 1, discriminator: 1 })
        .toArray();
      
      // Map authors to messages
      messagesWithAuthors = messages.map(msg => {
        const author = authors.find(a => a.id === msg.authorId) || {
          id: msg.authorId,
          name: 'Unknown User',
          discriminator: '0000'
        };
        
        // Remove passwordHash for security
        if (author.passwordHash) {
          delete author.passwordHash;
        }
        
        return {
          ...msg,
          author
        };
      });
    }
    
    return NextResponse.json({
      results: messagesWithAuthors,
      totalCount,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json(
      { error: 'Failed to search messages' },
      { status: 500 }
    );
  }
} 