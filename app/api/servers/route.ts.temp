import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Server, ServerMember, Role, Channel, Category } from '@/types/models';
import { Db, WithId, Document, Collection, ObjectId } from 'mongodb';

// Increase the body size limit for this specific route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// Helper function to safely get collection
async function safeGetCollection(db: Db, name: 'servers' | 'serverMembers' | 'roles' | 'channels' | 'categories' | 'users'): Promise<Collection<Document>> {
  return getCollection(db, name);
}

// GET /api/servers - Get servers for the authenticated user (or specific userId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId'); // Prioritize userId from query param
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`[Servers API] Attempting to fetch servers for user: ${userId}`);
    
    // Set a global timeout for the entire API call to prevent Vercel function timeouts
    const GLOBAL_TIMEOUT_MS = 6000; // 6 seconds max for the entire function
    const apiTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.log('[Servers API] Global timeout reached, using emergency fallback');
        reject(new Error('API global timeout reached'));
      }, GLOBAL_TIMEOUT_MS);
    });
    
    // Wrap all database operations in a promise that can be raced against the timeout
    const dbOperationsPromise = async () => {
      const db = await connectToDatabase();
      const serversCollection = await safeGetCollection(db, 'servers');
      const serverMembersCollection = await safeGetCollection(db, 'serverMembers');
      const usersCollection = await safeGetCollection(db, 'users');
      
      // Array to collect all server IDs from different sources
      const allServerIds: string[] = [];
      
      // Use Promise.all to run these queries in parallel to save time
      await Promise.allSettled([
        // 1. Get servers where user is a member
        (async () => {
          try {
            const membershipDocs = await serverMembersCollection.find({ userId }).limit(20).toArray();
            const memberServerIds = membershipDocs.map(doc => doc.serverId).filter(id => typeof id === 'string');
            console.log(`[Servers API] User is a member of ${memberServerIds.length} servers`);
            allServerIds.push(...memberServerIds);
          } catch (error) {
            console.error('[Servers API] Error fetching server memberships:', error);
          }
        })(),
        
        // 2. Get servers owned by the user
        (async () => {
          try {
            // Set a shorter timeout for this specific query
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Query timeout after 3 seconds')), 3000);
            });
            
            // Create the actual query promise with a limit
            const queryPromise = serversCollection.find({ ownerId: userId }).limit(10).toArray();
            
            // Race the two promises
            const ownedServerDocs = await Promise.race([queryPromise, timeoutPromise]) as any[];
            const ownedServerIds = ownedServerDocs.map(doc => doc.id).filter(id => typeof id === 'string');
            console.log(`[Servers API] User owns ${ownedServerIds.length} servers`);
            allServerIds.push(...ownedServerIds);
          } catch (error) {
            console.error('[Servers API] Error fetching owned servers:', error);
            console.log('[Servers API] Continuing with servers from other sources');
          }
        })(),
        
        // 3. Get servers from user document if available
        (async () => {
          try {
            const userDoc = await usersCollection.findOne({ id: userId });
            if (userDoc && userDoc.servers && Array.isArray(userDoc.servers)) {
              const userServerIds = userDoc.servers
                .map((id: any) => typeof id === 'string' ? id : String(id))
                .filter((id: string) => id);
              console.log(`[Servers API] Found ${userServerIds.length} servers in user document`);
              allServerIds.push(...userServerIds);
            }
          } catch (error) {
            console.error('[Servers API] Error fetching user document:', error);
          }
        })()
      ]);
      
      // Remove duplicates
      const uniqueServerIds = Array.from(new Set(allServerIds));
      console.log(`[Servers API] Total unique server IDs: ${uniqueServerIds.length}`);
      
      if (uniqueServerIds.length === 0) {
        console.log('[Servers API] No server IDs found for user, returning empty array');
        return [];
      }
      
      return uniqueServerIds;
    };
    
    // Race the database operations against the global timeout
    const uniqueServerIds = await Promise.race([dbOperationsPromise(), apiTimeoutPromise]) as string[];
    
    // If we reach here with no server IDs, return an empty array
    if (!uniqueServerIds || uniqueServerIds.length === 0) {
      return NextResponse.json([]);
    }
    
    // Now fetch the actual server data with a shorter timeout for Vercel compatibility
    let serverDocs = [];
    try {
      // Get a fresh database connection to avoid timeout issues
      const db = await connectToDatabase();
      const serversCollection = await safeGetCollection(db, 'servers');
      
      // Set a timeout promise to prevent hanging on this query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Final query timeout after 3 seconds')), 3000);
      });
      
      // Create the actual query promise with a limit
      const queryPromise = serversCollection.find({
        id: { $in: uniqueServerIds }
      }).limit(20).toArray();
      
      // Race the two promises
      serverDocs = await Promise.race([queryPromise, timeoutPromise]) as any[];
      console.log(`[Servers API] Successfully fetched ${serverDocs.length} servers`);
    } catch (error) {
      console.error('[Servers API] Error in final server fetch:', error);
      // If we have a timeout or other error, try to fetch servers one by one
      console.log('[Servers API] Attempting to fetch servers individually...');
      
      try {
        // Get a fresh database connection to avoid timeout issues
        const db = await connectToDatabase();
        const serversCollection = await safeGetCollection(db, 'servers');
        
        // Fetch servers individually with timeout protection - only fetch up to 3 to stay within Vercel limits
        const serverIdsToFetch = uniqueServerIds.slice(0, 3);
        
        console.log(`[Servers API] Attempting to fetch ${serverIdsToFetch.length} servers individually`);
        
        // Create an array of promises for individual server fetches
        const individualFetchPromises = serverIdsToFetch.map(async (serverId) => {
          try {
            // Set a very short timeout for each individual query
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error(`Individual query timeout for server ${serverId}`)), 1000);
            });
            
            // Create the actual query promise with a lean projection to fetch only essential fields
            const queryPromise = serversCollection.findOne(
              { id: serverId },
              { projection: { _id: 0, id: 1, name: 1, imageUrl: 1, inviteCode: 1, ownerId: 1 } }
            );
            
            // Race the two promises
            const server = await Promise.race([queryPromise, timeoutPromise]);
            console.log(`[Servers API] Successfully fetched server ${serverId}`);
            return server;
          } catch (err) {
            console.warn(`[Servers API] Failed to fetch individual server ${serverId}:`, err);
            // Return a minimal server object instead of null
            return { id: serverId, name: `Server ${serverId.substring(0, 6)}...`, minimal: true };
          }
        });
        
        // Wait for all individual fetches to complete (or timeout)
        const results = await Promise.allSettled(individualFetchPromises);
        
        // Add successful results to serverDocs
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            serverDocs.push(result.value);
          }
        });
      } catch (error) {
        console.error('[Servers API] Error in individual server fetch:', error);
      }
      
      // If we didn't get any servers or got fewer than expected, use emergency fallback
      if (serverDocs.length < uniqueServerIds.length) {
        console.log('[Servers API] Using emergency fallback with basic server data');
        
        // Get the IDs of servers we didn't fetch successfully
        const fetchedIds = new Set(serverDocs.map(doc => doc.id));
        const missingIds = uniqueServerIds.filter(id => !fetchedIds.has(id));
        
        // Create basic server objects for the missing servers
        const fallbackServers = missingIds.map(id => ({
          id,
          name: `Server ${id.substring(0, 6)}...`,
          description: 'Loading server data...',
          fallback: true, // Mark as fallback for the client to know
          icon: null,
          ownerId: userId,
          _isTemporaryData: true
        }));
        
        // Merge the successfully fetched servers with the fallback servers
        serverDocs = [...serverDocs, ...fallbackServers];
        console.log(`[Servers API] Added ${fallbackServers.length} fallback servers to the response`);
      }
      console.log(`[Servers API] Returning ${serverDocs.length} servers`);
    }

    // Map and assert to the correct type for the response
    const servers: Server[] = serverDocs.map(doc => {
      // Ensure the server has an id field (use _id as fallback)
      if (!doc.id && doc._id) {
        doc.id = doc._id.toString();
      }
      return doc as WithId<Server>;
    }); 
    
    console.log(`[Servers API] Successfully fetched ${servers.length} server documents.`);
      
    // Return the typed array
    return NextResponse.json(servers);

  } catch (error: any) { // Catch specific errors if possible
    console.error('[Servers API GET] Error fetching servers:', error);
      
    // Provide more specific error feedback if possible
    let errorMessage = 'Failed to fetch servers due to an internal error.';
    let statusCode = 500;
      
    if (error.name === 'MongoNetworkError' || error.message?.includes('connect')) {
      errorMessage = 'Database connection error.';
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Database authentication error.';
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      // Handle potential fetch-related errors if connectToDatabase uses fetch internally
      errorMessage = 'Network error during database connection.';
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: statusCode }
    );
  }
}

