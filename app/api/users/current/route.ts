import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log('Current user session:', session ? 'exists' : 'null');
    
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
    
    try {
      // Connect to the database
      console.log('Connecting to database...');
      const db = await connectToDatabase();
      console.log('Database connected');
      
      const usersCollection = getCollection(db, 'users');
      console.log('Got users collection');
      
      // Find the user in the database
      console.log('Finding user with ID:', userId);
      const user = await usersCollection.findOne({ id: userId });
      
      if (!user) {
        console.log('User not found in database');
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      console.log('User found, has Steam ID:', user.steamId ? 'yes' : 'no');
      
      // Return the user data (excluding sensitive information)
      const { password, ...userData } = user;
      
      return NextResponse.json(userData);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        error: 'Database error', 
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
