import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// Permission structure
const DEFAULT_PERMISSIONS = {
  ADMINISTRATOR: false,
  MANAGE_SERVER: false,
  MANAGE_ROLES: false,
  MANAGE_CHANNELS: false,
  MANAGE_INVITES: false,
  KICK_MEMBERS: false,
  BAN_MEMBERS: false,
  CREATE_INVITES: true,
  CHANGE_NICKNAME: true,
  MANAGE_NICKNAMES: false,
  READ_MESSAGES: true,
  SEND_MESSAGES: true,
  MANAGE_MESSAGES: false,
  EMBED_LINKS: true,
  ATTACH_FILES: true,
  READ_MESSAGE_HISTORY: true,
  MENTION_EVERYONE: false,
  USE_VOICE: true,
  SHARE_SCREEN: true,
  PRIORITY_SPEAKER: false,
  MUTE_MEMBERS: false,
  DEAFEN_MEMBERS: false,
  MOVE_MEMBERS: false,
};

// GET /api/servers/:serverId/roles - Get all roles for a server
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    
    if (!serverId) {
      return NextResponse.json(
        { success: false, error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get all roles for the server
    const roles = await db.collection('roles')
      .find({ serverId })
      .sort({ position: 1 })
      .toArray();
    
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/servers/:serverId/roles - Create a new role
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { name, color, permissions, userId } = await req.json();
    
    if (!serverId || !name || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID, role name, and user ID are required' },
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
    
    // Check if user is the server owner or has permission to manage roles
    const isMember = await db.collection('serverMembers').findOne({
      serverId,
      userId,
    });
    
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'You are not a member of this server' },
        { status: 403 }
      );
    }
    
    // Check if user is server owner or has admin permissions
    if (server.ownerId !== userId) {
      const userRoles = await db.collection('roles').find({
        id: { $in: isMember.roleIds || [] },
        serverId
      }).toArray();
      
      const hasPermission = userRoles.some(role => 
        role.permissions?.ADMINISTRATOR || role.permissions?.MANAGE_ROLES
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to manage roles' },
          { status: 403 }
        );
      }
    }
    
    // Get the highest position for roles in this server
    const highestRole = await db.collection('roles')
      .find({ serverId })
      .sort({ position: -1 })
      .limit(1)
      .toArray();
    
    const position = highestRole.length > 0 ? highestRole[0].position + 1 : 1;
    
    // Create the new role
    const roleId = uuidv4();
    const newRole = {
      id: roleId,
      serverId,
      name,
      color: color || '#99AAB5', // Default Discord-like color
      position,
      permissions: permissions || DEFAULT_PERMISSIONS,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('roles').insertOne(newRole);
    
    return NextResponse.json({
      success: true,
      role: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// PATCH /api/servers/:serverId/roles - Update role positions
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { rolePositions, userId } = await req.json();
    
    if (!serverId || !rolePositions || !Array.isArray(rolePositions) || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID, role positions array, and user ID are required' },
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
    
    // Check permissions
    if (server.ownerId !== userId) {
      const member = await db.collection('serverMembers').findOne({
        serverId,
        userId,
      });
      
      if (!member) {
        return NextResponse.json(
          { success: false, error: 'You are not a member of this server' },
          { status: 403 }
        );
      }
      
      const userRoles = await db.collection('roles').find({
        id: { $in: member.roleIds || [] },
        serverId
      }).toArray();
      
      const hasPermission = userRoles.some(role => 
        role.permissions?.ADMINISTRATOR || role.permissions?.MANAGE_ROLES
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to manage roles' },
          { status: 403 }
        );
      }
    }
    
    // Update role positions
    for (const { id, position } of rolePositions) {
      await db.collection('roles').updateOne(
        { id, serverId },
        { $set: { position, updatedAt: new Date() } }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Role positions updated successfully'
    });
  } catch (error) {
    console.error('Error updating role positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role positions' },
      { status: 500 }
    );
  }
} 
 