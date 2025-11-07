/**
 * Basic RST to Markdown converter
 * Handles common RST directives and converts them to Markdown
 */

/**
 * Convert RST to Markdown
 * This is a basic converter that handles common patterns.
 * For more complex RST features, consider using a library like restructured.
 */
export function convertRstToMarkdown(rst: string): string {
  let markdown = rst;

  // Remove Sphinx-only directives that don't have Markdown equivalents
  markdown = markdown.replace(/^\.\.\s+(toctree|include|literalinclude|code-block|note|warning|tip|danger|admonition)::.*$/gm, '');
  markdown = markdown.replace(/^\.\.\s+\[.*\]$/gm, ''); // Remove reference labels like .. [label]
  
  // Convert section headers (RST uses underlines)
  // Handle headers with underlines (====, ----, ~~~~, etc.)
  markdown = markdown.replace(/^([^\n]+)\n([=]{3,})$/gm, '# $1');
  markdown = markdown.replace(/^([^\n]+)\n([-]{3,})$/gm, '## $1');
  markdown = markdown.replace(/^([^\n]+)\n([~]{3,})$/gm, '### $1');
  markdown = markdown.replace(/^([^\n]+)\n([^]{3,})$/gm, '#### $1');
  
  // Convert inline code
  markdown = markdown.replace(/``([^`]+)``/g, '`$1`');
  
  // Convert code blocks
  markdown = markdown.replace(/^\.\.\s+code-block::\s*(\w+)?\s*\n((?:^  .*\n?)+)/gm, (match, lang, code) => {
    const indent = /^  /.test(code) ? 2 : 0;
    const cleanedCode = code.split('\n')
      .map((line: string) => line.slice(indent))
      .join('\n')
      .trim();
    return `\`\`\`${lang || ''}\n${cleanedCode}\n\`\`\``;
  });
  
  // Convert literal blocks (indented code)
  markdown = markdown.replace(/^::\s*\n((?:^  .*\n?)+)/gm, (match, code) => {
    const cleanedCode = code.split('\n')
      .map((line: string) => line.slice(2))
      .join('\n')
      .trim();
    return `\`\`\`\n${cleanedCode}\n\`\`\``;
  });
  
  // Convert bold
  markdown = markdown.replace(/\*\*([^*]+)\*\*/g, '**$1**');
  
  // Convert italic
  markdown = markdown.replace(/\*([^*]+)\*/g, '*$1*');
  
  // Convert links
  markdown = markdown.replace(/`([^`]+)\s*<([^>]+)>`_/g, '[$1]($2)');
  markdown = markdown.replace(/`([^`]+)`_/g, '[$1]($1)'); // Simple reference links
  
  // Convert RST image directive to Markdown
  // Matches: .. image:: path/to/image.png
  //          :alt: Alt text (optional)
  //          :width: 800px (optional, ignored in markdown)
  markdown = markdown.replace(/^\.\.\s+image::\s*([^\n]+)\s*(?:\n\s+:[^\n]+)*\n?/gm, (match, imagePath) => {
    // Extract alt text if present
    const altMatch = match.match(/:alt:\s*([^\n]+)/);
    const alt = altMatch ? altMatch[1].trim() : '';
    return `![${alt}](${imagePath.trim()})\n`;
  });
  
  // Convert RST figure directive to Markdown (similar to image but with caption)
  // Matches: .. figure:: path/to/image.png
  //          :alt: Alt text (optional)
  //          Caption text (optional)
  markdown = markdown.replace(/^\.\.\s+figure::\s*([^\n]+)\s*(?:\n\s+:[^\n]+)*(?:\n\s*\n\s+([^\n]+))?/gm, (match, imagePath, caption) => {
    const altMatch = match.match(/:alt:\s*([^\n]+)/);
    const alt = altMatch ? altMatch[1].trim() : (caption || '');
    return `![${alt}](${imagePath.trim()})\n${caption ? `\n*${caption.trim()}*\n` : ''}`;
  });
  
  // Convert lists (RST uses - or * for unordered, numbers for ordered)
  // This is mostly compatible with Markdown already
  
  // Remove RST-only directives
  markdown = markdown.replace(/^\.\.\s+.*$/gm, '');
  
  // Clean up multiple blank lines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  // Convert RST role directives (like :ref:, :doc:, etc.)
  markdown = markdown.replace(/:ref:`([^`]+)`/g, '[$1]($1)');
  markdown = markdown.replace(/:doc:`([^`]+)`/g, '[$1]($1)');
  markdown = markdown.replace(/:term:`([^`]+)`/g, '**$1**');
  
  // Clean up any remaining RST artifacts
  markdown = markdown.replace(/^\.\.\s+/gm, '');
  
  return markdown.trim();
}

/**
 * Extract title from Markdown or RST content (first header)
 */
export function extractTitle(content: string): string {
  const lines = content.split('\n');
  
  // Try Markdown-style headers first (# Header)
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.replace(/^#+\s+/, '').trim();
    }
    if (trimmed.startsWith('## ')) {
      return trimmed.replace(/^#+\s+/, '').trim();
    }
  }
  
  // Try RST-style headers (underlined)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (/^[=~-]{3,}$/.test(nextLine)) {
        return line.trim();
      }
    }
  }
  
  return 'Documentation';
}

