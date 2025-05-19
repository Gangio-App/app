import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

// GET /api/servers/:serverId/emojis - Get custom emojis for a server
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    
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
    
    // Get emojis for the server
    const emojis = await db.collection('server_emojis')
      .find({ serverId })
      .sort({ name: 1 })
      .toArray();
    
    return NextResponse.json({
      emojis
    });
  } catch (error) {
    console.error('Error fetching server emojis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server emojis' },
      { status: 500 }
    );
  }
}

// POST /api/servers/:serverId/emojis - Add custom emoji to server
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { name, imageUrl, userId } = await req.json();
    
    if (!serverId || !name || !imageUrl || !userId) {
      return NextResponse.json(
        { error: 'Server ID, emoji name, image URL, and user ID are required' },
        { status: 400 }
      );
    }
    
    // Validate emoji name (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Emoji name must only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }
    
    // Check if name is too long
    if (name.length > 32) {
      return NextResponse.json(
        { error: 'Emoji name must be 32 characters or less' },
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
    
    // Check if user has permission to add emojis
    const member = await db.collection('serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this server' },
        { status: 403 }
      );
    }
    
    // Check if user has permission
    let hasPermission = server.ownerId === userId; // Owner always has permission
    
    if (!hasPermission) {
      const memberRoles = await db.collection('roles').find({
        id: { $in: member.roleIds || [] },
        serverId
      }).toArray();
      
      hasPermission = memberRoles.some(role => 
        role.permissions?.ADMINISTRATOR || 
        role.permissions?.MANAGE_SERVER
      );
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add emojis' },
        { status: 403 }
      );
    }
    
    // Check if emoji with the same name already exists
    const existingEmoji = await db.collection('server_emojis').findOne({
      serverId,
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive match
    });
    
    if (existingEmoji) {
      return NextResponse.json(
        { error: 'An emoji with this name already exists' },
        { status: 400 }
      );
    }
    
    // Check emoji count limit (50 per server)
    const emojiCount = await db.collection('server_emojis').countDocuments({ serverId });
    
    if (emojiCount >= 50) {
      return NextResponse.json(
        { error: 'Emoji limit reached (maximum 50 per server)' },
        { status: 400 }
      );
    }
    
    // Create new emoji
    const newEmoji = {
      id: uuidv4(),
      serverId,
      name,
      imageUrl,
      creatorId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('server_emojis').insertOne(newEmoji);
    
    return NextResponse.json({
      success: true,
      emoji: newEmoji
    });
  } catch (error) {
    console.error('Error adding server emoji:', error);
    return NextResponse.json(
      { error: 'Failed to add server emoji' },
      { status: 500 }
    );
  }
}

// DELETE /api/servers/:serverId/emojis/:emojiId - Delete a custom emoji
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { emojiId, userId } = await req.json();
    
    if (!serverId || !emojiId || !userId) {
      return NextResponse.json(
        { error: 'Server ID, emoji ID, and user ID are required' },
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
    
    // Check if emoji exists
    const emoji = await db.collection('server_emojis').findOne({
      id: emojiId,
      serverId
    });
    
    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission
    const member = await db.collection('serverMembers').findOne({
      serverId,
      userId
    });
    
    if (!member) {
      return NextResponse.json(
        { error: 'User is not a member of this server' },
        { status: 403 }
      );
    }
    
    let hasPermission = 
      server.ownerId === userId || // Server owner
      emoji.creatorId === userId;  // Emoji creator
    
    if (!hasPermission) {
      const memberRoles = await db.collection('roles').find({
        id: { $in: member.roleIds || [] },
        serverId
      }).toArray();
      
      hasPermission = memberRoles.some(role => 
        role.permissions?.ADMINISTRATOR || 
        role.permissions?.MANAGE_SERVER
      );
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this emoji' },
        { status: 403 }
      );
    }
    
    // Delete the emoji
    await db.collection('server_emojis').deleteOne({
      id: emojiId,
      serverId
    });
    
    return NextResponse.json({
      success: true,
      message: 'Emoji deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting server emoji:', error);
    return NextResponse.json(
      { error: 'Failed to delete server emoji' },
      { status: 500 }
    );
  }
} 
 