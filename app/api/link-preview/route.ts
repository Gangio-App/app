import { NextRequest, NextResponse } from 'next/server';

// Helper function to extract metadata from HTML without external libraries
function extractMetadata(html: string) {
  const getTag = (regex: RegExp): string | null => {
    const match = html.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  return {
    title: getTag(/<title[^>]*>([^<]+)<\/title>/i) || 
           getTag(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["'][^>]*>/i),
    description: getTag(/<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i) || 
                 getTag(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["'][^>]*>/i),
    image: getTag(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["'][^>]*>/i) || 
           getTag(/<meta\s+property=["']twitter:image["']\s+content=["']([^"']+)["'][^>]*>/i),
    favicon: getTag(/<link\s+rel=["'](?:icon|shortcut icon)["'][^>]*\s+href=["']([^"']+)["'][^>]*>/i)
  };
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    console.log(`[Link Preview API] Fetching preview for: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GangioBot/1.0; +https://gang.io)'
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract metadata using our helper function
    const metadata = extractMetadata(html);
    
    // Build the preview data
    const previewData = {
      url,
      title: metadata.title || 'No title available',
      description: metadata.description || null,
      image: metadata.image || null,
      favicon: metadata.favicon || null
    };

    // Handle relative URLs for favicon and image
    if (previewData.favicon && !previewData.favicon.startsWith('http')) {
      const baseUrl = new URL(url);
      previewData.favicon = new URL(previewData.favicon, `${baseUrl.protocol}//${baseUrl.host}`).toString();
    }

    if (previewData.image && !previewData.image.startsWith('http')) {
      const baseUrl = new URL(url);
      previewData.image = new URL(previewData.image, `${baseUrl.protocol}//${baseUrl.host}`).toString();
    }

    return NextResponse.json(previewData);
  } catch (error) {
    console.error('[Link Preview API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate link preview' }, { status: 500 });
  }
}
