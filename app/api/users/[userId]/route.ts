import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

interface Donation {
  userId: string;
  amount: number;
  tier?: string;
  [key: string]: any;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color?: string;
  [key: string]: any;
}

// GET user by ID
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Find user by ID
    const user = await db.collection('users').findOne({ id: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove sensitive information before returning
    const { passwordHash, ...safeUser } = user;
    
    // If user doesn't have badges, check if they should have any based on donations
    if (!safeUser.badges || safeUser.badges.length === 0) {
      // Check donations collection to see if the user has made any donations
      const donations = await db.collection('donations').find({
        userId: userId
      }).toArray() as unknown as Donation[];
      
      if (donations && donations.length > 0) {
        // Get the highest tier donation
        const highestTier = donations.reduce<Donation | null>((highest, current) => {
          if (!highest || (current.tier && current.amount > highest.amount)) {
            return current;
          }
          return highest;
        }, null);
        
        // If there's a highest tier with a badge, find or create that badge
        if (highestTier && highestTier.tier) {
          const badgeIcon = highestTier.tier.toLowerCase();
          let badge = await db.collection('badges').findOne({ icon: badgeIcon }) as Badge | null;
          
          // If badge doesn't exist, create it
          if (!badge) {
            const badgeColors: {[key: string]: string} = {
              supporter: '#FF6B6B',
              premium: '#A78BFA',
              pro: '#F472B6'
            };
            
            const newBadge: Badge = {
              id: Math.random().toString(36).substring(2, 9),
              name: highestTier.tier.charAt(0).toUpperCase() + highestTier.tier.slice(1),
              icon: badgeIcon,
              description: `${highestTier.tier} supporter of Gangio`,
              color: badgeColors[badgeIcon] || '#6D6D6D'
            };
            
            await db.collection('badges').insertOne(newBadge);
            badge = newBadge;
          }
          
          // Add badge to user
          await db.collection('users').updateOne(
            { id: userId },
            { $addToSet: { badges: badge } }
          );
          
          // Update the user object with the new badge
          if (!safeUser.badges) {
            safeUser.badges = [badge];
          } else {
            safeUser.badges.push(badge);
          }
        }
      }
    }
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { 
      bio, 
      pronouns, 
      position, 
      company, 
      status, 
      bannerUrl, 
      avatarUrl 
    } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Construct update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (bio !== undefined) updateData.bio = bio;
    if (pronouns !== undefined) updateData.pronouns = pronouns;
    if (position !== undefined) updateData.position = position;
    if (company !== undefined) updateData.company = company;
    if (status !== undefined) updateData.status = status;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    
    // Update user
    const result = await db.collection('users').updateOne(
      { id: userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
} 
 