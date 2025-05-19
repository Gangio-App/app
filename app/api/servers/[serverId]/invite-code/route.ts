import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/servers/:serverId/invite-code - Generate a new invite code for a server
export async function POST(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { userId } = await req.json();
    
    if (!serverId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Server ID and user ID are required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Check if server exists
    const server = await db.collection('servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { success: false, error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the server owner
    if (server.ownerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the server owner can generate a new invite code' },
        { status: 403 }
      );
    }
    
    // Generate new invite code
    const inviteCode = uuidv4().substring(0, 8);
    
    // Update server with new invite code
    await db.collection('servers').updateOne(
      { id: serverId },
      { 
        $set: { 
          inviteCode,
          updatedAt: new Date()
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      inviteCode
    });
  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invite code' },
      { status: 500 }
    );
  }
} 