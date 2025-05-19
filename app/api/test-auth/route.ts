import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    console.log('Test Auth - Session:', session);
    
    if (!session?.user) {
      return NextResponse.json({ 
        status: 'error',
        message: 'Not authenticated',
        session: null
      }, { status: 401 });
    }
    
    // Get the user ID from the session
    const userId = (session.user as any).id;
    
    // Test database connection
    let dbStatus = 'Not connected';
    let userFound = false;
    let userData = null;
    
    try {
      // Connect to the database
      const db = await connectToDatabase();
      dbStatus = 'Connected';
      
      // Test user collection access
      const usersCollection = getCollection(db, 'users');
      
      // Try to find the user
      const user = await usersCollection.findOne({ id: userId });
      
      if (user) {
        userFound = true;
        // Remove sensitive data
        const { password, ...safeUserData } = user;
        userData = safeUserData;
      }
    } catch (dbError) {
      console.error('Database test error:', dbError);
      dbStatus = `Error: ${dbError instanceof Error ? dbError.message : String(dbError)}`;
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Auth test completed',
      session: {
        exists: true,
        user: {
          id: userId,
          name: session.user.name,
          email: session.user.email
        }
      },
      database: {
        status: dbStatus,
        userFound,
        userData
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
