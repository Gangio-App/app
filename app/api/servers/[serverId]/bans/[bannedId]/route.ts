import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hasRequiredPermissions } from '@/lib/permissions';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; bannedId: string } }
) {
  try {
    const { serverId, bannedId } = params;
    const { userId } = await req.json();
    
    if (!serverId || !bannedId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user has permission to unban members
    const hasPermission = await hasRequiredPermissions(userId, serverId, ['BAN_MEMBERS', 'ADMINISTRATOR']);
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to unban members' }, { status: 403 });
    }
    
    const db = await connectToDatabase();
    
    // Check if ban exists
    const ban = await db.collection('bans').findOne({
      serverId,
      userId: bannedId
    });
    
    if (!ban) {
      return NextResponse.json({ error: 'Ban not found' }, { status: 404 });
    }
    
    // Remove ban record
    await db.collection('bans').deleteOne({
      serverId,
      userId: bannedId
    });
    
    return NextResponse.json({
      success: true,
      message: 'User has been unbanned from the server'
    });
    
  } catch (error: any) {
    console.error('[UNBAN_MEMBER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 