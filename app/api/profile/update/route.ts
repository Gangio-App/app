import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { displayName, steamProfileUrl, cs2Rating, gamingRegion } = body;

    // Validate the data
    if (cs2Rating && (isNaN(cs2Rating) || cs2Rating < 0 || cs2Rating > 30000)) {
      return new NextResponse('Invalid CS2 rating', { status: 400 });
    }

    if (steamProfileUrl && !steamProfileUrl.startsWith('https://steamcommunity.com/')) {
      return new NextResponse('Invalid Steam profile URL', { status: 400 });
    }

    const validRegions = ['na_east', 'na_west', 'eu_west', 'eu_east', 'asia', 'sa', 'oce'];
    if (gamingRegion && !validRegions.includes(gamingRegion)) {
      return new NextResponse('Invalid gaming region', { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();

    // Update user profile
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          displayName: displayName || null,
          steamProfileUrl: steamProfileUrl || null,
          cs2Rating: cs2Rating ? parseInt(cs2Rating) : null,
          gamingRegion: gamingRegion || null,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return new NextResponse('User not found', { status: 404 });
    }

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
