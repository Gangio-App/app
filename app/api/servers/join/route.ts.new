import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';

// POST: Join a server using invite code
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { inviteCode, userId } = await req.json();
    
    console.log(`[Join Server API] Request received with inviteCode: ${inviteCode}, userId: ${userId}`);
    
    // Validate required fields
    if (!inviteCode || !userId) {
      console.log('[Join Server API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: inviteCode and userId' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Find the server by invite code
    const server = await db.collection('servers').findOne({ inviteCode });
    
    if (!server) {
      console.log(`[Join Server API] Invalid invite code: ${inviteCode}`);
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }
    
    console.log(`[Join Server API] Found server: ${server.name} (${server.id})`);
    
    // Find the user - try multiple ways to find the user
    console.log(`[Join Server API] Looking for user with ID: ${userId}`);
    
    // Try to find by id field first
    let user = await db.collection('users').findOne({ id: userId });
    console.log(`[Join Server API] User lookup by id field: ${!!user}`);
    
    // If not found, try by uid field (Firebase auth ID)
    if (!user) {
      user = await db.collection('users').findOne({ uid: userId });
      console.log(`[Join Server API] User lookup by uid field: ${!!user}`);
    }
    
    // If still not found, try by _id field (MongoDB ObjectId)
    if (!user) {
      try {
        if (ObjectId.isValid(userId)) {
          user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
          console.log(`[Join Server API] User lookup by _id field: ${!!user}`);
        }
      } catch (error) {
        console.error(`[Join Server API] Error looking up user by _id: ${error}`);
      }
    }
    
    // If still not found, try a more flexible query
    if (!user) {
      // Dump a few users to see what fields they have
      const sampleUsers = await db.collection('users').find().limit(3).toArray();
      console.log(`[Join Server API] Sample users from database:`, JSON.stringify(sampleUsers, null, 2));
      
      // Create a user if not found - this is a temporary solution
      console.log(`[Join Server API] Creating a temporary user for ID: ${userId}`);
      const newUser = {
        _id: new ObjectId(), // Add MongoDB ObjectId
        id: userId,
        uid: userId,
        name: `User-${userId.substring(0, 6)}`,
        email: `user-${userId.substring(0, 6)}@example.com`,
        image: null,
        servers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        const result = await db.collection('users').insertOne(newUser);
        user = await db.collection('users').findOne({ _id: result.insertedId });
        console.log(`[Join Server API] Created temporary user: ${user?.name || 'unknown'}`);
      } catch (error) {
        console.error(`[Join Server API] Error creating temporary user: ${error}`);
      }
    }
    
    if (!user) {
      console.log(`[Join Server API] User not found after all attempts: ${userId}`);
      return NextResponse.json(
        { error: 'User not found and could not be created' },
        { status: 404 }
      );
    }
    
    console.log(`[Join Server API] Found user: ${user.name} (${user.id || user._id})`);
    
    // Use a consistent userId format for the rest of the operations
    const effectiveUserId = user.id || user._id.toString();
    
    // Check if user is already a member via serverMembers collection
    const existingMember = await db.collection('serverMembers').findOne({
      serverId: server.id,
      userId: { $in: [userId, effectiveUserId] }
    });
    
    if (existingMember) {
      console.log(`[Join Server API] User ${userId} is already a member of server ${server.id}`);
      return NextResponse.json(
        { message: 'Already a member of this server', serverId: server.id },
        { status: 200 }
      );
    }
    
    // Find the default role for new members
    let defaultRole = await db.collection('roles').findOne({
      serverId: server.id,
      name: '@everyone'
    });
    
    // If @everyone role not found, try to find any default role
    if (!defaultRole) {
      defaultRole = await db.collection('roles').findOne({
        serverId: server.id,
        isDefault: true
      });
    }
    
    // If still no role found, create a basic @everyone role
    if (!defaultRole) {
      console.log(`[Join Server API] No default role found, creating @everyone role`);
      const newRoleId = uuidv4();
      defaultRole = {
        _id: new ObjectId(),
        id: newRoleId,
        serverId: server.id,
        name: '@everyone',
        color: '#99AAB5',
        position: 0,
        isDefault: true,
        permissions: {
          VIEW_CHANNELS: true,
          READ_MESSAGES: true,
          SEND_MESSAGES: true
        },
        createdAt: new Date()
      };
      
      await db.collection('roles').insertOne(defaultRole);
      console.log(`[Join Server API] Created default @everyone role with ID: ${newRoleId}`);
    }
    
    const roleIds = defaultRole ? [defaultRole.id] : [];
    console.log(`[Join Server API] Default role for new members: ${JSON.stringify(defaultRole)}`);
    
    // Add the user to the serverMembers collection
    const membershipId = uuidv4(); // Generate a unique ID for this membership
    const serverMemberResult = await db.collection('serverMembers').insertOne({
      _id: new ObjectId(), // MongoDB ObjectId
      id: membershipId, // Custom ID
      serverId: server.id,
      userId: effectiveUserId, // Use the consistent user ID
      joinedAt: new Date(),
      roleIds: roleIds,
      nickname: null
    });
    
    console.log(`[Join Server API] Added user ${effectiveUserId} to serverMembers collection with ID: ${serverMemberResult.insertedId}`);
    console.log(`[Join Server API] Membership ID: ${membershipId}`);
    
    // Double-check that the member was added
    const memberCheck = await db.collection('serverMembers').findOne({ id: membershipId });
    console.log(`[Join Server API] Member check after insertion: ${!!memberCheck}`);
    
    // Update the server's members array if it exists
    if (Array.isArray(server.members)) {
      await db.collection('servers').updateOne(
        { id: server.id },
        { 
          $addToSet: { members: effectiveUserId },
          $inc: { memberCount: 1 }
        }
      );
      console.log(`[Join Server API] Updated server's members array with userId: ${effectiveUserId}`);
    } else {
      // If members array doesn't exist, create it
      await db.collection('servers').updateOne(
        { id: server.id },
        { 
          $set: { members: [effectiveUserId] },
          $inc: { memberCount: 1 }
        }
      );
      console.log(`[Join Server API] Created server's members array with userId: ${effectiveUserId}`);
    }
    
    // Update the user's servers array if it exists
    if (user) {
      if (Array.isArray(user.servers)) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $addToSet: { servers: server.id } }
        );
      } else {
        // If servers array doesn't exist, create it
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { servers: [server.id] } }
        );
      }
      console.log(`[Join Server API] Updated user's servers array with serverId: ${server.id}`);
    }
    
    // Check if the server has any channels
    const channels = await db.collection('channels').find({ serverId: server.id }).toArray();
    
    if (channels.length === 0) {
      // Create a default "general" text channel if none exists
      const generalChannelId = uuidv4();
      await db.collection('channels').insertOne({
        _id: new ObjectId(),
        id: generalChannelId,
        name: 'general',
        type: 'text',
        serverId: server.id,
        categoryId: null,
        position: 0,
        createdAt: new Date()
      });
      console.log(`[Join Server API] Created default general channel with ID: ${generalChannelId}`);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Successfully joined server', 
        serverId: server.id,
        serverName: server.name
      },
      { status: 200 }
    );
    
  } catch (error) {
    // Log detailed error information
    console.error('[Join Server API] Error joining server:', error);
    if (error instanceof Error) {
      console.error('[Join Server API] Error details:', error.message, error.stack);
    }
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to join server due to an internal error' },
      { status: 500 }
    );
  }
}
