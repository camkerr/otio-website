import { unstable_cache } from 'next/cache';

const REPO = 'AcademySoftwareFoundation/OpenTimelineIO';
const CACHE_REVALIDATE = 3600 * 6; // 6 hours in seconds

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  created_at: string;
  published_at: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
    download_count: number;
  }>;
  prerelease: boolean;
  draft: boolean;
}

/**
 * Get GitHub API headers with optional token
 */
function getGitHubHeaders() {
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  };
}

/**
 * Fetch all releases from GitHub
 */
async function fetchAllReleases(): Promise<GitHubRelease[]> {
  const allReleases: GitHubRelease[] = [];
  let page = 1;
  const perPage = 100; // Maximum allowed by GitHub API
  
  // Fetch all pages of releases
  while (true) {
    const url = `https://api.github.com/repos/${REPO}/releases?per_page=${perPage}&page=${page}`;
    
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
      next: {
        revalidate: CACHE_REVALIDATE,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found');
      }
      if (response.status === 403) {
        throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releases: GitHubRelease[] = await response.json();
    
    // If we got no releases, we've reached the end
    if (releases.length === 0) {
      break;
    }
    
    allReleases.push(...releases);
    
    // If we got fewer than the per_page limit, we've reached the end
    if (releases.length < perPage) {
      break;
    }
    
    page++;
  }
  
  return allReleases;
}

/**
 * Get cached list of releases
 */
export const getReleases = unstable_cache(
  async (): Promise<GitHubRelease[]> => {
    return fetchAllReleases();
  },
  ['github-releases'],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ['releases'],
  }
);

/**
 * Parse contributors from release body
 * Looks for patterns like:
 * - @username
 * - Contributors section with usernames
 */
export function parseContributorsFromBody(body: string): string[] {
  const contributors = new Set<string>();
  
  // Match @username patterns
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = mentionRegex.exec(body)) !== null) {
    contributors.add(match[1]);
  }
  
  return Array.from(contributors);
}

