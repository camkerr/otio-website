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

