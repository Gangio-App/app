import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

// GET /api/servers/:serverId/members - Get all members of a server with their roles and user info
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[Server Members API] Getting members for server: ${serverId}`);
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    
    if (!server) {
      console.log(`[Server Members API] Server not found: ${serverId}`);
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    // If userId is provided, just check if they're a member or the owner
    if (userId) {
      // Check if user is the owner
      const isOwner = server.ownerId === userId;
      
      if (isOwner) {
        return NextResponse.json({
          isMember: true,
          isOwner: true
        });
      }
      
      // Check if user is a member
      const member = await getCollection(db, 'serverMembers').findOne({
        serverId,
        userId
      });
      
      return NextResponse.json({
        isMember: !!member,
        isOwner: false
      });
    }
    
    // Get all server members
    console.log(`[Server Members API] Fetching all members for server: ${serverId}`);
    const serverMembers = await getCollection(db, 'serverMembers')
      .find({ serverId })
      .toArray();
    
    console.log(`[Server Members API] Found ${serverMembers.length} members`);
    
    if (serverMembers.length === 0) {
      return NextResponse.json({ members: [] });
    }
    
    // Get user IDs from server members
    const userIds = serverMembers.map((member: { userId: string }) => member.userId);
    
    // Get role IDs from server members
    const allRoleIds = serverMembers.flatMap((member: { roleIds?: string[] }) => member.roleIds || []);
    const uniqueRoleIds = Array.from(new Set(allRoleIds));
    
    // Get roles data
    console.log(`[Server Members API] Fetching ${uniqueRoleIds.length} roles`);
    let roles = [];
    if (uniqueRoleIds.length > 0) {
      roles = await getCollection(db, 'roles')
        .find({ id: { $in: uniqueRoleIds } })
        .sort({ position: -1 })
        .toArray();
    }
    
    // Get users data
    console.log(`[Server Members API] Fetching ${userIds.length} users`);
    const users = await getCollection(db, 'users')
      .find({ id: { $in: userIds } })
      .toArray();
    
    // Combine member data with user and role information
    const membersWithDetails = serverMembers.map((member: any) => {
      const user = users.find((u: any) => u.id === member.userId);
      const memberRoles = roles.filter((role: any) => 
        member.roleIds?.includes(role.id)
      );
      
      if (!user) return null;
      
      // Remove sensitive data
      const { passwordHash, ...safeUserData } = user;
      
      return {
        ...member,
        user: {
          ...safeUserData
        },
        roles: memberRoles
      };
    }).filter(Boolean);
    
    console.log(`[Server Members API] Returning ${membersWithDetails.length} members with details`);
    
    // Format the response to match what the client expects
    return NextResponse.json({ members: membersWithDetails });
  } catch (error) {
    console.error('Error fetching server members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/servers/:serverId/members - Add a new member to the server
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    const { userId, roleIds, nickname } = await req.json();
    
    if (!serverId || !userId) {
      return NextResponse.json(
        { error: 'Server ID and user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if user exists
    const user = await getCollection(db, 'users').findOne({ id: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member of the server
    const existingMember = await getCollection(db, 'serverMembers').findOne({
      serverId,
      userId
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this server' },
        { status: 400 }
      );
    }
    
    // Get default role if no roles are specified
    let memberRoleIds = roleIds || [];
    
    if (!memberRoleIds.length) {
      // First try to find the default @everyone role
      let defaultRole = await getCollection(db, 'roles').findOne({
        serverId,
        name: '@everyone'
      });
      
      // If not found, try Member role
      if (!defaultRole) {
        defaultRole = await getCollection(db, 'roles').findOne({
          serverId,
          name: 'Member'
        });
      }
      
      // If still not found, find any role with isDefault: true
      if (!defaultRole) {
        defaultRole = await getCollection(db, 'roles').findOne({
          serverId,
          isDefault: true
        });
      }
      
      if (defaultRole) {
        memberRoleIds = [defaultRole.id];
      }
    }
    
    // Create new server member
    const newMember = {
      userId,
      serverId,
      roleIds: memberRoleIds,
      nickname: nickname || null,
      joinedAt: new Date()
    };
    
    // Add member to server
    const result = await getCollection(db, 'serverMembers').insertOne(newMember);
    
    // Get user data (without password)
    const { passwordHash, ...safeUserData } = user;
    
    // Get role data
    const roles = memberRoleIds.length > 0
      ? await getCollection(db, 'roles')
          .find({ id: { $in: memberRoleIds } })
          .toArray()
      : [];
    
    return NextResponse.json({
      success: true,
      member: {
        ...newMember,
        _id: result.insertedId,
        user: safeUserData,
        roles
      }
    });
  } catch (error) {
    console.error('Error adding server member:', error);
    return NextResponse.json(
      { error: 'Failed to add server member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH /api/servers/:serverId/members - Update a member's roles or nickname
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { userId, roleIds, nickname, currentUserId } = await req.json();
    
    if (!serverId || !userId) {
      return NextResponse.json(
        { error: 'Server ID and user ID are required' },
        { status: 400 }
      );
    }
    
    if (!roleIds && nickname === undefined) {
      return NextResponse.json(
        { error: 'At least one field to update is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check permissions if currentUserId is provided
    if (currentUserId && currentUserId !== server.ownerId) {
      // Check if current user has permissions to manage members
      const currentMember = await getCollection(db, 'serverMembers').findOne({
        serverId,
        userId: currentUserId
      });
      
      if (!currentMember) {
        return NextResponse.json(
          { error: 'You are not a member of this server' },
          { status: 403 }
        );
      }
      
      // Get roles for permission check
      const currentUserRoles = await getCollection(db, 'roles')
        .find({ id: { $in: currentMember.roleIds || [] } })
        .toArray();
      
      const hasPermission = currentUserRoles.some((role: any) => 
        role.permissions?.ADMINISTRATOR || 
        (roleIds && role.permissions?.MANAGE_ROLES) || 
        (nickname !== undefined && role.permissions?.MANAGE_NICKNAMES)
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'You do not have permission to manage members' },
          { status: 403 }
        );
      }
    }
    
    // Check if the member exists
    const member = await getCollection(db, 'serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found in this server' },
        { status: 404 }
      );
    }
    
    // Prepare update object
    const updateData: any = {};
    
    if (roleIds) {
      // Verify that all roles exist in this server
      const roles = await getCollection(db, 'roles')
        .find({ id: { $in: roleIds }, serverId })
        .toArray();
      
      if (roles.length !== roleIds.length) {
        return NextResponse.json(
          { error: 'One or more roles do not exist in this server' },
          { status: 400 }
        );
      }
      
      updateData.roleIds = roleIds;
    }
    
    if (nickname !== undefined) {
      updateData.nickname = nickname || null; // Allow removing nickname by passing empty string or null
    }
    
    // Update the member
    await getCollection(db, 'serverMembers').updateOne(
      { serverId, userId },
      { $set: updateData }
    );
    
    // Get updated member data
    const updatedMember = await getCollection(db, 'serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!updatedMember) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated member data' },
        { status: 500 }
      );
    }
    
    // Get user data
    const user = await getCollection(db, 'users').findOne({ id: userId });
    const safeUserData = user ? (({ passwordHash, ...rest }) => rest)(user) : {};
    
    // Get roles data
    const memberRoles = updatedMember.roleIds?.length
      ? await getCollection(db, 'roles')
          .find({ id: { $in: updatedMember.roleIds } })
          .toArray()
      : [];
    
    return NextResponse.json({
      success: true,
      member: {
        ...updatedMember,
        user: safeUserData,
        roles: memberRoles
      }
    });
  } catch (error) {
    console.error('Error updating server member:', error);
    return NextResponse.json(
      { error: 'Failed to update server member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/servers/:serverId/members - Remove a member from the server
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { userId, currentUserId } = await req.json();
    
    if (!serverId || !userId) {
      return NextResponse.json(
        { error: 'Server ID and user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check permissions if currentUserId is provided and not server owner
    if (currentUserId && currentUserId !== server.ownerId && currentUserId !== userId) {
      // Check if current user has permissions to manage members
      const currentMember = await getCollection(db, 'serverMembers').findOne({
        serverId,
        userId: currentUserId
      });
      
      if (!currentMember) {
        return NextResponse.json(
          { error: 'You are not a member of this server' },
          { status: 403 }
        );
      }
      
      // Get roles for permission check
      const currentUserRoles = await getCollection(db, 'roles')
        .find({ id: { $in: currentMember.roleIds || [] } })
        .toArray();
      
      const hasPermission = currentUserRoles.some((role: any) => 
        role.permissions?.ADMINISTRATOR || role.permissions?.KICK_MEMBERS
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'You do not have permission to remove members' },
          { status: 403 }
        );
      }
    }
    
    // Prevent server owner from being removed
    if (server.ownerId === userId) {
      return NextResponse.json(
        { error: 'Cannot remove the server owner' },
        { status: 400 }
      );
    }
    
    // Check if the member exists
    const member = await getCollection(db, 'serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found in this server' },
        { status: 404 }
      );
    }
    
    // Remove the member from the server
    await getCollection(db, 'serverMembers').deleteOne({
      serverId,
      userId
    });
    
    return NextResponse.json({
      success: true,
      message: 'Member removed from server successfully'
    });
  } catch (error) {
    console.error('Error removing server member:', error);
    return NextResponse.json(
      { error: 'Failed to remove server member', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 