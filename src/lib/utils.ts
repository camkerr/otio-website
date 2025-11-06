import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs - Class values to combine
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a URL is a GitHub image that should be proxied
 */
export function isGitHubImageUrl(url: string): boolean {
  if (!url) return false;
  
  const githubDomains = [
    'github.com',
    'raw.githubusercontent.com',
    'user-images.githubusercontent.com',
    'github-production-user-asset-6210df.s3.amazonaws.com',
    'private-user-images.githubusercontent.com',
    'camo.githubusercontent.com',
    'avatars.githubusercontent.com',
    'opengraph.githubassets.com',
  ];
  
  try {
    const urlObj = new URL(url);
    return githubDomains.some(domain => 
      urlObj.hostname === domain || 
      urlObj.hostname.endsWith('.' + domain) ||
      (domain.includes('github-production-user-asset') && urlObj.hostname.includes('github-production-user-asset'))
    );
  } catch {
    return false;
  }
}

/**
 * Converts a GitHub image URL to use our proxy
 */
export function getProxiedImageUrl(url: string): string {
  if (!isGitHubImageUrl(url)) {
    return url;
  }
  
  const encodedUrl = encodeURIComponent(url);
  return `/api/github/proxy-image?url=${encodedUrl}`;
}
