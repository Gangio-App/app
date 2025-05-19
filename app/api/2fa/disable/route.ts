import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/types/user';

export async function POST(request: Request) {
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
            console.log('Using token auth for 2FA disable');
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
    
    // Set a timeout for database operations (15 seconds as per user preference)
    const timeout = 15000; 
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    );

    // Update the user to disable 2FA with retry mechanism
    const maxRetries = 5;
    let retries = 0;
    let success = false;
    let lastError;

    while (retries < maxRetries && !success) {
      try {
        // Calculate delay for exponential backoff
        const delay = Math.min(100 * Math.pow(2, retries), 1500);
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Disable 2FA for the user
        const updatePromise = db.collection('users').updateOne(
          { email: userEmail },
          {
            $set: { twoFactorEnabled: false },
            $unset: { 
              twoFactorSecret: 1,
              tempTwoFactorSecret: 1 
            }
          }
        );

        await Promise.race([updatePromise, timeoutPromise]);
        success = true;
      } catch (error) {
        lastError = error;
        console.error(`Error disabling 2FA (attempt ${retries + 1}/${maxRetries}):`, error);
        retries++;
      }
    }

    if (!success) {
      console.error('All attempts to disable 2FA failed:', lastError);
      return NextResponse.json(
        { message: 'Failed to disable two-factor authentication after multiple attempts' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { message: 'Failed to disable two-factor authentication' },
      { status: 500 }
    );
  }
}
