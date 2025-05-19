import { NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user ID from the session
    const userId = (session.user as any).id;
    
    if (!userId) {
      return NextResponse.json({ error: 'No user ID in session' }, { status: 400 });
    }
    
    // Connect to the database
    const db = await connectToDatabase();
    const usersCollection = getCollection(db, 'users');
    
    // Find the user in the database
    const user = await usersCollection.findOne({ id: userId });
    
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        sessionUserId: userId
      }, { status: 404 });
    }
    
    // Get the user structure (field names and types)
    const userStructure = Object.entries(user).reduce((acc, [key, value]) => {
      acc[key] = {
        type: typeof value,
        isEmpty: value === null || value === undefined || value === '',
        sample: typeof value === 'object' ? '[Object]' : 
               typeof value === 'string' && value.length > 20 ? 
               `${value.substring(0, 20)}...` : value
      };
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json({
      message: 'User structure retrieved',
      userStructure,
      idField: {
        name: 'id',
        exists: 'id' in user,
        value: user.id
      }
    });
  } catch (error) {
    console.error('Error checking user structure:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
