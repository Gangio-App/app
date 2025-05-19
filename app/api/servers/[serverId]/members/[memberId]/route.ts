import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/db';

// GET /api/servers/:serverId/members/:memberId - Get a specific member
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const serverId = params.serverId;
    const memberId = params.memberId;
    
    if (!serverId || !memberId) {
      return NextResponse.json(
        { error: 'Server ID and Member ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get the member
    const member = await db.collection('serverMembers').findOne({ 
      serverId,
      userId: memberId 
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Get user data (without sensitive info)
    const user = await db.collection('users').findOne({ id: memberId });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get member's roles
    const roles = member.roleIds 
      ? await db.collection('roles')
          .find({ id: { $in: member.roleIds }, serverId })
          .toArray()
      : [];
    
    // Remove sensitive data from user
    const { passwordHash, ...safeUserData } = user;
    
    return NextResponse.json({ 
      success: true, 
      member: {
        ...member,
        user: safeUserData,
        roles
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch member' },
      { status: 500 }
    );
  }
}

// PATCH /api/servers/:serverId/members/:memberId - Update a member's roles or nickname
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const serverId = params.serverId;
    const memberId = params.memberId;
    const { nickname, roleIds, currentUserId } = await req.json();
    
    if (!serverId || !memberId || !currentUserId) {
      return NextResponse.json(
        { error: 'Server ID, Member ID, and current user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if member exists
    const member = await db.collection('serverMembers').findOne({ 
      serverId,
      userId: memberId 
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (server.ownerId !== currentUserId) {
      // If not server owner, check permissions
      const currentMember = await db.collection('serverMembers').findOne({
        serverId,
        userId: currentUserId
      });
      
      if (!currentMember) {
        return NextResponse.json(
          { success: false, error: 'You are not a member of this server' },
          { status: 403 }
        );
      }
      
      // Get current user's roles
      const currentUserRoles = await db.collection('roles').find({
        id: { $in: currentMember.roleIds || [] },
        serverId
      }).toArray();
      
      // Check if current user has permission to manage roles or members
      const hasPermission = currentUserRoles.some((role: { permissions: { ADMINISTRATOR: any; MANAGE_ROLES: any; MANAGE_NICKNAMES: any; }; }) => 
        role.permissions?.ADMINISTRATOR || 
        (roleIds && role.permissions?.MANAGE_ROLES) || 
        (nickname && role.permissions?.MANAGE_NICKNAMES)
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to manage members' },
          { status: 403 }
        );
      }
      
      // Cannot modify server owner
      if (memberId === server.ownerId) {
        return NextResponse.json(
          { success: false, error: 'Cannot modify server owner' },
          { status: 403 }
        );
      }
      
      // If updating roles, check if current user has higher position than the highest role they're trying to assign
      if (roleIds) {
        // Get the roles being assigned
        const assigningRoles = await db.collection('roles').find({
          id: { $in: roleIds },
          serverId
        }).toArray();
        
        // Get the highest role position of the current user
        const currentUserHighestRole = currentUserRoles.reduce((highest: any, r: any) => 
          (r.position || 0) > (highest.position || 0) ? r : highest, 
          { position: 0 }
        );
        
        // Check if any role being assigned has a position higher than or equal to current user's highest role
        const assigningHigherRole = assigningRoles.some((role: { position: any; }) => 
          (role.position || 0) >= (currentUserHighestRole.position || 0)
        );
        
        if (assigningHigherRole) {
          return NextResponse.json(
            { success: false, error: 'You cannot assign roles higher than or equal to your highest role' },
            { status: 403 }
          );
        }
      }
    }
    
    // Update member
    const updateData: any = {};
    
    if (nickname !== undefined) {
      updateData.nickname = nickname || null; // Allow removing nickname by passing null
    }
    
    if (roleIds) {
      // Make sure to include the default role
      const defaultRole = await db.collection('roles').findOne({
        serverId,
        isDefault: true
      });
      
      if (defaultRole && !roleIds.includes(defaultRole.id)) {
        roleIds.push(defaultRole.id);
      }
      
      updateData.roleIds = roleIds;
    }
    
    // Only update if there's something to update
    if (Object.keys(updateData).length > 0) {
      await db.collection('serverMembers').updateOne(
        { serverId, userId: memberId },
        { $set: updateData }
      );
    }
    
    // Get the updated member data
    const updatedMember = await db.collection('serverMembers').findOne({ 
      serverId,
      userId: memberId 
    });
    
    // Get user data
    const user = await db.collection('users').findOne({ id: memberId });
    
    // Get updated roles
    const roles = updatedMember?.roleIds 
      ? await db.collection('roles')
          .find({ id: { $in: updatedMember.roleIds }, serverId })
          .toArray()
      : [];
    
    // Remove sensitive data from user
    const { passwordHash, ...safeUserData } = user && 'passwordHash' in user ? user : { passwordHash: undefined };
    
    return NextResponse.json({
      success: true,
      member: {
        ...updatedMember,
        user: safeUserData,
        roles
      }
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/servers/:serverId/members/:memberId - Remove a member from a server (kick)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; memberId: string } }
) {
  try {
    const serverId = params.serverId;
    const memberId = params.memberId;
    const { userId } = await req.json();
    
    if (!serverId || !memberId || !userId) {
      return NextResponse.json(
        { error: 'Server ID, Member ID, and current user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if member exists
    const member = await db.collection('serverMembers').findOne({ 
      serverId,
      userId: memberId 
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (userId !== server.ownerId && userId !== memberId) {
      // If not server owner or self-leave, check permissions
      const currentMember = await db.collection('serverMembers').findOne({
        serverId,
        userId
      });
      
      if (!currentMember) {
        return NextResponse.json(
          { success: false, error: 'You are not a member of this server' },
          { status: 403 }
        );
      }
      
      // Get current user's roles
      const currentUserRoles = await db.collection('roles').find({
        id: { $in: currentMember.roleIds || [] },
        serverId
      }).toArray();
      
      // Check if current user has permission to kick members
      const hasPermission = currentUserRoles.some((role: { permissions: { ADMINISTRATOR: any; KICK_MEMBERS: any; }; }) => 
        role.permissions?.ADMINISTRATOR || role.permissions?.KICK_MEMBERS
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to kick members' },
          { status: 403 }
        );
      }
      
      // Cannot kick server owner
      if (memberId === server.ownerId) {
        return NextResponse.json(
          { success: false, error: 'Cannot kick the server owner' },
          { status: 403 }
        );
      }
      
      // Cannot kick a member with higher role
      const memberRoles = await db.collection('roles').find({
        id: { $in: member.roleIds || [] },
        serverId
      }).toArray();
      
      const userHighestPosition = Math.max(0, ...currentUserRoles.map((r: { position: any; }) => r.position || 0));
      const memberHighestPosition = Math.max(0, ...memberRoles.map((r: { position: any; }) => r.position || 0));
      
      if (memberHighestPosition >= userHighestPosition) {
        return NextResponse.json(
          { success: false, error: 'Cannot kick a member with equal or higher role position' },
          { status: 403 }
        );
      }
    }
    
    // Remove member from server
    await db.collection('serverMembers').deleteOne({
      serverId,
      userId: memberId
    });
    
    return NextResponse.json({
      success: true,
      message: 'Member has been removed from the server'
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
} 