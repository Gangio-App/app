import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { validatePermission } from '@/lib/permissions';
// ObjectId import removed as we assume string IDs now

// Helper function removed or commented out if no longer needed anywhere else
// function isValidObjectId(id: string): boolean { ... }

// GET /api/servers/:serverId - Get a specific server by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }

    // Validation based on ObjectId format removed
    // if (!isValidObjectId(serverId)) { ... }

    console.log(`[Server API] Fetching server by string ID: ${serverId}`);
    const db = await connectToDatabase();

    // ObjectId conversion removed
    // let serverObjectId: ObjectId; try { ... } catch { ... }

    // Fetch the server
    const serversCollection = getCollection(db, 'servers');
    const server = await serversCollection.findOne({ id: serverId });
    
    if (!server) {
      console.log(`[Server API] Server not found with string ID: ${serverId}`);
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // If userId is provided, check if the user has access to this server
    if (userId) {
      const isOwner = server.ownerId === userId;
      if (!isOwner) {
        // Check if user is a member
        const serverMembersCollection = getCollection(db, 'serverMembers');
        const member = await serverMembersCollection.findOne({ 
          serverId: serverId,
          userId: userId
        });
        
        if (!member) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
      }
    }

    // Fetch categories for this server
    const categoriesCollection = getCollection(db, 'categories');
    const categories = await categoriesCollection.find({ serverId }).sort({ position: 1 }).toArray();
    
    // Fetch channels for this server
    const channelsCollection = getCollection(db, 'channels');
    const channels = await channelsCollection.find({ serverId }).sort({ position: 1 }).toArray();
    console.log(`[Server API] Found ${channels.length} channels for server ${serverId}`);
    
    // Add channels and categories to the server object
    const serverWithData = {
      ...server,
      categories,
      channels
    };
    
    // Count members - this already uses the string serverId, which is good
    const memberCount = await getCollection(db, 'serverMembers')
      .countDocuments({ serverId }); // Assumes serverMembers.serverId is the string ID
    
    console.log(`[Server API] Found server: ${server.name} with ${memberCount} members`);
    
    // Get default channel or first text channel
    // These lookups already use the string serverId, which is consistent now
    let defaultChannel = null;
    if (server.defaultChannelId) {
      defaultChannel = await getCollection(db, 'channels').findOne({ 
        id: server.defaultChannelId, 
        serverId 
      });
    }
    if (!defaultChannel) {
      const channels = await getCollection(db, 'channels')
        .find({ serverId, type: 'text' }) 
        .sort({ position: 1 })
        .limit(1)
        .toArray();
      if (channels && channels.length > 0) {
        defaultChannel = channels[0];
      }
    }

    // Prepare the server data for the response. 
    // If your server document has both _id and id, you might want to decide which to send.
    // Assuming the document fetched by `findOne({ id: serverId })` is what you want.
    // If it still contains _id, you might want to remove it or keep it based on needs.
    const serverDataForClient = {
        ...serverWithData,
        _id: serverWithData._id?.toString(),
        memberCount,
        channels: channels.map(ch => ({ // Explicitly add the fetched channels
            ...ch,
            _id: ch._id?.toString() // Ensure channel ObjectIds are converted too
        }))
    };
    
    // Make sure defaultChannel also doesn't accidentally send ObjectId if it has one
    const defaultChannelForClient = defaultChannel ? {
        ...defaultChannel,
        _id: defaultChannel._id?.toString() // Convert if present
    } : null;

    return NextResponse.json({ 
      server: serverDataForClient,
      defaultChannel: defaultChannelForClient 
      });
  } catch (error) {
    console.error('Error fetching server:', error);
    return NextResponse.json({ error: 'Failed to fetch server details' }, { status: 500 });
  }
}

// PATCH /api/servers/:serverId - Update a server
export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    const body = await req.json();
    const { name, icon, banner, description, isOfficial, userId } = body;
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }
    
    // Validate the serverId format
    // if (!isValidObjectId(serverId)) { ... }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    // ObjectId conversion removed
    // let serverObjectId: ObjectId; try { ... } catch (formatError) { ... }

    // Fetch the server
    const serversCollection = getCollection(db, 'servers');
    const server = await serversCollection.findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    // Check if user is the server owner or has ADMINISTRATOR permission
    const isOwner = server.ownerId === userId;
    let hasPermission = isOwner;
    
    if (!isOwner) {
      // Check for ADMINISTRATOR permission
      const hasAdminPermission = await validatePermission(db, serverId, userId, 'ADMINISTRATOR');
      hasPermission = hasAdminPermission;
      
      if (!hasPermission) {
        // Check for MANAGE_SERVER permission
        const hasManageServerPermission = await validatePermission(db, serverId, userId, 'MANAGE_SERVER');
        hasPermission = hasManageServerPermission;
      }
    }
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to update this server' }, { status: 403 });
    }
    
    // Build update object
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (banner !== undefined) updateData.banner = banner;
    if (description !== undefined) updateData.description = description;
    
    // Only server owner can change isOfficial status
    if (isOfficial !== undefined && isOwner) {
      updateData.isOfficial = isOfficial;
    }
    
    // Update the server
    await serversCollection.updateOne(
      { id: serverId },
      { $set: updateData }
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Server updated successfully'
    });
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json({ error: 'Failed to update server' }, { status: 500 });
  }
}

// DELETE /api/servers/:serverId - Delete a server
export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    const body = await req.json();
    const { userId } = body;
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID is required' }, { status: 400 });
    }

    // Validate the serverId format
    // if (!isValidObjectId(serverId)) { ... }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    // ObjectId conversion removed
    // let serverObjectId: ObjectId; try { ... } catch (formatError) { ... }

    // Fetch the server
    const serversCollection = getCollection(db, 'servers');
    const server = await serversCollection.findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    
    // Check if user is the server owner
    if (server.ownerId !== userId) {
      return NextResponse.json({ error: 'Only the server owner can delete the server' }, { status: 403 });
    }
    
    // Delete all related data in transaction or series
    // 1. Delete server members
    await getCollection(db, 'serverMembers').deleteMany({ serverId });
    
    // 2. Delete roles
    await getCollection(db, 'roles').deleteMany({ serverId });
    
    // 3. Delete categories
    await getCollection(db, 'categories').deleteMany({ serverId });
    
    // 4. Delete channels and their messages
    const channels = await getCollection(db, 'channels').find({ serverId }).toArray();
    for (const channel of channels) {
      await getCollection(db, 'messages').deleteMany({ channelId: channel.id });
    }
    await getCollection(db, 'channels').deleteMany({ serverId });
    
    // 5. Finally delete the server
    await serversCollection.deleteOne({ id: serverId });
    
    return NextResponse.json({ 
      success: true,
      message: 'Server and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 });
  }
} 