import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    const { userId, steamId } = body;
    
    console.log('Client update - User ID:', userId);
    console.log('Client update - Steam ID:', steamId);
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
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
    
    try {
      // Connect to the database
      console.log('Connecting to database...');
      const db = await connectToDatabase();
      console.log('Database connected');
      
      const usersCollection = getCollection(db, 'users');
      console.log('Got users collection');
      
      // Try to find the user by ID
      const user = await usersCollection.findOne({ id: userId });
      
      if (!user) {
        console.log('User not found with ID:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      console.log('User found:', user.id);
      
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
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ id: userId });
      console.log('Updated user:', updatedUser ? 'found' : 'not found');
      console.log('Updated user Steam ID:', updatedUser?.steamId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Steam ID updated successfully',
        steamId: updatedUser?.steamId
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
