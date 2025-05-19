import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCollection } from '@/lib/db';

// GET /api/debug/db - Check MongoDB connection
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    const db = await connectToDatabase();
    
    // Test if we can access the collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: { name: string }) => c.name);
    
    // Get count of items in the servers collection
    const serverCount = await db.collection('servers').countDocuments();
    // Get count of serverMembers
    const serverMembersCount = await getCollection(db, 'serverMembers').countDocuments({});
    
    // Use this instead of db.collection('server_members')
    const members = await getCollection(db, 'serverMembers').find({}).toArray();
    
    // Return status and collection information
    return NextResponse.json({
      status: 'success',
      message: 'Connected to MongoDB successfully',
      collections: collectionNames,
      stats: {
        servers: serverCount,
        members: serverMembersCount
      },
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 