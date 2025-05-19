import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { hasRequiredPermissions } from '@/lib/permissions';

interface RolePosition {
  id: string;
  position: number;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { roles, userId } = await req.json();
    
    if (!serverId || !userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user has permission to manage roles
    const hasPermission = await hasRequiredPermissions(userId, serverId, ['MANAGE_ROLES', 'ADMINISTRATOR']);
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to manage roles' }, { status: 403 });
    }
    
    const db = await connectToDatabase();
    
    // Validate role IDs
    const existingRoles = await db.collection('roles')
      .find({ serverId })
      .toArray();
    
    const existingRoleIds = existingRoles.map(role => role.id);
    const allValidRoleIds = roles.every((role: RolePosition) => 
      existingRoleIds.includes(role.id)
    );
    
    if (!allValidRoleIds) {
      return NextResponse.json({ error: 'One or more role IDs are invalid' }, { status: 400 });
    }
    
    // Update role positions one by one (MongoDB doesn't have transactions like Prisma)
    for (const role of roles) {
      await db.collection('roles').updateOne(
        { id: role.id, serverId },
        { $set: { position: role.position, updatedAt: new Date() } }
      );
    }
    
    // Fetch updated roles
    const updatedRoles = await db.collection('roles')
      .find({ serverId })
      .sort({ position: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true,
      message: 'Role positions updated successfully',
      roles: updatedRoles 
    });
  } catch (error: any) {
    console.error('[ROLES_REORDER]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 