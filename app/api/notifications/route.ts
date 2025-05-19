import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/db';

// Notification types
export type NotificationType = 
  | 'MENTION'           // User mentioned in a message
  | 'REACTION'          // Reaction to user's message
  | 'FRIEND_REQUEST'    // Friend request received
  | 'FRIEND_ACCEPT'     // Friend request accepted
  | 'ROLE_CHANGED'      // User's role changed in server
  | 'SERVER_INVITE'     // Invited to a server
  | 'CHANNEL_MESSAGE'   // New message in a channel the user is watching
  | 'DIRECT_MESSAGE'    // New direct message

// Get current user from session helper
async function getCurrentUser(request: NextRequest) {
  // Get user ID from request headers or cookies as appropriate for your auth setup
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return null;
  }
  
  const client = await clientPromise;
  const db = client.db();
  
  // Get user from database
  const user = await db.collection('users').findOne({ id: userId });
  return user;
}

// GET /api/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Ensure the user can only access their own notifications
    if (userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    const notifications = await db.collection('notifications')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    // Convert MongoDB ObjectId to string for each notification
    const formattedNotifications = notifications.map((notification: any) => ({
      ...notification,
      id: notification._id.toString(),
      _id: undefined
    }));
    
    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST /api/notifications - Create a new notification
export async function POST(req: NextRequest) {
  try {
    const { 
      userId, 
      type, 
      actorId, 
      messageId, 
      serverId, 
      channelId, 
      roleId,
      content
    } = await req.json();
    
    if (!userId || !type) {
      return NextResponse.json(
        { error: 'User ID and notification type are required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Create notification
    const notification = {
      id: uuidv4(),
      userId,
      type,
      actorId,
      messageId,
      serverId,
      channelId,
      roleId,
      content,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('notifications').insertOne(notification);
    
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/:notificationId - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const body = await request.json();
    const { userId, read } = body;
    
    // Ensure the user can only update their own notifications
    if (userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    // Update all user's notifications to read
    const result = await db.collection('notifications').updateMany(
      { userId: userId, read: false },
      { $set: { read: true } }
    );
    
    return NextResponse.json({ 
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('[NOTIFICATIONS_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(req: NextRequest) {
  try {
    const { notificationId, userId, clearAll = false } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    if (!clearAll && !notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required unless clearing all notifications' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    
    if (clearAll) {
      // Delete all notifications for the user
      await db.collection('notifications').deleteMany({ userId });
      
      return NextResponse.json({
        success: true,
        message: 'All notifications cleared'
      });
    } else {
      // Delete single notification
      const result = await db.collection('notifications').deleteOne({
        id: notificationId,
        userId
      });
      
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Notification not found or does not belong to this user' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Notification deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
} 