import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

// GET /api/servers/:serverId/icon - Get server icon
export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId;
    
    if (!serverId) {
      return NextResponse.json(
        { error: 'Server ID is required' },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    const server = await getCollection(db, 'servers').findOne({ id: serverId });
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }
    
    // If server has no icon, return 404
    if (!server.icon) {
      return NextResponse.json(
        { error: 'Server has no icon' },
        { status: 404 }
      );
    }
    
    // If icon is a base64 string, return it as an image
    if (typeof server.icon === 'string' && server.icon.startsWith('data:image/')) {
      // Extract the content type and base64 data
      const matches = server.icon.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Return the image with the appropriate content type
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          },
        });
      }
    }
    
    // If icon is a URL, redirect to it
    if (typeof server.icon === 'string' && (server.icon.startsWith('http://') || server.icon.startsWith('https://'))) {
      return NextResponse.redirect(server.icon);
    }
    
    // If we get here, the icon format is not supported
    return NextResponse.json(
      { error: 'Unsupported icon format' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error fetching server icon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server icon' },
      { status: 500 }
    );
  }
}
