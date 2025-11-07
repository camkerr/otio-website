import { visit } from 'unist-util-visit';
import { slugify } from './utils';
import type { Root, Element } from 'hast';

/**
 * Custom rehype plugin that adds IDs to headings using our shared slugify function
 * This ensures consistency with the table of contents extractor
 */
export function rehypeSlugCustom() {
  return (tree: Root) => {
    const idCounts = new Map<string, number>();

    visit(tree, 'element', (node: Element) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        // Skip if already has an ID
        if (node.properties && node.properties.id) {
          return;
        }

        // Extract text content from the heading
        const text = extractText(node);
        if (!text) return;

        // Generate slug
        const baseId = slugify(text);
        
        // Handle duplicates
        const count = idCounts.get(baseId) || 0;
        const id = count > 0 ? `${baseId}-${count}` : baseId;
        idCounts.set(baseId, count + 1);

        // Add ID to the node
        if (!node.properties) {
          node.properties = {};
        }
        node.properties.id = id;
      }
    });
  };
}

/**
 * Extract text content from a node recursively
 */
function extractText(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }
  
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }
  
  return '';
}

