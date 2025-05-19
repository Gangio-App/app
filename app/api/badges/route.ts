import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/types/models';

// Define badge colors
const BADGE_COLORS = {
  founder: '#FFD700',
  supporter: '#FF6B6B',
  developer: '#5EEAD4',
  premium: '#A78BFA',
  pro: '#F472B6',
  gvng: '#8B5CF6',
  translator: '#4CAF50'
};

// GET /api/badges - Get all badges
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get badges from the database
    const badges = await db.collection('badges').find({}).toArray();
    
    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST /api/badges - Create a new badge
export async function POST(req: NextRequest) {
  try {
    const { name, icon, description, color } = await req.json();
    
    if (!name || !icon) {
      return NextResponse.json(
        { error: 'Badge name and icon are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Create badge data
    const newBadge: Badge = {
      id: uuidv4(),
      name,
      icon,
      description: description || `${name} Badge`,
      color: color || BADGE_COLORS[icon.toLowerCase() as keyof typeof BADGE_COLORS] || '#6D6D6D'
    };
    
    // Insert badge into database
    const result = await db.collection('badges').insertOne(newBadge);
    
    return NextResponse.json({ 
      ...newBadge, 
      _id: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}

// PATCH /api/badges/assign - Assign a badge to a user
export async function PATCH(req: NextRequest) {
  try {
    const { userId, badgeId } = await req.json();
    
    if (!userId || !badgeId) {
      return NextResponse.json(
        { error: 'User ID and Badge ID are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user exists
    const user = await db.collection('users').findOne({ id: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if badge exists
    const badge = await db.collection('badges').findOne({ id: badgeId });
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
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
      message: 'Badge assigned to user successfully'
    });
  } catch (error) {
    console.error('Error assigning badge to user:', error);
    return NextResponse.json(
      { error: 'Failed to assign badge to user' },
      { status: 500 }
    );
  }
} 