import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming your authOptions are here
import { v2 as cloudinary } from 'cloudinary';
import { MongoClient, ObjectId } from 'mongodb'; // Or your User model

// Ensure Cloudinary is configured via environment variables (CLOUDINARY_URL)
// cloudinary.config() will be implicitly called if CLOUDINARY_URL is set.

async function getMongoClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return client;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer to upload to Cloudinary
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    // Using a Promise-based approach for Cloudinary upload as it uses callbacks by default
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars', // Optional: store in a folder named 'avatars'
          public_id: `${userId}_avatar_${Date.now()}`, // Create a unique public_id
          overwrite: true,
          // You can add transformations here if needed, e.g., width, height, crop
          // transformation: [{ width: 250, height: 250, crop: 'limit' }]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      console.error('Cloudinary upload failed:', uploadResult);
      return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
    }

    const newAvatarUrl = uploadResult.secure_url;

    // Update user in MongoDB
    let mongoClient: MongoClient | null = null;
    try {
      mongoClient = await getMongoClient();
      const db = mongoClient.db(process.env.MONGODB_DB_NAME); // Use specific DB name from .env
      const usersCollection = db.collection('users');

      const result = await usersCollection.updateOne(
        { id: userId }, // Assuming your user documents have a unique string 'id' field matching session.user.id
        // If using MongoDB's default _id, you might need: { _id: new ObjectId(userId) } if session.user.id is the ObjectId string
        { $set: { avatarUrl: newAvatarUrl, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Avatar updated successfully', avatarUrl: newAvatarUrl }, { status: 200 });
    } finally {
      if (mongoClient) {
        await mongoClient.close();
      }
    }

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
