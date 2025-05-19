import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    
    if (!code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    
    // Find server with the invite code
    const server = await getCollection(db, 'servers').findOne({ inviteCode: code });
    
    if (!server) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }
    
    // Get member count (optional)
    const memberCount = await getCollection(db, 'serverMembers').countDocuments({ serverId: server.id });
    
    // Return safe server details
    return NextResponse.json({
      server: {
        id: server.id,
        name: server.name,
        icon: server.icon,
        memberCount,
        ownerId: server.ownerId
      }
    });
  } catch (error) {
    console.error('Error fetching server from invite code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server details' },
      { status: 500 }
    );
  }
} 
 