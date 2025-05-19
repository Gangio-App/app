import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Find the user
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      console.log(`[Join Server API] User not found: ${userId}`);
      return NextResponse.json(
        { error: 'User not found' },
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
    const serverMemberResult = await db.collection('serverMembers').insertOne({
      id: uuidv4(), // Generate a unique ID for this membership
      serverId: server.id,
      userId: userId,
      joinedAt: new Date(),
      roleIds: roleIds,
      nickname: null
    });
    
    console.log(`[Join Server API] Added user ${userId} to serverMembers collection with ID: ${serverMemberResult.insertedId}`);
    
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
