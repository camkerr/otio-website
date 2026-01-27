import { unstable_cache } from 'next/cache';

const REPO = 'AcademySoftwareFoundation/OpenTimelineIO';
const CACHE_REVALIDATE = 3600 * 24; // 1 day in seconds

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  twitter_username?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
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
 * Fetch all contributors from GitHub
 * This uses pagination to get all contributors (not just the first 30)
 */
async function fetchAllContributors(): Promise<GitHubContributor[]> {
  const allContributors: GitHubContributor[] = [];
  let page = 1;
  const perPage = 100; // Maximum allowed by GitHub API
  
  // Fetch all pages of contributors
  while (true) {
    const url = `https://api.github.com/repos/${REPO}/contributors?per_page=${perPage}&page=${page}&anon=false`;
    
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

    const contributors: GitHubContributor[] = await response.json();
    
    // If we got no contributors, we've reached the end
    if (contributors.length === 0) {
      break;
    }
    
    // Filter to only include contributors with type "User"
    const userContributors = contributors.filter(contributor => contributor.type === 'User');
    allContributors.push(...userContributors);
    
    // If we got fewer than the per_page limit, we've reached the end
    if (contributors.length < perPage) {
      break;
    }
    
    page++;
  }
  
  return allContributors;
}

/**
 * Fetch detailed user information for a contributor
 */
async function fetchUserDetails(username: string): Promise<Partial<GitHubContributor>> {
  const url = `https://api.github.com/users/${username}`;
  
  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
      next: {
        revalidate: CACHE_REVALIDATE,
      },
    });

    if (!response.ok) {
      // If we can't get user details, just return empty object
      return {};
    }

    const userData = await response.json();
    
    return {
      name: userData.name,
      company: userData.company,
      blog: userData.blog,
      location: userData.location,
      email: userData.email,
      bio: userData.bio,
      twitter_username: userData.twitter_username,
      public_repos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
    };
  } catch (error) {
    // If we can't get user details, just return empty object
    return {};
  }
}

/**
 * Get cached list of contributors with basic info
 */
export const getContributors = unstable_cache(
  async (): Promise<GitHubContributor[]> => {
    return fetchAllContributors();
  },
  ['github-contributors'],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ['contributors'],
  }
);

/**
 * Get cached detailed information for a specific contributor
 */
export async function getContributorDetails(username: string): Promise<Partial<GitHubContributor>> {
  return unstable_cache(
    async () => {
      return fetchUserDetails(username);
    },
    [`contributor-details-${username}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: ['contributors'],
    }
  )();
}

/**
 * Get repository statistics
 */
export const getRepoStats = unstable_cache(
  async () => {
    const url = `https://api.github.com/repos/${REPO}`;
    
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
      next: {
        revalidate: CACHE_REVALIDATE,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repo stats: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count,
      openIssues: data.open_issues_count,
    };
  },
  ['github-repo-stats'],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ['contributors'],
  }
);

