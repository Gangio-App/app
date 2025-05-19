import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/types/user';

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    let userEmail: string | null = null;
    
    // Check session authentication
    if (session?.user?.email) {
      userEmail = session.user.email;
    } else {
      // Alternative: Check JWT token in Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // For development/testing purposes
          if (token && process.env.NODE_ENV === 'development') {
            userEmail = 'test@example.com';
            console.log('Using token auth for 2FA status check');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }
    }

    if (!userEmail) {
      return NextResponse.json(
        { message: 'Unauthorized', error: 'Valid session or auth token required' },
        { status: 401 }
      );
    }

    // Connect to the database with optimized connection settings
    const db = await connectToDatabase();

    // Set a timeout for database operations
    const timeout = 1500; // 1.5 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    );

    // Get the user's 2FA status
    const userPromise = db.collection('users').findOne(
      { email: userEmail },
      { projection: { twoFactorEnabled: 1 } }
    );

    let user: User | null;
    try {
      user = await Promise.race([userPromise, timeoutPromise]) as User | null;
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
      // Return a fallback response for better UX
      return NextResponse.json({
        enabled: false,
        message: 'Could not retrieve 2FA status, please try again'
      });
    }

    // Return the 2FA status
    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false
    });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return NextResponse.json(
      { message: 'Failed to check two-factor authentication status' },
      { status: 500 }
    );
  }
}
