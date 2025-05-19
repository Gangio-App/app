import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hasRequiredPermissions } from '@/lib/permissions';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const { serverId, memberId } = params;
    const { roleId, action, userId } = await req.json();
    
    if (!serverId || !memberId || !roleId || !userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json({ error: 'Invalid action. Must be "add" or "remove"' }, { status: 400 });
    }
    
    // Check if user has permission to manage roles
    const hasPermission = await hasRequiredPermissions(userId, serverId, ['MANAGE_ROLES', 'ADMINISTRATOR']);
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to manage roles' }, { status: 403 });
    }
    
    const db = await connectToDatabase();
    
    // Check if role exists for this server
    const role = await db.collection('roles').findOne({
      id: roleId,
      serverId
    });
    
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    
    // Check if member exists for this server
    const member = await db.collection('serverMembers').findOne({
      userId: memberId,
      serverId
    });
    
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    // Get current roles
    const currentRoles = member.roleIds || [];
    
    // Check if member is server owner - don't allow modifying owner's roles
    const server = await db.collection('servers').findOne({ id: serverId });
    if (server?.ownerId === memberId) {
      return NextResponse.json({ error: 'Cannot modify server owner\'s roles' }, { status: 403 });
    }
    
    // Don't allow removing default role
    if (action === 'remove' && role.isDefault) {
      return NextResponse.json({ error: 'Cannot remove default role' }, { status: 400 });
    }
    
    // Update roles
    let updatedRoles: string[];
    if (action === 'add') {
      // Only add if not already present
      if (!currentRoles.includes(roleId)) {
        updatedRoles = [...currentRoles, roleId];
      } else {
        updatedRoles = currentRoles;
      }
    } else {
      // Remove role
      updatedRoles = currentRoles.filter((id: string) => id !== roleId);
    }
    
    // Update member in database
    await db.collection('serverMembers').updateOne(
      { userId: memberId, serverId },
      { $set: { roleIds: updatedRoles, updatedAt: new Date() } }
    );
    
    // Get user details to return with response
    const user = await db.collection('users').findOne({ id: memberId });
    
    return NextResponse.json({
      success: true,
      message: `Role ${action === 'add' ? 'added to' : 'removed from'} member successfully`,
      member: {
        userId: memberId,
        serverId,
        roles: updatedRoles,
        name: user?.name,
        discriminator: user?.discriminator,
        avatarUrl: user?.avatarUrl,
        status: user?.status
      }
    });
  } catch (error: any) {
    console.error('[MEMBER_ROLES]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 