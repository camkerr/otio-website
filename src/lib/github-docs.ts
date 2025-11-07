import { unstable_cache } from 'next/cache';

const REPO = 'AcademySoftwareFoundation/OpenTimelineIO';
const DOCS_PATH = 'docs';
const CACHE_REVALIDATE = 3600 * 24; // 1 day in seconds

interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  committer: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface DocMetadata {
  lastModified: string;
  lastEditor: {
    login: string;
    avatar_url?: string;
    name?: string;
  };
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
 * Fetch the docs directory tree from GitHub
 * Uses Contents API for reliability (git/trees can truncate)
 */
async function fetchDocsTree(): Promise<GitHubTreeItem[]> {
  // Always use Contents API for reliability
  // (git/trees API can truncate and doesn't always indicate it properly)
  const contentsUrl = `https://api.github.com/repos/${REPO}/contents/${DOCS_PATH}`;
  const response = await fetch(contentsUrl, {
    headers: getGitHubHeaders(),
    next: {
      revalidate: CACHE_REVALIDATE,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository or docs directory not found');
    }
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');
      console.error(`[GitHub Docs] Rate limit exceeded. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
      throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const contents = await response.json();
  
  // Ensure contents is an array
  if (!Array.isArray(contents)) {
    console.error('[GitHub Docs] Contents API returned non-array:', typeof contents);
    throw new Error('Unexpected response format from GitHub API');
  }
  
  const allFiles: GitHubTreeItem[] = [];

  // Recursively fetch all markdown files from subdirectories
  async function fetchDirectory(path: string): Promise<void> {
    const dirUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;
    const dirResponse = await fetch(dirUrl, {
      headers: getGitHubHeaders(),
      next: {
        revalidate: CACHE_REVALIDATE,
      },
    });

    if (!dirResponse.ok) {
      if (dirResponse.status === 403) {
        const rateLimitRemaining = dirResponse.headers.get('x-ratelimit-remaining');
        console.error(`[GitHub Docs] Rate limit exceeded for directory ${path}. Remaining: ${rateLimitRemaining}`);
        throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
      }
      console.warn(`[GitHub Docs] Failed to fetch directory: ${path} (${dirResponse.status})`);
      return;
    }

    const items = await dirResponse.json();
    
    // Ensure items is an array
    if (!Array.isArray(items)) {
      console.warn(`[GitHub Docs] Directory ${path} returned non-array`);
      return;
    }
    
    console.log(`[GitHub Docs] Processing directory ${path}: ${items.length} items`);
    
    for (const item of items) {
      if (item.type === 'file' && (item.path.endsWith('.md') || item.path.endsWith('.rst'))) {
        allFiles.push({
          path: item.path,
          type: 'blob',
          sha: item.sha,
          size: item.size,
          url: item.url,
        });
        console.log(`[GitHub Docs] Added file: ${item.path}`);
      } else if (item.type === 'dir' && !item.path.includes('_static') && !item.path.includes('_templates') && !item.path.includes('_build')) {
        // Recursively fetch subdirectories (skip build directories)
        await fetchDirectory(item.path);
      }
    }
  }

  // Process the root docs directory
  console.log(`[GitHub Docs] Processing root docs directory: ${contents.length} items`);
  for (const item of contents) {
    if (item.type === 'file' && (item.path.endsWith('.md') || item.path.endsWith('.rst'))) {
      allFiles.push({
        path: item.path,
        type: 'blob',
        sha: item.sha,
        size: item.size,
        url: item.url,
      });
      console.log(`[GitHub Docs] Added root file: ${item.path}`);
    } else if (item.type === 'dir' && !item.path.includes('_static') && !item.path.includes('_templates') && !item.path.includes('_build')) {
      // Fetch subdirectories (especially tutorials and use-cases)
      console.log(`[GitHub Docs] Fetching directory: ${item.path}`);
      await fetchDirectory(item.path);
    }
  }

  console.log(`[GitHub Docs] Found ${allFiles.length} files via Contents API`);
  console.log(`[GitHub Docs] Sample paths:`, allFiles.slice(0, 10).map(f => f.path));
  return allFiles;
}

/**
 * Fetch raw Markdown/RST file content from GitHub
 */
async function fetchRawContent(path: string): Promise<string> {
  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;
  
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    next: {
      revalidate: CACHE_REVALIDATE,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`File not found: ${path}`);
    }
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      const rateLimitReset = response.headers.get('x-ratelimit-reset');
      console.error(`[GitHub Docs] Rate limit exceeded for file ${path}. Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
      throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data: GitHubContentResponse = await response.json();
  
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  
  throw new Error('Unexpected content encoding');
}

/**
 * Get cached list of documentation files
 */
export const getDocsList = unstable_cache(
  async (): Promise<GitHubTreeItem[]> => {
    return fetchDocsTree();
  },
  ['docs-list'],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ['docs'],
  }
);

/**
 * Fetch commit metadata for a file
 */
async function fetchFileMetadata(path: string): Promise<DocMetadata> {
  const url = `https://api.github.com/repos/${REPO}/commits?path=${encodeURIComponent(path)}&per_page=1`;
  
  const response = await fetch(url, {
    headers: getGitHubHeaders(),
    next: {
      revalidate: CACHE_REVALIDATE,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      console.warn(`[GitHub Docs] Rate limit exceeded for metadata ${path}. Remaining: ${rateLimitRemaining}`);
    }
    // If we can't get commit info, return defaults (metadata is non-critical)
    return {
      lastModified: new Date().toISOString(),
      lastEditor: {
        login: 'unknown',
      },
    };
  }

  const commits: GitHubCommit[] = await response.json();
  
  if (commits.length === 0) {
    return {
      lastModified: new Date().toISOString(),
      lastEditor: {
        login: 'unknown',
      },
    };
  }

  const commit = commits[0];
  const author = commit.author || commit.committer;
  
  return {
    lastModified: commit.commit.author.date,
    lastEditor: {
      login: author?.login || commit.commit.author.name,
      avatar_url: author?.avatar_url,
      name: commit.commit.author.name,
    },
  };
}

/**
 * Get cached Markdown/RST file content
 */
export async function getDocContent(path: string): Promise<string> {
  return unstable_cache(
    async () => {
      return fetchRawContent(path);
    },
    [`doc-content-${path}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: ['docs'],
    }
  )();
}

/**
 * Get cached file metadata (last modified date and editor)
 */
export async function getDocMetadata(path: string): Promise<DocMetadata> {
  return unstable_cache(
    async () => {
      return fetchFileMetadata(path);
    },
    [`doc-metadata-${path}`],
    {
      revalidate: CACHE_REVALIDATE,
      tags: ['docs'],
    }
  )();
}

/**
 * Get the GitHub URL for editing a file
 */
export function getEditUrl(path: string): string {
  return `https://github.com/${REPO}/edit/main/${path}`;
}

/**
 * Get the GitHub URL for viewing a file
 */
export function getViewUrl(path: string): string {
  return `https://github.com/${REPO}/blob/main/${path}`;
}

/**
 * Extract H1 title from markdown or RST content
 */
export function extractH1FromContent(content: string): string {
  const lines = content.split('\n');
  
  // Try Markdown-style headers first (# Header)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.replace(/^#+\s+/, '').trim();
    }
  }
  
  // Try RST-style headers (underlined with ===, ---, or ~~~)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (/^[=~-]{3,}$/.test(nextLine)) {
        return line.trim();
      }
    }
  }
  
  // Fallback: use first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed.slice(0, 100);
    }
  }
  
  return 'Documentation';
}

