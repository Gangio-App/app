import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb'; // Import ObjectId

// Helper function to validate ObjectId string
function isValidObjectId(id: string): boolean {
  try {
    return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params; // The user whose mutual servers we want to see
    const { searchParams } = new URL(req.url);
    const currentUserId = searchParams.get('currentUserId'); // The user making the request
    
    if (!userId || !currentUserId) {
      return NextResponse.json(
        { error: 'Both userId (target) and currentUserId (requester) are required' },
        { status: 400 }
      );
    }

    // Optional: Validate user ID formats if they are expected to be ObjectIds
    // if (!isValidObjectId(userId) || !isValidObjectId(currentUserId)) {
    //   return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    // }
    
    const db = await connectToDatabase();
    
    // --- Assumption: serverMembers.serverId stores the SERVER's ObjectId as a STRING --- 
    // If serverMembers.serverId stores the UUID, this logic needs changing.

    // Find all server IDs (ObjectId strings) for the current user
    const currentUserMemberships = await db.collection('serverMembers')
      .find({ userId: currentUserId })
      .project({ serverId: 1, _id: 0 }) // Only get serverId
      .toArray();
    // Ensure we only deal with valid ObjectId strings that might be stored
    const currentUserServerIds = currentUserMemberships.map(m => m.serverId).filter(id => id && isValidObjectId(id));
    
    // Find all server IDs (ObjectId strings) for the target user
    const targetUserMemberships = await db.collection('serverMembers')
      .find({ userId: userId })
      .project({ serverId: 1, _id: 0 }) // Only get serverId
      .toArray();
    const targetUserServerIds = targetUserMemberships.map(m => m.serverId).filter(id => id && isValidObjectId(id));
    
    // Find intersection of server IDs (these should be valid ObjectId strings)
    const mutualServerIdStrings = currentUserServerIds.filter(id => 
      targetUserServerIds.includes(id) // Already filtered for valid ObjectId strings
    );

    if (mutualServerIdStrings.length === 0) {
        return NextResponse.json({ servers: [] }); // No mutual servers
    }
    
    // Convert valid ObjectId strings to actual ObjectIds for the query
    const mutualServerObjectIds = mutualServerIdStrings.map(idStr => new ObjectId(idStr));
    
    // Get server details using _id
    const mutualServers = await db.collection('servers')
      .find({ _id: { $in: mutualServerObjectIds } })
      .toArray();
    
    // Convert _id back to string for the response
    const serversForClient = mutualServers.map(server => ({
      ...server,
      _id: server._id.toString() // Ensure _id is a string in the response
      // Add any other fields the client needs, potentially removing sensitive ones
    }));
    
    return NextResponse.json({ servers: serversForClient });
  } catch (error) {
    console.error('Error fetching mutual servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutual servers' },
      { status: 500 }
    );
  }
} 
 