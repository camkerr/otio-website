/**
 * Get the base URL for the site
 * Falls back to https://opentimelineio.org if not set in environment
 */
export function getSiteUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://opentimelineio.org";
  return baseUrl.replace(/\/$/, ""); // Remove trailing slash
}

/**
 * Build a full URL for a given path
 */
export function getFullUrl(path: string): string {
  const base = getSiteUrl();
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return `${base}${pathname}`;
}

