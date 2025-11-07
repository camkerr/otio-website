import { unstable_cache } from 'next/cache';

const REPO = 'AcademySoftwareFoundation/OpenTimelineIO';
const DOCS_PATH = 'docs';
const INDEX_FILE = 'docs/index.rst';
const CACHE_REVALIDATE = 60 * 60 * 24; // 1 day in seconds
// const CACHE_REVALIDATE = 10; // 10 seconds

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
 * Parse index.rst to extract all referenced documentation paths
 * This is cached to avoid parsing the file on every request
 */
const getAllowedDocPaths = unstable_cache(
  async (): Promise<Set<string>> => {
    try {
      const indexContent = await fetchRawContent(INDEX_FILE);
      const allowedPaths = new Set<string>();
      
      // Always include the index file itself
      allowedPaths.add(INDEX_FILE);
      
      const lines = indexContent.split('\n');
      let inTocTree = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Detect toctree directive
        if (trimmed.startsWith('.. toctree::')) {
          inTocTree = true;
          continue;
        }
        
        // Exit toctree when we hit a non-indented line (that's not empty or a comment)
        if (inTocTree && trimmed && !line.startsWith('   ') && !trimmed.startsWith(':')) {
          inTocTree = false;
        }
        
        // Parse paths in toctree sections
        if (inTocTree && line.startsWith('   ') && trimmed && !trimmed.startsWith(':')) {
          let path = trimmed;
          
          // Add both .rst and .md versions since the index doesn't specify extension
          // (except when explicitly mentioned like .md files)
          if (path.endsWith('.md')) {
            allowedPaths.add(`${DOCS_PATH}/${path}`);
          } else {
            // Try both extensions
            allowedPaths.add(`${DOCS_PATH}/${path}.rst`);
            allowedPaths.add(`${DOCS_PATH}/${path}.md`);
          }
        }
      }
      
      return allowedPaths;
    } catch (error) {
      console.error('Failed to parse index.rst, allowing all docs:', error);
      // If we can't parse index.rst, return an empty set to allow all files
      // This ensures the site doesn't break if there's a parsing issue
      return new Set();
    }
  },
  ['allowed-doc-paths'],
  {
    revalidate: CACHE_REVALIDATE,
    tags: ['docs'],
  }
);

/**
 * Fetch the docs directory tree from GitHub
 * Uses Contents API for reliability (git/trees can truncate)
 * Filters files based on index.rst references
 */
async function fetchDocsTree(): Promise<GitHubTreeItem[]> {
  // Get allowed paths from index.rst
  const allowedPaths = await getAllowedDocPaths();
  const shouldFilterFiles = allowedPaths.size > 0;
  
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
      throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const contents = await response.json();
  
  // Ensure contents is an array
  if (!Array.isArray(contents)) {
    throw new Error('Unexpected response format from GitHub API');
  }
  
  const allFiles: GitHubTreeItem[] = [];

  // Helper function to check if a file should be included
  function isAllowedFile(filePath: string): boolean {
    if (!shouldFilterFiles) return true; // If parsing failed, allow all files
    return allowedPaths.has(filePath);
  }

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
        throw new Error(`GitHub API rate limit exceeded. Please add GITHUB_TOKEN to increase limits.`);
      }
      return;
    }

    const items = await dirResponse.json();
    
    // Ensure items is an array
    if (!Array.isArray(items)) {
      return;
    }
    
    for (const item of items) {
      if (item.type === 'file' && (item.path.endsWith('.md') || item.path.endsWith('.rst'))) {
        // Only include files that are referenced in index.rst
        if (isAllowedFile(item.path)) {
          allFiles.push({
            path: item.path,
            type: 'blob',
            sha: item.sha,
            size: item.size,
            url: item.url,
          });
        }
      } else if (item.type === 'dir' && !item.path.includes('_static') && !item.path.includes('_templates') && !item.path.includes('_build')) {
        // Recursively fetch subdirectories (skip build directories)
        await fetchDirectory(item.path);
      }
    }
  }

  // Process the root docs directory
  for (const item of contents) {
    if (item.type === 'file' && (item.path.endsWith('.md') || item.path.endsWith('.rst'))) {
      // Only include files that are referenced in index.rst
      if (isAllowedFile(item.path)) {
        allFiles.push({
          path: item.path,
          type: 'blob',
          sha: item.sha,
          size: item.size,
          url: item.url,
        });
      }
    } else if (item.type === 'dir' && !item.path.includes('_static') && !item.path.includes('_templates') && !item.path.includes('_build')) {
      // Fetch subdirectories (especially tutorials and use-cases)
      await fetchDirectory(item.path);
    }
  }

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
 * This list is filtered based on what's referenced in index.rst
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
 * Get the list of allowed documentation paths (for debugging)
 * This shows which files from index.rst are being included
 */
