import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hasRequiredPermissions } from '@/lib/permissions';

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!serverId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user has permission to view bans
    const hasPermission = await hasRequiredPermissions(userId, serverId, ['BAN_MEMBERS', 'ADMINISTRATOR']);
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to view bans' }, { status: 403 });
    }
    
    const db = await connectToDatabase();
    
    // Get all bans for the server
    const bans = await db.collection('bans')
      .find({ serverId })
      .toArray();
    
    // Get the user details for each banned user
    const bannedUsers = await Promise.all(
      bans.map(async (ban) => {
        const user = await db.collection('users').findOne(
          { _id: ban.userId },
          { projection: { name: 1, image: 1, discriminator: 1 } }
        );
        
        return {
          ...ban,
          user: user || { name: 'Unknown User' }
        };
      })
    );
    
    return NextResponse.json(bannedUsers);
    
  } catch (error: any) {
    console.error('[GET_SERVER_BANS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 