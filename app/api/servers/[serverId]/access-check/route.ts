import { NextRequest, NextResponse } from 'next/server';
import { getCollection, connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Helper function to find server by custom ID or MongoDB ObjectId
async function findServer(db: any, serverId: string) {
  let server = await getCollection(db, 'servers').findOne({ id: serverId });
  if (!server && ObjectId.isValid(serverId)) {
    server = await getCollection(db, 'servers').findOne({ _id: new ObjectId(serverId) });
  }
  return server;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  const startTime = Date.now();
  // Define a timeout for the entire request, e.g., 8 seconds for a 10s Vercel limit
  const REQUEST_TIMEOUT = 8000;

  try {
    const routeServerId = params.serverId;
    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('userId');

    if (!userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    let userObjectId;
    try {
      userObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    } catch (err) {
      userObjectId = userId; // Fallback if ObjectId creation fails for some reason
    }

    // --- Start Parallel Data Fetching ---
    const [serverResult, memberResult, userResult] = await Promise.allSettled([
      findServer(db, routeServerId),
      getCollection(db, 'serverMembers').findOne({ 
        serverId: routeServerId, 
        userId: userId 
      }),
      getCollection(db, 'users').findOne({ _id: userObjectId } as any)
    ]);

    if (Date.now() - startTime > REQUEST_TIMEOUT) {
      console.warn('[Access Check API] Timeout after parallel initial fetches.');
      return NextResponse.json({ error: 'Request timed out during initial data retrieval.' }, { status: 504 });
    }

    const server = serverResult.status === 'fulfilled' ? serverResult.value : null;
    let member = memberResult.status === 'fulfilled' ? memberResult.value : null;
    const user = userResult.status === 'fulfilled' ? userResult.value : null;

    if (!server) {
      console.log(`[Access Check API] Server not found: ${routeServerId}`);
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    const normalizedServerId = server.id || (server._id ? server._id.toString() : '');
    console.log(`[Access Check API] Found server: ${server.name} (${normalizedServerId})`);

    // Refined member check if initial one used routeServerId and server uses a different 'id'
    if (!member && normalizedServerId && routeServerId !== normalizedServerId) {
        console.log(`[Access Check API] Initial member check with ${routeServerId} failed or server.id is different. Refetching member with server.id: ${normalizedServerId}`);
        member = await getCollection(db, 'serverMembers').findOne({
            serverId: normalizedServerId,
            userId: userId
        });
        console.log(`[Access Check API] Refetched member status: ${!!member}`);
    }
    // --- End Parallel Data Fetching ---

    console.log(`[Access Check API] Checking serverMembers collection: serverId=${normalizedServerId}, userId=${userId}, found=${!!member}`);
    
    let isInUserServers = false;
    if (user && user.servers && Array.isArray(user.servers)) {
      isInUserServers = user.servers.some((userServerId: any) => {
        const userServerIdStr = typeof userServerId === 'string' ? userServerId : userServerId.toString();
        return userServerIdStr === normalizedServerId || userServerIdStr === routeServerId;
      });
    }

    let isInServerMembers = false;
    if (server.members && Array.isArray(server.members)) {
      isInServerMembers = server.members.some((memberId: any) => {
        const memberIdStr = typeof memberId === 'string' ? memberId : (memberId && memberId.toString ? memberId.toString() : null);
        return memberIdStr === userId;
      });
    }

    const isOwner = server.ownerId === userId || 
                   (server.ownerId && server.ownerId.toString && server.ownerId.toString() === userId);

    const hasAccess = isOwner || !!member || isInUserServers || isInServerMembers;
    
    const SKIP_ACCESS_CHECK = false; 
    
    console.log(`[Access Check API] Access check details:`);
    console.log(`[Access Check API] - User ID: ${userId}`);
    console.log(`[Access Check API] - Server ID (route): ${routeServerId}, Normalized: ${normalizedServerId}`);
    console.log(`[Access Check API] - Is owner: ${isOwner}`);
    console.log(`[Access Check API] - Is in serverMembers collection: ${!!member}`);
    console.log(`[Access Check API] - Is in user's servers array: ${isInUserServers}`);
    console.log(`[Access Check API] - Is in server's members array (field): ${isInServerMembers}`);
    console.log(`[Access Check API] - Overall has access: ${hasAccess}`);
    
    if (!SKIP_ACCESS_CHECK && !hasAccess) {
      console.log(`[Access Check API] Access denied for user ${userId} to server ${routeServerId}`);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    console.log(`[Access Check API] Access granted for user ${userId} to server ${routeServerId}`);

    if (Date.now() - startTime > REQUEST_TIMEOUT - 2000) { // Leave 2s for role fetching
        console.warn('[Access Check API] Timeout before fetching roles.');
        return NextResponse.json({ 
            hasAccess: true, 
            isOwner, // Added isOwner
            roles: isOwner ? ['Owner'] : (member?.roles || []),
            permissions: isOwner ? ['ADMINISTRATOR'] : [], // Provide minimal permissions on timeout
            message: "Role fetching timed out, returning basic access."
        }, { status: 200 });
    }

    const roleCollection = getCollection(db, 'roles');
    let permissions: string[] = [];
    let roles: string[] = [];
    
    if (isOwner) {
      permissions.push('ADMINISTRATOR'); 
      roles.push('Owner'); 
      permissions.push(
        'VIEW_CHANNELS', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_SERVER',
        'KICK_MEMBERS', 'BAN_MEMBERS', 'INVITE_MEMBERS', 'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES', 'READ_MESSAGES', 'SEND_MESSAGES', 'MANAGE_MESSAGES',
        'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'
      );
    } else if (member && member.roles && member.roles.length > 0) {
      roles = member.roles;
      
      const userRoles = await roleCollection.find({
        serverId: normalizedServerId || routeServerId, 
        id: { $in: member.roles }
      }).limit(10).toArray();

      userRoles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          // Use Array.from for Set to Array conversion
          permissions = Array.from(new Set([...permissions, ...role.permissions]));
        }
        if (permissions.includes('ADMINISTRATOR')) {
            permissions.push(
                'VIEW_CHANNELS', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_SERVER',
                'KICK_MEMBERS', 'BAN_MEMBERS', 'INVITE_MEMBERS', 'CHANGE_NICKNAME',
                'MANAGE_NICKNAMES', 'READ_MESSAGES', 'SEND_MESSAGES', 'MANAGE_MESSAGES',
                'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE',
                'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'
            );
            // Use Array.from for Set to Array conversion
            permissions = Array.from(new Set(permissions));
        }
      });
    }

    // If no specific permissions found but basic access granted, provide default view permissions
    if (permissions.length === 0 && hasAccess && !isOwner) {
        permissions.push('VIEW_CHANNELS', 'READ_MESSAGES', 'READ_MESSAGE_HISTORY', 'CHANGE_NICKNAME', 'ADD_REACTIONS');
    }
    permissions = Array.from(new Set(permissions)); // Final deduplication

    console.log(`[Access Check API] Final Permissions for ${userId} on ${routeServerId}: ${permissions.join(', ')}`);
    console.log(`[Access Check API] Execution time: ${Date.now() - startTime}ms`);

    return NextResponse.json({ hasAccess: true, isOwner, roles, permissions }, { status: 200 });

  } catch (error) {
    console.error('[Access Check API] Error:', error);
    const execTime = Date.now() - startTime;
    console.error(`[Access Check API] Execution time before error: ${execTime}ms`);
    if (execTime > REQUEST_TIMEOUT - 500) { // If error occurred close to timeout
        return NextResponse.json({ error: 'Request processing timed out with an error.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Internal server error during access check' }, { status: 500 });
  }
}