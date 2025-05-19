import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Server } from '@/types/models';

// Default permissions structure (same as in roles API)
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

// POST /api/servers/repair - Repair server configuration
export async function POST(req: NextRequest) {
  try {
    const { serverId, userId } = await req.json();
    
    if (!serverId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID and user ID are required' },
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
    
    // Check if user is the server owner
    if (server.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the server owner can repair server configuration' },
        { status: 403 }
      );
    }
    
    // Check if the server has a default role
    const defaultRole = await db.collection('roles').findOne({ 
      serverId, 
      isDefault: true 
    });
    
    let repairResult = {
      defaultRoleCreated: false,
      memberRolesUpdated: 0
    };

    // If no default role exists, create it
    if (!defaultRole) {
      const newDefaultRole = {
        id: uuidv4(),
        name: '@everyone',
        color: '#99AAB5',
        position: 0,
        isDefault: true,
        permissions: DEFAULT_PERMISSIONS,
        serverId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('roles').insertOne(newDefaultRole);
      repairResult.defaultRoleCreated = true;
      
      // Update all server members to have this role
      const updateResult = await db.collection('serverMembers').updateMany(
        { serverId },
        { $addToSet: { roleIds: newDefaultRole.id } }
      );
      
      repairResult.memberRolesUpdated = updateResult.modifiedCount;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Server configuration repaired successfully',
      repairResult
    });
  } catch (error) {
    console.error('Error repairing server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to repair server configuration' },
      { status: 500 }
    );
  }
}

// GET /api/servers/repair - Repair servers for a specific user
export async function GET(req: NextRequest) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', message: 'Please provide a userId parameter' },
        { status: 400 }
      );
    }
    
    console.log(`[Servers Repair API] Repairing servers for user: ${userId}`);
    
    const db = await connectToDatabase();
    console.log(`[Servers Repair API] Connected to database`);
    
    // Get the server IDs that the user is a member of
    console.log(`[Servers Repair API] Fetching server_members records for user: ${userId}`);
    const membershipRecords = await db.collection('serverMembers')
      .find({ userId: userId })
      .toArray();
    
    console.log(`[Servers Repair API] Found ${membershipRecords.length} server memberships for user: ${userId}`);
    
    if (membershipRecords.length === 0) {
      return NextResponse.json({ message: 'No server memberships found to repair', repaired: 0 });
    }
    
    const serverIds = membershipRecords.map((record: { serverId: string }) => record.serverId);
    
    // Get servers from the database that the user is a member of
    const servers = await db.collection('servers')
      .find({ id: { $in: serverIds } })
      .toArray();
    
    console.log(`[Servers Repair API] Found ${servers.length} servers to check for user: ${userId}`);
    
    // Define a type for server data from the database
    type ServerDocument = {
      _id: any;
      id: string;
      name?: string;
      description?: string;
      ownerId?: string;
      icon?: string | null;
      iconUrl?: string | null;
      banner?: string | null;
      isOfficial?: boolean;
      inviteCode?: string;
      defaultChannelId?: string;
      memberCount?: number;
      createdAt?: Date;
      updatedAt?: Date;
    };
    
    // Log servers with missing or incorrect fields
    const serversToRepair = servers.filter((server: ServerDocument) => {
      return !server.createdAt || 
             !server.updatedAt || 
             typeof server.name !== 'string' ||
             server.name === '' ||
             !server.ownerId;
    });
    
    console.log(`[Servers Repair API] Found ${serversToRepair.length} servers that need repair`);
    
    // Fix each server that needs repair
    let repairedCount = 0;
    for (const server of serversToRepair) {
      // Create an update object with fixes
      const updateData: Partial<ServerDocument> = {};
      
      // Fix missing or incorrect fields
      if (!server.name || typeof server.name !== 'string') {
        updateData.name = server.name || 'Unnamed Server';
      }
      
      if (!server.createdAt) {
        updateData.createdAt = new Date();
      }
      
      if (!server.updatedAt) {
        updateData.updatedAt = new Date();
      }
      
      if (!server.description) {
        updateData.description = '';
      }
      
      if (!server.ownerId) {
        // If owner is missing, assume the first member (likely creator) is the owner
        updateData.ownerId = userId;
      }
      
      // Perform the update if there are fields to fix
      if (Object.keys(updateData).length > 0) {
        console.log(`[Servers Repair API] Repairing server ${server.id} with fixes:`, updateData);
        
        await db.collection('servers').updateOne(
          { id: server.id },
          { $set: updateData }
        );
        
        repairedCount++;
      }
    }
    
    // Now get the repaired servers to return
    const repairedServers = await db.collection('servers')
      .find({ id: { $in: serverIds } })
      .toArray();
    
    // Process servers to ensure consistent format
    const processedServers = repairedServers.map((server: ServerDocument) => ({
      ...server,
      name: server.name || 'Unnamed Server',
      description: server.description || '',
      icon: server.icon || null,
      iconUrl: server.iconUrl || null,
      banner: server.banner || null,
      isOfficial: server.isOfficial || false,
      ownerId: server.ownerId || userId,
      inviteCode: server.inviteCode || '',
      defaultChannelId: server.defaultChannelId || '',
      memberCount: server.memberCount || 0,
      createdAt: server.createdAt || new Date(),
      updatedAt: server.updatedAt || new Date(),
    }));
    
    // Migrate members from old collection name to new if needed
    console.log(`[Servers Repair] Checking for members in 'server_members' collection`);
    const oldMembersCount = await db.collection('server_members').countDocuments();

    if (oldMembersCount > 0) {
      console.log(`[Servers Repair] Found ${oldMembersCount} members in old collection, migrating...`);
      
      // Get all members from old collection
      const oldMembers = await db.collection('server_members').find({}).toArray();
      
      // Insert into new collection if not already exists
      let migratedCount = 0;
      for (const member of oldMembers) {
        const exists = await getCollection(db, 'serverMembers').findOne({
          userId: member.userId,
          serverId: member.serverId
        });
        
        if (!exists) {
          await getCollection(db, 'serverMembers').insertOne(member);
          migratedCount++;
        }
      }
      
      console.log(`[Servers Repair] Migrated ${migratedCount} members to new collection`);
    }
    
    return NextResponse.json({
      message: `Repaired ${repairedCount} servers`,
      repaired: repairedCount,
      servers: processedServers
    });
    
  } catch (error) {
    console.error('[Servers Repair API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to repair servers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
 