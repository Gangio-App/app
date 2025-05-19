import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hasRequiredPermissions } from '@/lib/permissions';
import { v4 as uuidv4 } from 'uuid';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const { serverId, memberId } = params;
    const { userId, reason = 'No reason provided' } = await req.json();
    
    if (!serverId || !memberId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user has permission to ban members
    const hasPermission = await hasRequiredPermissions(userId, serverId, ['BAN_MEMBERS', 'ADMINISTRATOR']);
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to ban members' }, { status: 403 });
    }
    
    const db = await connectToDatabase();
    
    // Check if member exists for this server
    const member = await db.collection('serverMembers').findOne({
      userId: memberId,
      serverId
    });
    
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Check if member is server owner - don't allow banning the owner
    const server = await db.collection('servers').findOne({ id: serverId });
    if (server?.ownerId === memberId) {
      return NextResponse.json({ error: 'Cannot ban the server owner' }, { status: 403 });
    }
    
    // Check if the member being banned has a higher role than the user executing the command
    const userMember = await db.collection('serverMembers').findOne({
      userId,
      serverId
    });
    
    if (!userMember) {
      return NextResponse.json({ error: 'You are not a member of this server' }, { status: 403 });
    }
    
    // Get highest role position for both users
    const userRoles = await db.collection('roles').find({
      id: { $in: userMember.roleIds || [] },
      serverId
    }).toArray();
    
    const memberRoles = await db.collection('roles').find({
      id: { $in: member.roleIds || [] },
      serverId
    }).toArray();
    
    const userHighestPosition = Math.max(...userRoles.map(r => r.position || 0), 0);
    const memberHighestPosition = Math.max(...memberRoles.map(r => r.position || 0), 0);
    
    if (memberHighestPosition >= userHighestPosition && userId !== server?.ownerId) {
      return NextResponse.json({ 
        error: 'Cannot ban a member with equal or higher role position' 
      }, { status: 403 });
    }
    
    // Create ban record
    await db.collection('bans').insertOne({
      id: uuidv4(),
      serverId,
      userId: memberId,
      bannedBy: userId,
      reason,
      timestamp: new Date()
    });
    
    // Delete member from server
    await db.collection('serverMembers').deleteOne({
      userId: memberId,
      serverId
    });
    
    return NextResponse.json({
      success: true,
      message: 'Member has been banned from the server'
    });
    
  } catch (error: any) {
    console.error('[BAN_MEMBER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 