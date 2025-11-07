/**
 * Extract the first h1 title from markdown content and return both the title and content without it
 */
export function extractH1Title(markdown: string): { title: string; content: string } {
  const lines = markdown.split('\n');
  let title = '';
  let titleIndex = -1;

  // Find the first h1 (# Title)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ')) {
      title = line.replace(/^#+\s+/, '').trim();
      titleIndex = i;
      break;
    }
  }

  // If no h1 found, try to extract from first non-empty line or use default
  if (!title) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        // Use first meaningful line as title (up to 100 chars)
        title = trimmed.slice(0, 100);
        break;
      }
    }
    if (!title) {
      title = 'Documentation';
    }
    return { title, content: markdown };
  }

  // Remove the h1 line from content
  const contentLines = [...lines];
  contentLines.splice(titleIndex, 1);
  
  // Also remove the following empty line if present
  if (contentLines[titleIndex]?.trim() === '') {
    contentLines.splice(titleIndex, 1);
  }

  return {
    title,
    content: contentLines.join('\n'),
  };
}

/**
 * Format markdown by normalizing line breaks.
 * Removes unnecessary line breaks within paragraphs while preserving:
 * - Code blocks (fenced and indented)
 * - List items
 * - Blockquotes
 * - Headings
 * - Horizontal rules
 * - Double line breaks (paragraph breaks)
 */
export function formatMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const formatted: string[] = [];
  let inCodeBlock = false;
  let inIndentedCodeBlock = false;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      formatted.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fenced code blocks
    const codeBlockMatch = trimmed.match(/^(`{3,}|~{3,})(\w*)?/);
    if (codeBlockMatch) {
      flushParagraph();
      inCodeBlock = !inCodeBlock;
      formatted.push(line);
      continue;
    }

    // If we're in a code block, preserve everything as-is
    if (inCodeBlock) {
      formatted.push(line);
      continue;
    }

    // Check for indented code blocks (4+ spaces at start of line)
    if (line.match(/^ {4,}/)) {
      flushParagraph();
      inIndentedCodeBlock = true;
      formatted.push(line);
      continue;
    } else if (inIndentedCodeBlock) {
      // Still in code block if empty line or still indented
      if (trimmed === '' || line.match(/^ {4,}/)) {
        formatted.push(line);
        continue;
      } else {
        inIndentedCodeBlock = false;
      }
    }

    // Preserve headings
    if (trimmed.match(/^#{1,6}\s/)) {
      flushParagraph();
      formatted.push(line);
      continue;
    }

    // Preserve horizontal rules
    if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      flushParagraph();
      formatted.push(line);
      continue;
    }

    // Preserve list items (including nested)
    if (trimmed.match(/^(\s*)([-*+]|\d+[.)])\s/)) {
      flushParagraph();
      formatted.push(line);
      continue;
    }

    // Preserve blockquotes
    if (trimmed.startsWith('>')) {
      flushParagraph();
      formatted.push(line);
      continue;
    }

    // Preserve empty lines (paragraph breaks)
    if (trimmed === '') {
      flushParagraph();
      formatted.push(line);
      continue;
    }

    // Regular paragraph text - accumulate for joining
    currentParagraph.push(trimmed);
  }

  // Flush any remaining paragraph
  flushParagraph();

  return formatted.join('\n');
}

