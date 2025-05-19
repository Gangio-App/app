import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// POST /api/servers/:serverId/moderation - Apply moderation action
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { action, targetUserId, moderatorId, reason, duration } = await req.json();
    
    if (!serverId || !action || !targetUserId || !moderatorId) {
      return NextResponse.json(
        { error: 'Server ID, action, target user ID, and moderator ID are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if target user exists
    const targetUser = await db.collection('users').findOne({ id: targetUserId });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }
    
    // Check if moderator has permission
    const moderator = await db.collection('serverMembers').findOne({
      serverId,
      userId: moderatorId
    });
    
    if (!moderator) {
      return NextResponse.json(
        { error: 'Moderator is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Check moderator roles and permissions
    let hasPermission = server.ownerId === moderatorId; // Owner always has permission
    
    if (!hasPermission) {
      const moderatorRoles = await db.collection('roles').find({
        id: { $in: moderator.roleIds || [] },
        serverId
      }).toArray();
      
      // Check for required permissions based on action
      switch (action) {
        case 'mute':
          hasPermission = moderatorRoles.some(role => 
            role.permissions?.ADMINISTRATOR || 
            role.permissions?.MUTE_MEMBERS
          );
          break;
        case 'kick':
          hasPermission = moderatorRoles.some(role => 
            role.permissions?.ADMINISTRATOR || 
            role.permissions?.KICK_MEMBERS
          );
          break;
        case 'ban':
          hasPermission = moderatorRoles.some(role => 
            role.permissions?.ADMINISTRATOR || 
            role.permissions?.BAN_MEMBERS
          );
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to perform this action' },
        { status: 403 }
      );
    }
    
    // Check if target is not the server owner
    if (server.ownerId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot moderate the server owner' },
        { status: 403 }
      );
    }
    
    // Check if target has a higher role than moderator
    const targetMember = await db.collection('serverMembers').findOne({
      serverId,
      userId: targetUserId
    });
    
    if (!targetMember) {
      return NextResponse.json(
        { error: 'Target user is not a member of this server' },
        { status: 404 }
      );
    }
    
    // Get highest role positions for both moderator and target
    const [moderatorRoles, targetRoles] = await Promise.all([
      db.collection('roles').find({
        id: { $in: moderator.roleIds || [] },
        serverId
      }).toArray(),
      db.collection('roles').find({
        id: { $in: targetMember.roleIds || [] },
        serverId
      }).toArray()
    ]);
    
    const moderatorHighestPosition = moderatorRoles.reduce((highest, role) => 
      Math.max(highest, (role as any).position || 0), 0
    );
    
    const targetHighestPosition = targetRoles.reduce((highest, role) => 
      Math.max(highest, (role as any).position || 0), 0
    );
    
    if (targetHighestPosition >= moderatorHighestPosition && server.ownerId !== moderatorId) {
      return NextResponse.json(
        { error: 'Cannot moderate a user with equal or higher role position' },
        { status: 403 }
      );
    }
    
    // Perform the action
    switch (action) {
      case 'mute': {
        const expiresAt = duration ? new Date(Date.now() + duration) : null;
        
        // Create or update mute record
        await db.collection('server_moderations').updateOne(
          { 
            serverId,
            userId: targetUserId,
            type: 'mute',
            active: true
          },
          {
            $set: {
              moderatorId,
              reason: reason || 'No reason provided',
              expiresAt,
              createdAt: new Date(),
              active: true
            }
          },
          { upsert: true }
        );
        
        return NextResponse.json({
          success: true,
          message: `User has been muted${expiresAt ? ' until ' + expiresAt.toISOString() : ' indefinitely'}`
        });
      }
      
      case 'kick': {
        // Record the kick
        await db.collection('server_moderations').insertOne({
          serverId,
          userId: targetUserId,
          moderatorId,
          type: 'kick',
          reason: reason || 'No reason provided',
          createdAt: new Date(),
          active: false // No ongoing effect
        });
        
        // Remove from server
        await db.collection('serverMembers').deleteOne({
          serverId,
          userId: targetUserId
        });
        
        return NextResponse.json({
          success: true,
          message: 'User has been kicked from the server'
        });
      }
      
      case 'ban': {
        const expiresAt = duration ? new Date(Date.now() + duration) : null;
        
        // Record the ban
        await db.collection('server_moderations').insertOne({
          serverId,
          userId: targetUserId,
          moderatorId,
          type: 'ban',
          reason: reason || 'No reason provided',
          expiresAt,
          createdAt: new Date(),
          active: true
        });
        
        // Remove from server
        await db.collection('serverMembers').deleteOne({
          serverId,
          userId: targetUserId
        });
        
        // Add to server ban list
        await db.collection('server_bans').updateOne(
          { serverId, userId: targetUserId },
          { 
            $set: {
              moderatorId,
              reason: reason || 'No reason provided',
              expiresAt,
              createdAt: new Date(),
              active: true
            }
          },
          { upsert: true }
        );
        
        return NextResponse.json({
          success: true,
          message: `User has been banned${expiresAt ? ' until ' + expiresAt.toISOString() : ' indefinitely'}`
        });
      }
    }
  } catch (error) {
    console.error('Error applying moderation action:', error);
    return NextResponse.json(
      { error: 'Failed to apply moderation action' },
      { status: 500 }
    );
  }
}

// GET /api/servers/:serverId/moderation - Get server moderation logs
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if requester has permission
    const requesterId = searchParams.get('requesterId');
    
    if (!requesterId) {
      return NextResponse.json(
        { error: 'Requester ID is required' },
        { status: 400 }
      );
    }
    
    const requester = await db.collection('serverMembers').findOne({
      serverId,
      userId: requesterId
    });
    
    if (!requester) {
      return NextResponse.json(
        { error: 'Requester is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Check if requester has permission to view logs
    let hasPermission = server.ownerId === requesterId; // Owner always has permission
    
    if (!hasPermission) {
      const requesterRoles = await db.collection('roles').find({
        id: { $in: requester.roleIds || [] },
        serverId
      }).toArray();
      
      hasPermission = requesterRoles.some(role => 
        role.permissions?.ADMINISTRATOR || 
        role.permissions?.MANAGE_SERVER
      );
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to view moderation logs' },
        { status: 403 }
      );
    }
    
    // Build query
    const query: any = { serverId };
    
    if (userId) {
      query.userId = userId;
    }
    
    // Get moderation logs
    const totalCount = await db.collection('server_moderations').countDocuments(query);
    
    const logs = await db.collection('server_moderations')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    // Get user info for involved parties
    const userIds = Array.from(new Set([
      ...logs.map(log => log.userId),
      ...logs.map(log => log.moderatorId)
    ]));
    
    const users = await db.collection('users')
      .find({ id: { $in: userIds } })
      .project({ id: 1, name: 1, discriminator: 1, avatarUrl: 1 })
      .toArray();
    
    // Add user info to logs
    const logsWithUserInfo = logs.map(log => {
      const targetUser = users.find(u => u.id === log.userId);
      const moderator = users.find(u => u.id === log.moderatorId);
      
      return {
        ...log,
        targetUser: targetUser ? {
          id: targetUser.id,
          name: targetUser.name,
          discriminator: targetUser.discriminator,
          avatarUrl: targetUser.avatarUrl
        } : null,
        moderator: moderator ? {
          id: moderator.id,
          name: moderator.name,
          discriminator: moderator.discriminator,
          avatarUrl: moderator.avatarUrl
        } : null
      };
    });
    
    return NextResponse.json({
      logs: logsWithUserInfo,
      totalCount,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation logs' },
      { status: 500 }
    );
  }
} 
 