import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    const { serverId, channelId } = params;

    // Check if serverId and channelId are provided
    if (!serverId || !channelId) {
      return NextResponse.json(
        { success: false, message: 'Server ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Fetch the channel
    const channel = await db.collection('channels').findOne({
      id: channelId,
      serverId: serverId,
    });

    // Check if channel exists
    if (!channel) {
      return NextResponse.json(
        { success: false, message: 'Channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch channel details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    const { serverId, channelId } = params;
    const { name, categoryId } = await req.json();

    // Check if serverId and channelId are provided
    if (!serverId || !channelId) {
      return NextResponse.json(
        { success: false, message: 'Server ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Check if the channel exists
    const channel = await db.collection('channels').findOne({
      id: channelId,
      serverId: serverId,
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, message: 'Channel not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (categoryId) updateData.categoryId = categoryId;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the channel
    await db.collection('channels').updateOne(
      { id: channelId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    // Fetch the updated channel
    const updatedChannel = await db.collection('channels').findOne({
      id: channelId,
    });

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update channel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serverId: string; channelId: string } }
) {
  try {
    const { serverId, channelId } = params;

    // Check if serverId and channelId are provided
    if (!serverId || !channelId) {
      return NextResponse.json(
        { success: false, message: 'Server ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Check if the channel exists
    const channel = await db.collection('channels').findOne({
      id: channelId,
      serverId: serverId,
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, message: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check if this is the last channel in the server (prevent deleting last channel)
    const channelCount = await db.collection('channels').countDocuments({
      serverId: serverId,
    });

    if (channelCount <= 1) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete the last channel in the server' },
        { status: 400 }
      );
    }

    // Delete the channel
    await db.collection('channels').deleteOne({ id: channelId });

    // Delete all messages in this channel
    try {
      await db.collection('messages').deleteMany({ channelId });
      console.log(`Deleted all messages for channel ${channelId}`);
    } catch (messageError) {
      console.error(`Error deleting messages for channel ${channelId}:`, messageError);
      // Continue with deletion even if message deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'Channel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete channel' },
      { status: 500 }
    );
  }
} 