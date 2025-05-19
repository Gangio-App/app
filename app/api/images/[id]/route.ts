import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// GET /api/images/[id] - Get an image by its ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    const db = await connectToDatabase();

    // Find the image by ID
    const image = await db.collection('images').findOne({
      _id: new ObjectId(params.id)
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Create response with proper content type and cache headers
    const response = new NextResponse(image.data.buffer, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': image.length.toString()
      }
    });

    return response;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
