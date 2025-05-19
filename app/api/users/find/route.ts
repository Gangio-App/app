import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// GET endpoint for finding a user by username and discriminator
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usernameWithDiscriminator = searchParams.get('identifier');
    
    if (!usernameWithDiscriminator) {
      return NextResponse.json(
        { error: 'Username with discriminator is required (format: username#0000)' },
        { status: 400 }
      );
    }
    
    // Parse the username and discriminator
    const match = usernameWithDiscriminator.match(/^(.+)#(\d{4})$/);
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid format. Expected username#0000' },
        { status: 400 }
      );
    }
    
    const [_, username, discriminator] = match;
    
    const db = await connectToDatabase();
    
    // Find the user by username and discriminator
    const user = await db.collection('users').findOne({
      name: username,
      discriminator: discriminator
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove sensitive information
    const { passwordHash, ...safeUser } = user;
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json(
      { error: 'Failed to find user' },
      { status: 500 }
    );
  }
}

// POST /api/users/find - Find a user by username and discriminator
export async function POST(req: NextRequest) {
  try {
    const { usernameWithDiscriminator } = await req.json();
    
    if (!usernameWithDiscriminator) {
      return NextResponse.json(
        { error: 'Username with discriminator is required (format: username#0000)' },
        { status: 400 }
      );
    }
    
    // Split the username and discriminator
    const parts = usernameWithDiscriminator.split('#');
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid format. Please use username#0000 format' },
        { status: 400 }
      );
    }
    
    const [name, discriminator] = parts;
    
    // Validate discriminator format (4 digits)
    if (!/^\d{4}$/.test(discriminator)) {
      return NextResponse.json(
        { error: 'Discriminator must be a 4-digit number' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Find user by name and discriminator
    const user = await db.collection('users').findOne({ 
      name,
      discriminator
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove sensitive data
    const { passwordHash, ...safeUser } = user;
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json(
      { error: 'Failed to find user' },
      { status: 500 }
    );
  }
} 