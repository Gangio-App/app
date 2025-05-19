import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import * as speakeasy from 'speakeasy';
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
          // For development/testing, allow a simpler token approach
          // In production, you would verify the JWT properly
          if (token && process.env.NODE_ENV === 'development') {
            // If we're just testing, use a default email
            userEmail = 'test@example.com';
            console.log('Using token auth for 2FA verification');
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

    // Extract the token and secret from the request
    const { token, secret } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Connect to the database with optimized connection settings
    const db = await connectToDatabase();
    
    // Set a timeout for database operations
    const timeout = 1500; // 1.5 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    );

    // Get the user
    const userPromise = db.collection('users').findOne({ email: userEmail });
    
    let user: User | null;
    try {
      user = await Promise.race([userPromise, timeoutPromise]) as User | null;
    } catch (error) {
      console.error('Error fetching user for 2FA verification:', error);
      return NextResponse.json(
        { message: 'Database operation timed out, please try again' },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Use the provided secret or the temporary one from the database
    const secretToVerify = secret || user.tempTwoFactorSecret;

    if (!secretToVerify) {
      return NextResponse.json(
        { message: 'No 2FA setup in progress' },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secretToVerify,
      encoding: 'base32',
      token: token,
      window: 2 // Allow some time skew (2 periods = 1 minute)
    });

    if (!verified) {
      return NextResponse.json({
        verified: false,
        message: 'Invalid verification code'
      });
    }

    // If the token is valid and this is a setup process, enable 2FA
    if (user.tempTwoFactorSecret && !user.twoFactorEnabled) {
      const updatePromise = db.collection('users').updateOne(
        { email: userEmail },
        {
          $set: {
            twoFactorSecret: user.tempTwoFactorSecret,
            twoFactorEnabled: true
          },
          $unset: {
            tempTwoFactorSecret: 1
          }
        }
      );

      try {
        await Promise.race([updatePromise, timeoutPromise]);
      } catch (error) {
        console.error('Error updating 2FA status:', error);
        return NextResponse.json(
          { message: 'Database operation timed out, please try again' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      verified: true,
      message: 'Verification successful'
    });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return NextResponse.json(
      { message: 'Failed to verify authentication code' },
      { status: 500 }
    );
  }
}
