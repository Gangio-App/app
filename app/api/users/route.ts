import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '@/types/models';

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get users from the database
    const users = await db.collection('users').find({}).toArray();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, discriminator, avatarUrl } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if a user with the same name and discriminator already exists
    const existingUser = await db.collection('users').findOne({ 
      name, 
      discriminator: discriminator || '0000'
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this name and discriminator already exists' },
        { status: 400 }
      );
    }
    
    // Generate a random discriminator if not provided
    const userDiscriminator = discriminator || Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create user data
    const newUser: Partial<User> = {
      id: uuidv4(),
      name,
      discriminator: userDiscriminator,
      email,
      // In a real app, you would hash the password here
      // passwordHash: await bcrypt.hash(password, 10),
      passwordHash: password, // For demo purposes only, not secure!
      avatarUrl,
      status: 'online' as UserStatus,
      isBot: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert user into database
    const result = await db.collection('users').insertOne(newUser);
    
    // Return the new user without the password hash
    const { passwordHash, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({ 
      ...userWithoutPassword, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user status
export async function PATCH(req: NextRequest) {
  try {
    const { userId, status } = await req.json();
    
    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }
    
    const validStatuses: UserStatus[] = ['online', 'idle', 'dnd', 'offline'];
    if (!validStatuses.includes(status as UserStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Update user status
    const result = await db.collection('users').updateOne(
      { id: userId },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
} 