import { slugify } from './utils';

/**
 * Extract h1 and h2 headings from markdown content
 * 
 * Note: This uses the shared slugify utility to ensure IDs match
 * what's generated in the markdown renderer
 */
export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2;
}

export function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split('\n');
  const idCounts = new Map<string, number>();
  let inCodeBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if we're entering or leaving a code block
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    // Skip lines inside code blocks
    if (inCodeBlock) {
      continue;
    }
    
    // Match h1 (# Title) or h2 (## Title)
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    
    if (h1Match) {
      const text = h1Match[1].trim();
      const baseId = slugify(text);
      
      // Handle duplicate IDs (same as rehypeSlug behavior)
      // First occurrence gets baseId, subsequent ones get -1, -2, etc.
      const count = idCounts.get(baseId) || 0;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      idCounts.set(baseId, count + 1);
      
      headings.push({
        id,
        text,
        level: 1,
      });
    } else if (h2Match) {
      const text = h2Match[1].trim();
      const baseId = slugify(text);
      
      // Handle duplicate IDs (same as rehypeSlug behavior)
      // First occurrence gets baseId, subsequent ones get -1, -2, etc.
      const count = idCounts.get(baseId) || 0;
      const id = count > 0 ? `${baseId}-${count}` : baseId;
      idCounts.set(baseId, count + 1);
      
      headings.push({
        id,
        text,
        level: 2,
      });
    }
  }
  
  return headings;
}

