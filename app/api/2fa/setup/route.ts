import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
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
          // For development/testing, allow a simpler token approach
          // In production, you would verify the JWT properly
          const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token && (token === storedToken || process.env.NODE_ENV === 'development')) {
            // If we're just testing, use a default email
            userEmail = 'test@example.com';
            console.log('Using token auth for 2FA setup');
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
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `gvng.io:${userEmail}`,
      issuer: 'gvng.io'
    });

    // Use a timeout to prevent long-running database operations
    const timeout = 1500; // 1.5 seconds
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    );

    // Check if the user already has 2FA set up
    const userPromise = db.collection('users').findOne({ email: userEmail });
    
    let user: User | null;
    try {
      user = await Promise.race([userPromise, timeoutPromise]) as User | null;
    } catch (error) {
      console.error('Error fetching user for 2FA setup:', error);
      return NextResponse.json(
        { message: 'Database operation timed out, please try again' },
        { status: 503 }
      );
    }
    
    if (user && user.twoFactorSecret) {
      return NextResponse.json(
        { message: 'Two-factor authentication is already set up' },
        { status: 400 }
      );
    }

    // Generate QR code URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

    // Store the temporary secret in the database with a timeout
    const updatePromise = db.collection('users').updateOne(
      { email: userEmail },
      { 
        $set: { 
          tempTwoFactorSecret: secret.base32,
          twoFactorEnabled: false
        } 
      },
      { upsert: false }
    );

    try {
      await Promise.race([updatePromise, timeoutPromise]);
    } catch (error) {
      console.error('Error updating user with temp 2FA secret:', error);
      return NextResponse.json(
        { message: 'Database operation timed out, please try again' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      secret: secret.base32
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { message: 'Failed to set up two-factor authentication' },
      { status: 500 }
    );
  }
}
