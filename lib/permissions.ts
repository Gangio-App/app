import { connectToDatabase } from './db';
import { Db } from "mongodb";
import { getCollection } from "./db";

/**
 * Checks if a user has the required permissions for a server
 * 
 * @param userId The ID of the user
 * @param serverId The ID of the server
 * @param requiredPermissions Array of permission strings to check
 * @returns Boolean indicating if the user has the required permissions
 */
export async function hasRequiredPermissions(
  userId: string,
  serverId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    
    // First check if user is the server owner (owners have all permissions)
    const server = await db.collection('servers').findOne({ id: serverId });
    if (!server) {
      return false; // Server doesn't exist
    }
    
    if (server.ownerId === userId) {
      return true; // Server owner has all permissions
    }
    
    // If not the owner, check if user is a member of this server
    const member = await db.collection('serverMembers').findOne({
      userId,
      serverId
    });
    
    if (!member) {
      return false; // User is not a member of this server
    }
    
    // If user doesn't have any roles assigned, check if they have any default permissions
    if (!member.roleIds || member.roleIds.length === 0) {
      // Check for default role permissions
      const defaultRole = await db.collection('roles').findOne({
        serverId,
        isDefault: true
      });
      
      if (!defaultRole || !defaultRole.permissions) {
        return false; // No default role or no permissions for default role
      }
      
      // Check if default role has any of the required permissions
      return requiredPermissions.some(permission => 
        defaultRole.permissions[permission] === true ||
        defaultRole.permissions.ADMINISTRATOR === true // Administrator permission grants all
      );
    }
    
    // Get all user roles
    const roles = await db.collection('roles')
      .find({ 
        id: { $in: member.roleIds },
        serverId 
      })
      .toArray();
    
    // Check if any of the roles have the required permissions
    return roles.some(role => 
      requiredPermissions.some(permission => 
        role.permissions?.[permission] === true ||
        role.permissions?.ADMINISTRATOR === true // Administrator permission grants all
      )
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Checks if a user has a specific permission in a server
 * 
 * @param db MongoDB database instance
 * @param serverId The server ID to check permissions in
 * @param userId The user ID to check permissions for
 * @param permission The permission to check for
 * @returns True if the user has the permission, false otherwise
 */
export async function validatePermission(
  db: Db, 
  serverId: string, 
  userId: string, 
  permission: string
): Promise<boolean> {
  try {
    // First check if user is the server owner
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    if (!server) {
      return false; // Server not found
    }
    
    if (server.ownerId === userId) {
      return true; // Server owner has all permissions
    }
    
    // Check if user is a member of the server
    const memberCollection = getCollection(db, 'serverMembers');
    const member = await memberCollection.findOne({ 
      serverId: serverId, 
      userId: userId
    });
    
    if (!member) {
      return false; // User is not a member of the server
    }
    
    // If user has no roles, check if they have basic permissions
    if (!member.roles || member.roles.length === 0) {
      // Return true for basic permissions that all members should have
      const basicPermissions = [
        'VIEW_CHANNELS',
        'READ_MESSAGES',
        'SEND_MESSAGES',
        'READ_MESSAGE_HISTORY'
      ];
      return basicPermissions.includes(permission);
    }
    
    // Check user's roles for the permission
    const roleCollection = getCollection(db, 'roles');
    const userRoles = await roleCollection.find({
      serverId: serverId,
      id: { $in: member.roles }
    }).toArray();
    
    // Check if any role has ADMINISTRATOR permission
    for (const role of userRoles) {
      if (role.permissions && Array.isArray(role.permissions)) {
        // If role has ADMINISTRATOR permission, user has all permissions
        if (role.permissions.includes('ADMINISTRATOR')) {
          return true;
        }
        
        // If role has the specific permission
        if (role.permissions.includes(permission)) {
          return true;
        }
      }
    }
    
    return false; // User doesn't have the permission
  } catch (error) {
    console.error(`Error validating permission ${permission} for user ${userId} in server ${serverId}:`, error);
    return false; // Default to false on error
  }
} 