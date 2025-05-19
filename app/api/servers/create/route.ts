import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Server } from '@/types/models';

// POST /api/servers/create - Create a new server with better error handling
export async function POST(req: NextRequest) {
  try {
    const { name, description, icon, banner, ownerId, roles } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Server name is required' },
        { status: 400 }
      );
    }
    
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[Server Create API] Creating new server "${name}" for owner ${ownerId}`);
    const db = await connectToDatabase();
    
    // Check if user exists
    const owner = await getCollection(db, 'users').findOne({ id: ownerId });
    
    if (!owner) {
      console.error(`[Server Create API] Owner with ID ${ownerId} not found`);
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      );
    }
    
    // Create server data
    const newServer: Partial<Server> = {
      id: uuidv4(),
      name,
      description,
      ownerId,
      icon: icon || undefined,
      banner: banner || undefined,
      inviteCode: uuidv4().substring(0, 8),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert server into database
    const result = await getCollection(db, 'servers').insertOne(newServer);
    
    console.log(`[Server Create API] Created server with ID: ${newServer.id}`);
    
    // Create a default "General" category
    const generalCategory = {
      id: uuidv4(),
      name: 'GENERAL',
      serverId: newServer.id,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await getCollection(db, 'categories').insertOne(generalCategory);
    
    // Create default channels
    const defaultChannels = [
      {
        id: uuidv4(),
        name: 'welcome',
        type: 'text',
        serverId: newServer.id,
        categoryId: generalCategory.id,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'general',
        type: 'text',
        serverId: newServer.id,
        categoryId: generalCategory.id,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Voice Chat',
        type: 'voice',
        serverId: newServer.id,
        categoryId: generalCategory.id,
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    await getCollection(db, 'channels').insertMany(defaultChannels);
    
    // Create default '@everyone' role
    const everyoneRole = {
      id: uuidv4(),
      name: '@everyone',
      color: '#99AAB5',
      serverId: newServer.id,
      permissions: ['READ_MESSAGES', 'SEND_MESSAGES', 'CONNECT'],
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await getCollection(db, 'roles').insertOne(everyoneRole);
    
    // Add custom roles if provided
    if (roles && Array.isArray(roles) && roles.length > 0) {
      const customRoles = roles.map((role, index) => ({
        id: uuidv4(),
        name: role.name,
        color: role.color || '#99AAB5',
        serverId: newServer.id,
        permissions: role.permissions || [],
        position: index + 1, // Position starts at 1 since @everyone is at position 0
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      if (customRoles.length > 0) {
        await getCollection(db, 'roles').insertMany(customRoles);
      }
    }
    
    // Add owner as a member of the server with the @everyone role
    const serverMember = {
      userId: ownerId,
      serverId: newServer.id,
      roleIds: [everyoneRole.id],
      joinedAt: new Date(),
    };
    
    // Use the correct collection name 'serverMembers'
    await getCollection(db, 'serverMembers').insertOne(serverMember);
    
    // Return the new server with the default channel ID for immediate navigation
    const defaultChannel = defaultChannels[1]; // "general" channel
    
    return NextResponse.json({ 
      server: {
        ...newServer,
        _id: result.insertedId
      },
      defaultChannelId: defaultChannel.id,
    });
  } catch (error) {
    console.error('[Server Create API] Error creating server:', error);
    return NextResponse.json(
      { error: 'Failed to create server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 