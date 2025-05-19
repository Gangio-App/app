import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { WithId, Document } from 'mongodb';

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
    
    console.log(`[Join Server API] Found user: ${user.name} (${user.id})`);
    
    // Check if user is already a member via serverMembers collection
    const existingMember = await db.collection('serverMembers').findOne({
      serverId: server.id,
      userId: userId
    });
    
    if (existingMember) {
      console.log(`[Join Server API] User ${userId} is already a member of server ${server.id}`);
      return NextResponse.json(
        { message: 'Already a member of this server', serverId: server.id },
        { status: 200 }
      );
    }
    
    // Find the default role for new members
    const defaultRole = await db.collection('roles').findOne({
      serverId: server.id,
      name: '@everyone'
    }) || await db.collection('roles').findOne({
      serverId: server.id,
      isDefault: true
    });
    
    const roleIds = defaultRole ? [defaultRole.id] : [];
    console.log(`[Join Server API] Default role for new members: ${JSON.stringify(defaultRole)}`);
    
    // Add the user to the serverMembers collection
    const membershipId = uuidv4(); // Generate a unique ID for this membership
    const serverMemberResult = await db.collection('serverMembers').insertOne({
      _id: new ObjectId(), // MongoDB ObjectId
      id: membershipId, // Custom ID
      serverId: server.id,
      userId: userId,
      joinedAt: new Date(),
      roleIds: roleIds,
      nickname: null
    });
    
    console.log(`[Join Server API] Added user ${userId} to serverMembers collection with ID: ${serverMemberResult.insertedId}`);
    console.log(`[Join Server API] Membership ID: ${membershipId}`);
    
    // Double-check that the member was added
    const memberCheck = await db.collection('serverMembers').findOne({ id: membershipId });
    console.log(`[Join Server API] Member check after insertion: ${!!memberCheck}`);
    
    if (!memberCheck) {
      console.log(`[Join Server API] Trying alternative insertion with different ID format`);
      
      // Try an alternative approach if the first insertion didn't work
      await db.collection('serverMembers').insertOne({
        _id: new ObjectId(),
        serverId: server.id,
        userId: userId,
        joinedAt: new Date(),
        roleIds: roleIds,
        nickname: null
      });
    }
    
    // Update the server's members array if it exists
    if (Array.isArray(server.members)) {
      await db.collection('servers').updateOne(
        { id: server.id },
        { 
          $addToSet: { members: userId },
          $inc: { memberCount: 1 }
        }
      );
      console.log(`[Join Server API] Updated server's members array with userId: ${userId}`);
    }
    
    // Update the user's servers array if it exists
    if (user) {
      await db.collection('users').updateOne(
        { id: userId },
        { $addToSet: { servers: server.id } }
      );
      console.log(`[Join Server API] Updated user's servers array with serverId: ${server.id}`);
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
