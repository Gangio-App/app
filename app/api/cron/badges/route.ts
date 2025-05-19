import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { differenceInYears } from 'date-fns';

// This route handles scheduled badge assignments
// Can be triggered by a cron job service like Vercel Cron
export async function GET(req: NextRequest) {
  // Verify cron job auth token (if your cron service supports it)
  const authHeader = req.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET_TOKEN;
  
  if (expectedToken && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== expectedToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await checkAndAssignAnniversaryBadges();
    
    return NextResponse.json({
      success: true,
      message: 'Badge check completed successfully',
      results
    });
  } catch (error) {
    console.error('Error running scheduled badge check:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduled badge check' },
      { status: 500 }
    );
  }
}

// Type definitions for the result details
type BadgeCheckResult = 
  | { userId: string; name: string; status: 'skipped'; reason: string }
  | { userId: string; name: string; status: 'assigned'; badge: string; accountAge: string }
  | { userId: string; status: 'error'; error: string };

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

interface AnniversaryBadge extends Badge {
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

// Function to check and assign anniversary badges
async function checkAndAssignAnniversaryBadges() {
  const db = await connectToDatabase();
  
  // Get all users with createdAt date
  const users = await db.collection('users')
    .find({ createdAt: { $exists: true } })
    .toArray();
  
  const results = {
    processed: users.length,
    assigned: 0,
    skipped: 0,
    errors: 0,
    details: [] as BadgeCheckResult[]
  };
  
  // Get available anniversary badges
  const dbBadges = await db.collection('badges')
    .find({ 
      name: { $regex: /year/i }
    })
    .toArray();
  
  if (!dbBadges.length) {
    throw new Error("No anniversary badges found in the database");
  }
  
  // Process each user
  for (const user of users) {
    try {
      const createdAt = new Date(user.createdAt);
      const now = new Date();
      const accountAgeYears = differenceInYears(now, createdAt);
      
      // Only process users with at least 1 year account age
      if (accountAgeYears < 1) {
        results.skipped++;
        results.details.push({
          userId: user.id,
          name: user.name,
          status: 'skipped' as const,
          reason: `No badge found for ${accountAgeYears} year(s)`
        });
        continue;
      }
      
      // Find matching badge for this anniversary
      const badgeName = `${accountAgeYears} Year${accountAgeYears > 1 ? 's' : ''}`;
      const matchingBadge = dbBadges.find(
        (        badge: { name: string; }) => badge.name.toLowerCase() === badgeName.toLowerCase()
      );
      
      if (!matchingBadge) {
        results.skipped++;
        results.details.push({
          userId: user.id,
          name: user.name,
          status: 'skipped' as const,
          reason: `No badge found for ${badgeName}`
        });
        continue;
      }
      
      // Check if user already has this badge
      const userBadges = user.badges || [];
      const hasBadge = userBadges.some((b: any) => b.id === matchingBadge.id);
      
      if (hasBadge) {
        results.skipped++;
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
      
      results.assigned++;
      results.details.push({
        userId: user.id,
        name: user.name,
        status: 'assigned' as const,
        badge: matchingBadge.name,
        accountAge: `${accountAgeYears} year(s)`
      });
    } catch (err) {
      console.error(`Error processing user ${user.id}:`, err);
      results.errors++;
      results.details.push({
        userId: user.id,
        status: 'error' as const,
        error: 'Failed to process user'
      });
    }
  }
  
  return results;
}