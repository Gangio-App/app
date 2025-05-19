import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

// Valid status types
type UserStatus = 'online' | 'idle' | 'dnd' | 'offline' | 'focus' | 'invisible';

// Helper function to update status in MongoDB
async function updateStatusInMongoDB(userId: string, status: UserStatus, client: MongoClient) {
  const db = client.db();
  
  try {
    // Update user status
    const result = await db.collection('users').updateOne(
      { id: userId },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );
    
    // Also update all server members with this user ID
    await db.collection('serverMembers').updateMany(
      { userId },
      {
        $set: {
          'user.status': status,
          updatedAt: new Date()
        }
      }
    );
    
    return result;
  } catch (error) {
    console.error('MongoDB status update error:', error);
    throw error;
  }
}

// PATCH /api/users/status - Update user status
export async function PATCH(req: NextRequest) {
  try {
    const { userId, status } = await req.json();
    
    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }
    
    const validStatuses: UserStatus[] = ['online', 'idle', 'dnd', 'offline', 'focus', 'invisible'];
    if (!validStatuses.includes(status as UserStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    
    // Update user status in MongoDB using the helper function
    const result = await updateStatusInMongoDB(userId, status as UserStatus, client);
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Publish status update to any connected clients
    // This would typically be done via WebSockets or Server-Sent Events
    // For now, we just return success
    
    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}

// POST /api/users/status - Alias for PATCH for compatibility
export async function POST(req: NextRequest) {
  return PATCH(req);
}