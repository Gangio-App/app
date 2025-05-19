import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { differenceInYears } from 'date-fns';

interface AnniversaryBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'anniversary';
  requirement: number; // years
}

const anniversaryBadges: AnniversaryBadge[] = [
  {
    id: 'one-year',
    name: '1 Year',
    description: 'Member for one year',
    icon: '🎂',
    type: 'anniversary',
    requirement: 1
  },
  {
    id: 'two-years',
    name: '2 Years',
    description: 'Member for two years',
    icon: '🎉',
    type: 'anniversary',
    requirement: 2
  },
  {
    id: 'three-years',
    name: '3 Years',
    description: 'Member for three years',
    icon: '🎊',
    type: 'anniversary',
    requirement: 3
  }
];

// GET /api/badges/anniversary - Check and assign anniversary badges to eligible users
export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Get all users with createdAt date
    const users = await db.collection('users')
      .find({ createdAt: { $exists: true } })
      .toArray();
    
    const results = [];
    
    // Get available anniversary badges
    const anniversaryBadges = await db.collection('badges')
      .find({ 
        name: { $regex: /year/i }
      })
      .toArray();
    
    if (!anniversaryBadges.length) {
      return NextResponse.json({
        error: "No anniversary badges found in the database",
        status: 404
      });
    }
    
    // Process each user
    for (const user of users) {
      try {
        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const accountAgeYears = differenceInYears(now, createdAt);
        
        // Only process users with at least 1 year account age
        if (accountAgeYears < 1) continue;
        
        // Find matching badge for this anniversary
        const badgeName = `${accountAgeYears} Year${accountAgeYears > 1 ? 's' : ''}`;
        const matchingBadge = anniversaryBadges.find(
          (badge: AnniversaryBadge) => badge.name.toLowerCase() === badgeName.toLowerCase()
        );
        
        if (!matchingBadge) {
          results.push({
            userId: user.id,
            name: user.name,
            status: 'skipped',
            reason: `No badge found for ${badgeName}`
          });
          continue;
        }
        
        // Check if user already has this badge
        const userBadges = user.badges || [];
        const hasBadge = userBadges.some((b: any) => b.id === matchingBadge.id);
        
        if (hasBadge) {
          results.push({
            userId: user.id,
            name: user.name,
            status: 'skipped',
            reason: 'User already has this badge'
          });
          continue;
        }
        
        // Update user badges
        await db.collection('users').updateOne(
          { id: user.id },
          { 
            $addToSet: { badges: matchingBadge },
            $set: { updatedAt: new Date() }
          }
        );
        
        results.push({
          userId: user.id,
          name: user.name,
          status: 'assigned',
          badge: matchingBadge.name,
          accountAge: `${accountAgeYears} year(s)`
        });
      } catch (err) {
        console.error(`Error processing user ${user.id}:`, err);
        results.push({
          userId: user.id,
          name: user.name,
          status: 'error',
          error: 'Failed to process user'
        });
      }
    }
    
    return NextResponse.json({
      processed: users.length,
      results
    });
  } catch (error) {
    console.error('Error assigning anniversary badges:', error);
    return NextResponse.json(
      { error: 'Failed to assign anniversary badges' },
      { status: 500 }
    );
  }
} 