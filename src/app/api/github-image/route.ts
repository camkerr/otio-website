import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from 'next/cache';

/**
 * GitHub Image Proxy API Route
 * 
 * This route proxies image and media requests from GitHub, using the GitHub API token
 * for authentication. This allows fetching images from private repositories and
 * bypasses the need for browser cookies.
 * 
 * Images are cached for 365 days to minimize API requests.
 * 
 * Usage:
 * GET /api/github-image?url=<github-image-url>
 * 
 * Example:
 * GET /api/github-image?url=https://github.com/ORG/REPO/assets/123/image.png
 * 
 * Supported GitHub domains:
 * - github.com (repository assets)
 * - raw.githubusercontent.com (raw files)
 * - user-images.githubusercontent.com (issue/PR images)
 * - github-production-user-asset-*.s3.amazonaws.com (uploaded assets)
 * - private-user-images.githubusercontent.com (private repo images)
 * - camo.githubusercontent.com (proxied external images)
 * - avatars.githubusercontent.com (user avatars)
 * - opengraph.githubassets.com (social preview images)
 */

const CACHE_365_DAYS = 365 * 24 * 60 * 60; // 365 days in seconds

async function fetchImageFromGitHub(imageUrl: string, token: string): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const response = await fetch(imageUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'OTIO-Website',
      'Accept': 'image/*,*/*;q=0.8',
    },
    redirect: 'follow',
    next: {
      revalidate: CACHE_365_DAYS, // Cache for 365 days
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/png';
  
  return { buffer, contentType };
}

export async function GET(request: NextRequest) {
  try {
    // Get the GitHub token from environment
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 503 }
      );
    }

    // Get the image URL from the query parameters
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing 'url' parameter" },
        { status: 400 }
      );
    }

    // Validate that the URL is from GitHub (including various GitHub domains for assets)
    const allowedDomains = [
      'https://github.com/',
      'https://raw.githubusercontent.com/',
      'https://user-images.githubusercontent.com/',
      'https://github-production-user-asset-',
      'https://private-user-images.githubusercontent.com/',
      'https://camo.githubusercontent.com/',
      'https://avatars.githubusercontent.com/',
      'https://opengraph.githubassets.com/',
    ];

    const isValidGitHubUrl = allowedDomains.some(domain => imageUrl.startsWith(domain));
    
    if (!isValidGitHubUrl) {
      return NextResponse.json(
        { error: "Only GitHub URLs are allowed" },
        { status: 400 }
      );
    }

    // Use cached fetch function with 365-day cache
    const getCachedImage = unstable_cache(
      async () => {
        return fetchImageFromGitHub(imageUrl, token);
      },
      [`github-image-${imageUrl}`],
      {
        revalidate: CACHE_365_DAYS,
        tags: ['github-images'],
      }
    );

    const { buffer, contentType } = await getCachedImage();
    
    // Create response with proper headers - cache for 365 days
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable', // Cache for 365 days
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Proxied-From': 'github',
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
