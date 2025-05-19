import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;
    
    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size
    const maxSize = type === 'avatar' ? 4 * 1024 * 1024 : 6 * 1024 * 1024; // 4MB for avatar, 6MB for banner
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds the limit (${maxSize / (1024 * 1024)}MB)` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${type}_${session.user.id}_${timestamp}.${fileExtension}`;

    // Connect to MongoDB
    const db = await connectToDatabase();
    
    // Store file in MongoDB GridFS
    const bucket = new ObjectId();
    const result = await db.collection('images').insertOne({
      filename,
      contentType: file.type,
      length: file.size,
      uploadDate: new Date(),
      metadata: {
        userId: session.user.id,
        type
      },
      data: buffer
    });

    // Construct URL for the image
    const imageUrl = `/api/images/${result.insertedId}`;

    // Update user profile with new image URL
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $set: { 
          [`${type}Url`]: imageUrl,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
