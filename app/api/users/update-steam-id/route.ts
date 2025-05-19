import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user identifiers from session
    const userId = (session.user as any).id;
    const userEmail = session.user.email;
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'No user identifier found in session' 
      }, { status: 400 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { steamId } = body;
    
    if (!steamId) {
      return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
    }
    
    // Validate Steam ID format (should be a 17-digit number)
    const steamIdRegex = /^[0-9]{17}$/;
    if (!steamIdRegex.test(steamId)) {
      return NextResponse.json({ 
        error: 'Invalid Steam ID format. Steam ID should be a 17-digit number.' 
      }, { status: 400 });
    }
    
    // Connect to the database
    const db = await connectToDatabase();
    const usersCollection = getCollection(db, 'users');
    
    // Build query to find the user - try multiple fields
    const query: any = {};
    if (userId) query.id = userId;
    if (userEmail) query.email = userEmail;
    
    // Check if the user exists
    const user = await usersCollection.findOne(query);
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        query 
      }, { status: 404 });
    }
    
    // Check if the Steam ID is already linked to another user
    const existingSteamUser = await usersCollection.findOne({ 
      steamId,
      _id: { $ne: user._id } // Use MongoDB _id for reliable comparison
    });
    
    if (existingSteamUser) {
      return NextResponse.json({ 
        error: 'This Steam ID is already linked to another account' 
      }, { status: 400 });
    }
    
    // Update the user's Steam ID
    const result = await usersCollection.updateOne(
      { _id: user._id }, // Use MongoDB _id for reliable update
      { $set: { steamId, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found for update' }, { status: 404 });
    }
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ _id: user._id });
    
    return NextResponse.json({ 
      success: true,
      message: 'Steam ID updated successfully',
      steamId: updatedUser?.steamId
    });
  } catch (error) {
    console.error('Error updating Steam ID:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
