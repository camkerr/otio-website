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
  let inListItem = false;
  let listItemIndent = 0;
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

    // Check for fenced code blocks (including directives like ```{glossary})
    const codeBlockMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (codeBlockMatch) {
      flushParagraph();
      inCodeBlock = !inCodeBlock;
      formatted.push(line);
      inListItem = false;
      continue;
    }

    // If we're in a code block, preserve everything as-is
    if (inCodeBlock) {
      formatted.push(line);
      continue;
    }

    // Check for indented code blocks (4+ spaces at start of line)
    if (line.match(/^ {4,}/) && !inListItem) {
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
      inListItem = false;
      continue;
    }

    // Preserve horizontal rules
    if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      flushParagraph();
      formatted.push(line);
      inListItem = false;
      continue;
    }

    // Check for list items (markers only or with minimal content)
    const listMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s*(.*)$/);
    if (listMatch) {
      flushParagraph();
      const markerIndent = listMatch[1].length;
      const marker = listMatch[0].substring(0, listMatch[0].indexOf(listMatch[2]) + listMatch[2].length);
      const contentOnSameLine = listMatch[3].trim();
      
      // If there's no content on the same line, try to join with next line
      if (!contentOnSameLine) {
        // Find the next non-empty line
        let nextLineIdx = i + 1;
        while (nextLineIdx < lines.length && lines[nextLineIdx].trim() === '') {
          nextLineIdx++;
        }
        
        if (nextLineIdx < lines.length) {
          const nextLine = lines[nextLineIdx];
          // Don't join if next line is another list marker, heading, or code block
          if (!nextLine.match(/^(\s*)([-*+]|\d+[.)])\s/) && 
              !nextLine.match(/^(\s*)```/) && 
              !nextLine.match(/^(\s*)#{1,6}\s/)) {
            formatted.push(marker + ' ' + nextLine.trim());
            i = nextLineIdx; // Skip to the line we just processed
            inListItem = true;
            listItemIndent = markerIndent;
            continue;
          }
        }
      }
      
      // Either has content on same line or couldn't join with next line
      formatted.push(line);
      inListItem = true;
      listItemIndent = markerIndent;
      continue;
    }

    // If we're in a list item, check if this line is part of it
    if (inListItem) {
      // Empty line might end the list item
      if (trimmed === '') {
        formatted.push(line);
        inListItem = false;
        continue;
      }
      
      // Check if line is indented (part of list item content)
      const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
      if (leadingSpaces > listItemIndent) {
        // This is indented content belonging to the list item
        formatted.push(line);
        continue;
      } else {
        // Not indented enough, not part of list item anymore
        inListItem = false;
      }
    }

    // Preserve blockquotes
    if (trimmed.startsWith('>')) {
      flushParagraph();
      formatted.push(line);
      inListItem = false;
      continue;
    }

    // Preserve empty lines (paragraph breaks)
    if (trimmed === '') {
      flushParagraph();
      formatted.push(line);
      inListItem = false;
      continue;
    }

    // Regular paragraph text - accumulate for joining
    currentParagraph.push(trimmed);
  }

  // Flush any remaining paragraph
  flushParagraph();

  return formatted.join('\n');
}

