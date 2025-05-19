import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const db = await connectToDatabase();
    
    // Build query filter
    const filter: any = { isPublic: true };
    
    // Add text search if query is provided
    if (query && query.trim().length > 0) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add category filter if provided
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Get total count for pagination
    const total = await db.collection('servers').countDocuments(filter);
    
    // Get servers matching criteria
    const servers = await db.collection('servers')
      .find(filter)
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 1,
        name: 1,
        description: 1,
        icon: 1,
        banner: 1,
        category: 1,
        tags: 1,
        memberCount: 1,
        inviteCode: 1,
        createdAt: 1,
        ownerId: 1
      })
      .toArray();
    
    // Format response with pagination info
    return NextResponse.json({
      servers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error searching servers:', error);
    return NextResponse.json(
      { error: 'Failed to search servers' },
      { status: 500 }
    );
  }
} 