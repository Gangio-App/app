import { NextResponse } from 'next/server';
import { getSteamPlayerSummary } from '@/lib/steamApi';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Try multiple authentication methods
    let userId: string | undefined;
    
    // Method 1: Get the current user session
    const session = await getServerSession(authOptions);
    if (session?.user) {
      userId = (session.user as any).id;
      console.log('[Steam API] Using user ID from session:', userId);
    }
    
    // Method 2: Check for user ID in query parameters
    if (!userId) {
      const url = new URL(req.url);
      const queryUserId = url.searchParams.get('userId');
      if (queryUserId) {
        userId = queryUserId;
        console.log('[Steam API] Using user ID from query parameter:', userId);
      }
    }
    
    // Method 3: Check Authorization header
    if (!userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('[Steam API] Using user ID from Authorization header:', userId);
      }
    }
    
    // If no authentication found, return unauthorized
    if (!userId) {
      console.log('[Steam API] No authentication found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    const db = await connectToDatabase();
    const usersCollection = getCollection(db, 'users');
    
    // Find the user in the database
    const user = await usersCollection.findOne({ id: userId });
    
    if (!user) {
      console.log(`[Steam API] User not found with ID: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if the user has a Steam ID
    if (!user.steamId) {
      return NextResponse.json({ error: 'No Steam ID connected' }, { status: 404 });
    }
    
    // Get the Steam player summary
    const steamData = await getSteamPlayerSummary(user.steamId);
    
    if (!steamData) {
      return NextResponse.json({ error: 'Failed to fetch Steam data' }, { status: 500 });
    }
    
    return NextResponse.json(steamData);
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'exists' : 'null');
    
    if (!session?.user) {
      console.log('No user in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user ID from the session
    const userId = (session.user as any).id;
    console.log('User ID from session:', userId);
    
    if (!userId) {
      console.log('No user ID found in session');
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }
    
    // Parse the request body
    const body = await req.json();
    const { steamId } = body;
    console.log('Received Steam ID:', steamId);
    
    if (!steamId) {
      console.log('No Steam ID provided');
      return NextResponse.json({ error: 'Steam ID is required' }, { status: 400 });
    }
    
    // Validate Steam ID format (should be a 17-digit number)
    const steamIdRegex = /^[0-9]{17}$/;
    if (!steamIdRegex.test(steamId)) {
      console.log('Invalid Steam ID format:', steamId);
      return NextResponse.json({ 
        error: 'Invalid Steam ID format. Steam ID should be a 17-digit number.' 
      }, { status: 400 });
    }
    
    try {
      // Connect to the database
      console.log('Connecting to database...');
      const db = await connectToDatabase();
      console.log('Database connected');
      
      const usersCollection = getCollection(db, 'users');
      console.log('Got users collection');
      
      // First check if the user exists
      const userExists = await usersCollection.findOne({ id: userId });
      if (!userExists) {
        console.log('User not found in database:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.log('User found in database');
      
      // Check if the Steam ID is already linked to another user
      const existingSteamUser = await usersCollection.findOne({ 
        steamId, 
        id: { $ne: userId } 
      });
      
      if (existingSteamUser) {
        console.log('Steam ID already linked to another account');
        return NextResponse.json({ 
          error: 'This Steam ID is already linked to another account' 
        }, { status: 400 });
      }
      
      // Update the user's Steam ID
      console.log('Updating user with Steam ID...');
      const result = await usersCollection.updateOne(
        { id: userId },
        { $set: { steamId, updatedAt: new Date() } }
      );
      
      console.log('Update result:', result);
      
      if (result.matchedCount === 0) {
        console.log('No user matched for update');
        return NextResponse.json({ error: 'User not found for update' }, { status: 404 });
      }
      
      if (result.modifiedCount === 0) {
        console.log('No modification made (possibly same Steam ID)');
        // This could happen if the user already had this Steam ID
        // We'll still consider this a success
      }
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ id: userId });
      console.log('Updated user:', updatedUser ? 'found' : 'not found');
      console.log('Updated user Steam ID:', updatedUser?.steamId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Steam ID updated successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Database error', 
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating Steam ID:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
