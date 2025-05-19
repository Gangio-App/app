import { NextRequest, NextResponse } from 'next/server';

// Using Tenor API v2
const TENOR_API_KEY = process.env.TENOR_API_KEY || 'LIVESDK-KEY'; // Replace with your actual Tenor API key
const TENOR_API_BASE = 'https://tenor.googleapis.com/v2';

// Route segment config
export const dynamic = 'force-dynamic';

// GET /api/gifs/trending - Get trending GIFs
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';
    const position = searchParams.get('position') || '';
    
    // Build trending URL
    let url = `${TENOR_API_BASE}/trending?key=${TENOR_API_KEY}&limit=${limit}&media_filter=minimal`;
    
    // Add position for pagination if provided
    if (position) {
      url += `&pos=${position}`;
    }
    
    // Fetch GIFs from Tenor
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Tenor API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the response to a simpler format
    const gifs = data.results.map((gif: any) => ({
      id: gif.id,
      title: gif.title,
      previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.nanogif?.url,
      gifUrl: gif.media_formats.mediumgif?.url || gif.media_formats.gif?.url,
      mp4Url: gif.media_formats.mp4?.url,
      webmUrl: gif.media_formats.webm?.url,
      width: gif.media_formats.gif?.dims?.[0] || 0,
      height: gif.media_formats.gif?.dims?.[1] || 0,
    }));
    
    return NextResponse.json({
      gifs,
      next: data.next || '', // For pagination
    });
  } catch (error) {
    console.error('Error fetching trending GIFs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending GIFs' },
      { status: 500 }
    );
  }
} 