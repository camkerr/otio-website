import { NextRequest, NextResponse } from 'next/server';

interface GitHubIssue {
  title: string;
  body: string;
  state: string;
  html_url: string;
  number: number;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

// Cache for storing responses (1 hour TTL)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const issueNumber = searchParams.get('number');
  const repo = searchParams.get('repo') || 'AcademySoftwareFoundation/OpenTimelineIO';

  if (!issueNumber) {
    return NextResponse.json(
      { error: 'Issue number is required' },
      { status: 400 }
    );
  }

  const cacheKey = `${repo}#${issueNumber}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  }

  try {
    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repo}/issues/${issueNumber}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          // Add GitHub token if available for higher rate limits
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: {
          revalidate: 3600, // Revalidate every hour
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Issue not found' },
          { status: 404 }
        );
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data: GitHubIssue = await response.json();

    // Extract relevant information
    const issueData = {
      title: data.title,
      body: data.body || 'No description provided.',
      state: data.state,
      html_url: data.html_url,
      number: data.number,
      user: {
        login: data.user.login,
        avatar_url: data.user.avatar_url,
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Update cache
    cache.set(cacheKey, {
      data: issueData,
      timestamp: Date.now(),
    });

    return NextResponse.json(issueData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch issue data' },
      { status: 500 }
    );
  }
}

