import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { cookies } from 'next/headers';

// Route segment config
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Get auth cookie
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    const db = await connectToDatabase();
    
    // Find user by token (in a real app, you'd verify a JWT token)
    // This is a simplified version
    const user = await db.collection('users').findOne(
      { authToken },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      // Clear invalid cookie
      cookieStore.delete('auth_token');
      
      return NextResponse.json(
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }
    
    // Return user data (excluding sensitive info)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      discriminator: user.discriminator,
      status: user.status || 'online',
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication check failed' },
      { status: 500 }
    );
  }
} 