export async function getDebugAllowedPaths(): Promise<string[]> {
  const paths = await getAllowedDocPaths();
  return Array.from(paths).sort();
}

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

/**
 * Transform relative image paths in markdown to absolute GitHub URLs
 * This handles images in the docs/_static directory and other relative paths
 * 
 * @param content - The markdown content with potentially relative image paths
 * @param docPath - The path to the documentation file (e.g., 'docs/tutorials/quickstart.rst')
 * @returns The markdown content with absolute GitHub URLs
 */
export function transformImagePaths(content: string, docPath: string): string {
  // Get the directory of the current document
  const docDir = docPath.substring(0, docPath.lastIndexOf('/'));
  
  // Transform markdown image syntax: ![alt](path)
  content = content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, imagePath) => {
      // Skip if already an absolute URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return match;
      }
      
      // Resolve relative path
      let resolvedPath = imagePath;
      
      // Handle ../ paths (go up directories)
      if (imagePath.startsWith('../')) {
        const parts = docDir.split('/');
        let imagePathParts = imagePath.split('/');
        
        // Remove leading ../ and corresponding directory parts
        while (imagePathParts[0] === '..' && parts.length > 0) {
          imagePathParts.shift();
          parts.pop();
        }
        
        resolvedPath = [...parts, ...imagePathParts].join('/');
      } else if (imagePath.startsWith('./')) {
        // Handle ./ paths (current directory)
        resolvedPath = `${docDir}/${imagePath.substring(2)}`;
      } else if (!imagePath.startsWith('/')) {
        // Handle relative paths without ./ prefix
        resolvedPath = `${docDir}/${imagePath}`;
      } else {
        // Handle absolute paths (starting with /)
        resolvedPath = imagePath.substring(1);
      }
      
      // Create absolute GitHub URL
      const absoluteUrl = `https://raw.githubusercontent.com/${REPO}/main/${resolvedPath}`;
      return `![${alt}](${absoluteUrl})`;
    }
  );
  
  // Transform HTML image syntax: <img src="path">
  content = content.replace(
    /<img([^>]*?)src=["']([^"']+)["']([^>]*)>/gi,
    (match, before, imagePath, after) => {
      // Skip if already an absolute URL
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return match;
      }
      
      // Resolve relative path (same logic as above)
      let resolvedPath = imagePath;
      
      if (imagePath.startsWith('../')) {
        const parts = docDir.split('/');
        let imagePathParts = imagePath.split('/');
        
        while (imagePathParts[0] === '..' && parts.length > 0) {
          imagePathParts.shift();
          parts.pop();
        }
        
        resolvedPath = [...parts, ...imagePathParts].join('/');
      } else if (imagePath.startsWith('./')) {
        resolvedPath = `${docDir}/${imagePath.substring(2)}`;
      } else if (!imagePath.startsWith('/')) {
        resolvedPath = `${docDir}/${imagePath}`;
      } else {
        resolvedPath = imagePath.substring(1);
      }
      
      const absoluteUrl = `https://raw.githubusercontent.com/${REPO}/main/${resolvedPath}`;
      return `<img${before}src="${absoluteUrl}"${after}>`;
    }
  );
  
  return content;
}