// POST /api/servers - Create a new server
export async function POST(req: NextRequest) {
  try {
    // Read default favicon as base64
    const fs = require('fs');
    const path = require('path');
    let defaultIcon = null;
    try {
      const defaultFaviconPath = path.join(process.cwd(), 'favicon.ico');
      if (fs.existsSync(defaultFaviconPath)) {
        const faviconBuffer = fs.readFileSync(defaultFaviconPath);
        defaultIcon = `data:image/x-icon;base64,${faviconBuffer.toString('base64')}`;
        console.log('[Servers API] Default favicon loaded successfully');
      } else {
        console.warn('[Servers API] Default favicon not found');
      }
    } catch (error) {
      console.error('[Servers API] Error reading default favicon:', error);
    }

    // Safely parse JSON with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('[Servers API POST] JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: error instanceof Error ? error.message : String(error) },
        { status: 400 }
      );
    }

    const {
      name,
      description = '', // Default empty string
      icon = defaultIcon,      // Use default favicon if no icon provided
      banner = null,    // Default null
      ownerId,
      roles = [],       // Default to empty array
      channels = []     // Default to empty array for custom channels
    } = requestData;
    
    if (!name || !ownerId) {
      return NextResponse.json(
        { error: 'Server name and owner ID are required' },
        { status: 400 }
      );
    }
    
    console.log(`[Servers API POST] Creating server "${name}" for owner: ${ownerId}`);
    const db = await connectToDatabase();
    
    // Collections using safeGetCollection
    const serversCollection = await safeGetCollection(db, 'servers');
    const categoriesCollection = await safeGetCollection(db, 'categories');
    const channelsCollection = await safeGetCollection(db, 'channels');
    const rolesCollection = await safeGetCollection(db, 'roles');
    const serverMembersCollection = await safeGetCollection(db, 'serverMembers');

    // Create server data (Define the type explicitly)
    const newServerId = uuidv4();
    const newServerData: Server = {
      _id: undefined, // Let MongoDB handle the _id generation if possible, or handle manually if needed
      id: newServerId,
      name,
      description,
      ownerId,
      icon,
      banner,
      isOfficial: false,
      inviteCode: uuidv4().substring(0, 8),
      // defaultChannelId will be set later
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert server
    await serversCollection.insertOne(newServerData as Document); // Cast to Document for insertion if needed
    console.log(`[Servers API POST] Server ${newServerId} inserted.`);
    
    // Create default "General" category
    const generalCategoryId = uuidv4();
    const generalCategoryData: Category = {
      _id: undefined,
      id: generalCategoryId,
      name: 'GENERAL',
      serverId: newServerId,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await categoriesCollection.insertOne(generalCategoryData as Document);
    console.log(`[Servers API POST] Default category ${generalCategoryId} inserted.`);
    
    // Create channels based on user input or use defaults
    let channelsToCreate: Channel[] = [];
    let generalChannelId = '';
    
    // Check if custom channels were provided
    if (channels && channels.length > 0) {
      console.log(`[Servers API POST] Using ${channels.length} custom channels`);  
      
      // Map custom channels to proper Channel objects
      channelsToCreate = channels.map((channel: any, index: number) => {
        const channelId = uuidv4();
        // Save the general channel ID for setting as default
        if (channel.name === 'general' || index === 0) {
          generalChannelId = channelId;
        }
        
        return {
          _id: undefined,
          id: channelId,
          name: channel.name,
          type: channel.type || 'text',
          serverId: newServerId,
          categoryId: generalCategoryId,
          position: channel.position || index,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
    } else {
      // Use default channels if none provided
      console.log(`[Servers API POST] Using default channels`);  
      const welcomeChannelId = uuidv4();
      generalChannelId = uuidv4(); // This will be used as the defaultChannelId
      const voiceChannelId = uuidv4();
      
      channelsToCreate = [
        {
          _id: undefined,
          id: welcomeChannelId,
          name: 'welcome',
          type: 'text',
          serverId: newServerId,
          categoryId: generalCategoryId,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: undefined,
          id: generalChannelId,
          name: 'general',
          type: 'text',
          serverId: newServerId,
          categoryId: generalCategoryId,
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: undefined,
          id: voiceChannelId,
          name: 'Voice Chat',
          type: 'voice',
          serverId: newServerId,
          categoryId: generalCategoryId,
          position: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
    
    // Insert all channels
    await channelsCollection.insertMany(channelsToCreate as Document[]);
    console.log(`[Servers API POST] ${channelsToCreate.length} channels inserted.`);
    
    // Create default '@everyone' role
    const everyoneRoleId = uuidv4();
    const everyoneRoleData: Role = {
      _id: undefined,
      id: everyoneRoleId,
      name: '@everyone',
      color: '#99AAB5',
      serverId: newServerId,
      permissions: { admin: false, kick: false, ban: false, manageChannels: false, manageRoles: false, manageServer: false },
      isDefault: true,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await rolesCollection.insertOne(everyoneRoleData as Document);
    console.log(`[Servers API POST] Default role ${everyoneRoleId} inserted.`);
    
    // Add owner as a member with the @everyone role
    const serverMemberData: ServerMember = {
      _id: undefined,
      userId: ownerId,
      serverId: newServerId,
      roleIds: [everyoneRoleId],
      joinedAt: new Date(),
    };
    await serverMembersCollection.insertOne(serverMemberData as Document);
    console.log(`[Servers API POST] Owner ${ownerId} added as member.`);

    // Fetch the created server to return it (optional, but good practice)
    const createdServerDoc = await serversCollection.findOne({ id: newServerId });

    if (!createdServerDoc) {
        console.error(`[Servers API POST] Failed to retrieve created server ${newServerId}`);
        return NextResponse.json({ error: 'Server created but failed to retrieve.' }, { status: 500 });
    }

    // Set default channel ID on the server document
    const updateResult = await serversCollection.updateOne(
        { id: newServerId },
        { $set: { defaultChannelId: generalChannelId, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
        console.warn(`[Servers API POST] Failed to update server ${newServerId} with defaultChannelId.`);
        // Proceeding anyway, but logging the issue
    }

    // Prepare the final server object to return, ensuring it includes the defaultChannelId
    const createdServer: Server = {
      ...(createdServerDoc as WithId<Server>),
      defaultChannelId: generalChannelId,
      updatedAt: new Date() // Reflect the update time
    };

    console.log(`[Servers API POST] Server creation complete for ${newServerId}.`);
    return NextResponse.json(createdServer, { status: 201 });

  } catch (error: any) {
    console.error('[Servers API POST] Error creating server:', error);
    let errorMessage = 'Failed to create server due to an internal error.';
    let statusCode = 500;

    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      errorMessage = 'Invalid JSON format in request body.';
      statusCode = 400; // Bad Request
    } else if (error.name === 'MongoNetworkError' || error.message?.includes('connect')) {
      errorMessage = 'Database connection error.';
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Database authentication error.';
    } else if (error.code === 11000) { // Handle duplicate key errors
      errorMessage = 'Failed to create server due to a conflict (e.g., duplicate data).';
      statusCode = 409; // Conflict
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: statusCode }
    );
  }
}

// PATCH /api/servers/:serverId/check-mod-permissions - Check if a user has moderation permissions
export async function PATCH(req: NextRequest) {
  try {
    // Extract the server ID from the URL path
    const pathParts = req.nextUrl.pathname.split('/');
    const serverId = pathParts[pathParts.indexOf('servers') + 1];
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }
    
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('[Servers API PATCH] JSON parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: error instanceof Error ? error.message : String(error) },
        { status: 400 }
      );
    }
    
    const { userId, action } = requestData;
    
    if (!userId || !action) {
      return NextResponse.json({ 
        error: 'User ID and action are required',
        details: 'Please provide both userId and action (kick, ban, or mute)'
      }, { status: 400 });
    }
    
    // Validate action
    if (!['kick', 'ban', 'mute'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action',
        details: 'Action must be one of: kick, ban, mute'
      }, { status: 400 });
    }
    
    console.log(`[Servers API PATCH] Checking ${action} permission for user ${userId} in server ${serverId}`);
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Get collections
    const serversCollection = await safeGetCollection(db, 'servers');
    const serverMembersCollection = await safeGetCollection(db, 'serverMembers');
    const rolesCollection = await safeGetCollection(db, 'roles');
    
    // Check if server exists
    const server = await serversCollection.findOne({ 
      $or: [
        { id: serverId },
        { _id: /^[0-9a-fA-F]{24}$/.test(serverId) ? new ObjectId(serverId) : undefined }
      ]
    });
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    // Check if user is the server owner (owners have all permissions)
    if (server.ownerId === userId) {
      return NextResponse.json({ 
        hasPermission: true,
        isOwner: true
      });
    }
    
    // Get user's server membership
    const serverMember = await serverMembersCollection.findOne({ 
      userId: userId,
      serverId: serverId
    });
    
    if (!serverMember) {
      return NextResponse.json({ 
        error: 'User is not a member of this server',
        hasPermission: false
      }, { status: 403 });
    }
    
    // Get user's roles
    const roleIds = serverMember.roleIds || [];
    
    // If no roles, user doesn't have permission
    if (roleIds.length === 0) {
      return NextResponse.json({ hasPermission: false });
    }
    
    // Find all roles for the user
    const roles = await rolesCollection.find({
      $or: [
        { id: { $in: roleIds } },
        { _id: { $in: roleIds.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id)).map((id: string) => new ObjectId(id)) } }
      ]
    }).toArray();
    
    // Check if any role has the required permission
    let hasPermission = false;
    let permissionSource = '';
    
    for (const role of roles) {
      // Admin role has all permissions
      if (role.permissions.admin) {
        hasPermission = true;
        permissionSource = `admin role: ${role.name}`;
        break;
      }
      
      // Check specific permission based on action
      switch (action) {
        case 'kick':
          if (role.permissions.kick) {
            hasPermission = true;
            permissionSource = `kick permission from role: ${role.name}`;
          }
          break;
        case 'ban':
          if (role.permissions.ban) {
            hasPermission = true;
            permissionSource = `ban permission from role: ${role.name}`;
          }
          break;
        case 'mute':
          // For mute, we'll check if they have kick permission as a minimum
          if (role.permissions.kick) {
            hasPermission = true;
            permissionSource = `mute permission from role: ${role.name}`;
          }
          break;
      }
      
      if (hasPermission) break;
    }
    
    console.log(`[Servers API PATCH] Permission check result for ${userId}: ${hasPermission ? 'Allowed' : 'Denied'} (${permissionSource || 'no matching role'})`);
    
    return NextResponse.json({
      hasPermission,
      permissionSource: permissionSource || null,
      roles: roles.map(r => ({ id: r.id, name: r.name }))
    });
    
  } catch (error: any) {
    console.error('[Servers API PATCH] Error checking moderation permissions:', error);
    
    let errorMessage = 'Failed to check permissions due to an internal error.';
    let statusCode = 500;
    
    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      errorMessage = 'Invalid JSON format in request body.';
      statusCode = 400; // Bad Request
    } else if (error.name === 'MongoNetworkError' || error.message?.includes('connect')) {
      errorMessage = 'Database connection error.';
    } else if (error.message?.includes('authentication')) {
      errorMessage = 'Database authentication error.';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: statusCode }
    );
  }
}
