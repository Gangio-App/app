import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/db';

// GET /api/servers/:serverId/roles/:roleId - Get a specific role
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; roleId: string } }
) {
  try {
    const { serverId, roleId } = params;
    
    if (!serverId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Server ID and role ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Get the role
    const role = await db.collection('roles').findOne({ 
      id: roleId,
      serverId 
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PATCH /api/servers/:serverId/roles/:roleId - Update a role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; roleId: string } }
) {
  try {
    const { serverId, roleId } = params;
    const { name, color, permissions, userId } = await req.json();
    
    if (!serverId || !roleId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID, role ID, and user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if the role exists
    const role = await db.collection('roles').findOne({ 
      id: roleId,
      serverId 
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if this is the default @everyone role
    if (role.isDefault && (name || (permissions && Object.keys(permissions).length > 0))) {
      return NextResponse.json(
        { success: false, error: 'Cannot change name or permissions of the default role' },
        { status: 403 }
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
      
      const hasPermission = userRoles.some(r => 
        r.permissions?.ADMINISTRATOR || r.permissions?.MANAGE_ROLES
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to manage roles' },
          { status: 403 }
        );
      }
      
      // Ensure user is not editing a role with a higher position than their highest role
      const userHighestRole = userRoles.reduce((highest: any, r: any) => 
        (r.position || 0) > (highest.position || 0) ? r : highest, 
        { position: 0 }
      );
      
      if ((role.position || 0) >= (userHighestRole.position || 0)) {
        return NextResponse.json(
          { success: false, error: 'You cannot modify a role positioned higher than or equal to your highest role' },
          { status: 403 }
        );
      }
    }
    
    // Update the role
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (color) updateData.color = color;
    if (permissions && Object.keys(permissions).length > 0) {
      // If updating individual permissions, merge with existing
      if (role.permissions) {
        updateData.permissions = { ...role.permissions, ...permissions };
      } else {
        updateData.permissions = permissions;
      }
    }
    
    await db.collection('roles').updateOne(
      { id: roleId, serverId },
      { $set: updateData }
    );
    
    // Get the updated role
    const updatedRole = await db.collection('roles').findOne({ 
      id: roleId,
      serverId 
    });
    
    return NextResponse.json({
      success: true,
      role: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/servers/:serverId/roles/:roleId - Delete a role
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; roleId: string } }
) {
  try {
    const { serverId, roleId } = params;
    const { userId } = await req.json();
    
    if (!serverId || !roleId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID, role ID, and user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if the role exists
    const role = await db.collection('roles').findOne({ 
      id: roleId,
      serverId 
    });
    
    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }
    
    // Cannot delete default role
    if (role.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the default role' },
        { status: 403 }
      );
    }
    
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
      
      const hasPermission = userRoles.some(r => 
        r.permissions?.ADMINISTRATOR || r.permissions?.MANAGE_ROLES
      );
      
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to manage roles' },
          { status: 403 }
        );
      }
      
      // Ensure user is not deleting a role with a higher position than their highest role
      const userHighestRole = userRoles.reduce((highest: any, r: any) => 
        (r.position || 0) > (highest.position || 0) ? r : highest, 
        { position: 0 }
      );
      
      if ((role.position || 0) >= (userHighestRole.position || 0)) {
        return NextResponse.json(
          { success: false, error: 'You cannot delete a role positioned higher than or equal to your highest role' },
          { status: 403 }
        );
      }
    }
    
    // Delete the role
    await db.collection('roles').deleteOne({ id: roleId, serverId });
    
    // Remove the role from all members who have it
    await db.collection('serverMembers').updateMany(
      { serverId, roleIds: roleId },
      { $pull: { roleIds: roleId as any } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 
 