import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('[All Servers API] Fetching all servers');
    const db = await connectToDatabase();
    
    // Get all servers from the database
    const servers = await getCollection(db, 'servers').find({}).toArray();
    
    // Ensure we remove any sensitive data
    const safeServers = servers.map((server: any) => {
      // Get member count for each server
      const memberCount = server.memberCount || 0;
      
      // Format createdAt as ISO string if it's a Date object
      const createdAt = server.createdAt instanceof Date 
        ? server.createdAt.toISOString() 
        : server.createdAt;
      
      return {
        id: server.id,
        name: server.name,
        description: server.description || '',
        icon: server.icon,
        memberCount,
        tags: server.tags || [],
        isVerified: server.isVerified || false,
        isPartnered: server.isPartnered || false,
        createdAt
      };
    });
    
    console.log(`[All Servers API] Returning ${safeServers.length} servers`);
    
    return NextResponse.json({
      servers: safeServers
    });
  } catch (error) {
    console.error('[All Servers API] Error fetching all servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
} 