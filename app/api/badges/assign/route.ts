import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

// POST /api/badges/assign - Assign a badge to a user
export async function POST(req: NextRequest) {
  try {
    const { userId, badgeName } = await req.json();
    
    if (!userId || !badgeName) {
      return NextResponse.json(
        { error: 'User ID and badge name are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if user exists
    const user = await db.collection('users').findOne({ id: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find badge by name (case insensitive)
    const badge = await db.collection('badges').findOne({ 
      name: { $regex: new RegExp(`^${badgeName}$`, 'i') }
    });
    
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has this badge
    const userBadges = user.badges || [];
    const hasBadge = userBadges.some((b: any) => b.id === badge.id);
    
    if (hasBadge) {
      return NextResponse.json({
        success: false,
        message: 'User already has this badge'
      });
    }
    
    // Update user badges
    const result = await db.collection('users').updateOne(
      { id: userId },
      { 
        $addToSet: { badges: badge },
        $set: { updatedAt: new Date() }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Badge "${badge.name}" assigned to user successfully`,
      userId,
      badge
    });
  } catch (error) {
    console.error('Error assigning badge to user:', error);
    return NextResponse.json(
      { error: 'Failed to assign badge to user' },
      { status: 500 }
    );
  }
}

// GET /api/badges/assign - Get all users with their badges
export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Get all users with badges
    const users = await db.collection('users')
      .find({ badges: { $exists: true, $ne: [] } })
      .project({ id: 1, name: 1, discriminator: 1, badges: 1 })
      .toArray();
    
    return NextResponse.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error getting users with badges:', error);
    return NextResponse.json(
      { error: 'Failed to get users with badges' },
      { status: 500 }
    );
  }
} 