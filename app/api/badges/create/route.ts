import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Setup seed badge data
const SEED_BADGES = [
  {
    id: uuidv4(),
    name: 'Founder',
    icon: 'https://i.imgur.com/G74veZP.png', // Gold star icon
    description: 'Founding member of the platform',
    color: '#FFD700'
  },
  {
    id: uuidv4(),
    name: 'Supporter',
    icon: 'https://i.imgur.com/IRFrTDl.png', // Heart icon
    description: 'Supports the platform development',
    color: '#FF6B6B'
  },
  {
    id: uuidv4(),
    name: 'Premium',
    icon: 'https://i.imgur.com/XHRlQq3.png', // Purple badge
    description: 'Premium subscriber with enhanced features',
    color: '#A78BFA'
  },
  {
    id: uuidv4(),
    name: 'Pro',
    icon: 'https://i.imgur.com/8tBDRJY.png', // Pink diamond
    description: 'Pro subscriber with all premium features',
    color: '#F472B6'
  },
  {
    id: uuidv4(),
    name: 'Early Adopter',
    icon: 'https://i.imgur.com/jvKk4MZ.png', // Calendar icon
    description: 'Joined during the early days',
    color: '#38BDF8'
  },
  {
    id: uuidv4(),
    name: '1 Year',
    icon: 'https://i.imgur.com/FG5Gzod.png', // Anniversary icon
    description: 'Member for one year',
    color: '#4ADE80'
  }
];

// POST /api/badges/create - Initialize badges collection
export async function POST(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Check if badges collection already has documents
    const existingBadges = await db.collection('badges').countDocuments();
    
    if (existingBadges > 0) {
      return NextResponse.json({
        message: 'Badges collection already populated',
        count: existingBadges
      });
    }
    
    // Insert all badges
    const result = await db.collection('badges').insertMany(SEED_BADGES);
    
    return NextResponse.json({
      success: true,
      message: `Created ${result.insertedCount} badges in database`,
      badges: SEED_BADGES
    });
  } catch (error) {
    console.error('Error creating badges:', error);
    return NextResponse.json(
      { error: 'Failed to create badges' },
      { status: 500 }
    );
  }
}

// GET /api/badges/create - Get current badges in the database
export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Get all badges
    const badges = await db.collection('badges').find({}).toArray();
    
    return NextResponse.json({
      count: badges.length,
      badges
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    return NextResponse.json(
      { error: 'Failed to get badges' },
      { status: 500 }
    );
  }
} 