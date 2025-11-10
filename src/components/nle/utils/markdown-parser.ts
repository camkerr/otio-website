import { unified } from "unified";
import remarkParse from "remark-parse";
import { Root, Content, Heading, Paragraph, Image, Text } from "mdast";

/**
 * Element extracted from markdown AST
 */
export interface ParsedElement {
  type: "h1" | "h2" | "h3" | "p" | "img";
  content: string;
  node: Content;
  imageUrl?: string;
  alt?: string;
}

/**
 * Section grouping header and following content
 */
export interface Section {
  header?: { level: 1 | 2 | 3; text: string; node: Heading };
  elements: ParsedElement[];
  duration: number; // milliseconds
  startTime: number; // milliseconds
}

/**
 * Track item for timeline rendering
 */
export interface TrackItem {
  id: string;
  content: string;
  name: string;
  track: number; // 0 = h1, 1 = h2, 2 = h3, 3 = img, 4 = p
  type: "h1" | "h2" | "h3" | "img" | "p";
  start: number; // milliseconds
  end: number; // milliseconds
  node?: Content; // AST node reference
  imageUrl?: string;
  alt?: string;
}

// Track mapping: h1=0, h2=1, h3=2, img=3, p=4
const TRACK_MAP: Record<string, number> = {
  h1: 0,
  h2: 1,
  h3: 2,
  img: 3,
  p: 4,
};

/**
 * Calculate reading time based on word count
 * Uses 250 words per minute as standard reading speed
 */
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 250;
  const minutes = wordCount / wordsPerMinute;
  return minutes * 60 * 1000; // Convert to milliseconds
}

/**
 * Count words in text content
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Extract text content from AST node recursively
 */
function extractText(node: Content): string {
  if (node.type === "text") {
    return (node as Text).value;
  }
  
  // For nodes with children, recursively extract text
  if ("children" in node && Array.isArray(node.children)) {
    return node.children
      .map((child) => extractText(child as Content))
      .join("");
  }
  
  return "";
}

/**
 * Parse markdown AST node to ParsedElement
 */
function parseNode(node: Content): ParsedElement | null {
  if (node.type === "heading") {
    const heading = node as Heading;
    const level = heading.depth;
    if (level >= 1 && level <= 3) {
      const text = extractText(node);
      return {
        type: `h${level}` as "h1" | "h2" | "h3",
        content: text,
        node,
      };
    }
  } else if (node.type === "paragraph") {
    const text = extractText(node);
    return {
      type: "p",
      content: text,
      node,
    };
  } else if (node.type === "image") {
    const image = node as Image;
    return {
      type: "img",
      content: image.alt || "",
      node,
      imageUrl: image.url,
      alt: image.alt || "",
    };
  }
  return null;
}

/**
 * Calculate duration for a section based on its content
 */
function calculateSectionDuration(section: Section): number {
  let totalWords = 0;

  // Count words in header
  if (section.header) {
    totalWords += countWords(section.header.text);
  }

  // Count words in all elements
  for (const element of section.elements) {
    if (element.type === "p") {
      totalWords += countWords(element.content);
    } else if (element.type === "h1" || element.type === "h2" || element.type === "h3") {
      // Headers within sections (subheadings) also contribute
      totalWords += countWords(element.content);
    }
    // Images get a minimum duration
  }

  // Minimum duration per section (2 seconds)
  const minDuration = 2000;
  // Calculate reading time
  const readingTime = calculateReadingTime(totalWords);
  // Images add extra time (3 seconds per image)
  const imageTime = section.elements.filter((e) => e.type === "img").length * 3000;

  return Math.max(minDuration, readingTime + imageTime);
}

/**
 * Check if a node is an HTML comment separator (<!-- -->)
 */
function isCommentSeparator(node: Content): boolean {
  if (node.type === "html") {
    const htmlNode = node as any;
    const value = htmlNode.value || "";
    // Match HTML comments, including empty ones like <!-- -->
    return /<!--\s*-->/.test(value.trim());
  }
  return false;
}

/**
 * Parse markdown string into sections based on HTML comment separators
 */
export function parseMarkdownToSections(markdown: string): Section[] {
  const processor = unified().use(remarkParse);
  const ast = processor.parse(markdown) as Root;

  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const node of ast.children) {
    // Check if this is a comment separator
    if (isCommentSeparator(node)) {
      // Save current section and start a new one
      if (currentSection && (currentSection.header || currentSection.elements.length > 0)) {
        sections.push(currentSection);
      }
      // Start fresh section
      currentSection = {
        elements: [],
        duration: 0,
        startTime: 0,
      };
      continue;
    }

    // If we don't have a section yet, create one
    if (!currentSection) {
      currentSection = {
        elements: [],
        duration: 0,
        startTime: 0,
      };
    }

    // Parse the node and add to current section
    if (node.type === "heading") {
      const heading = node as Heading;
      const level = heading.depth;
      if (level >= 1 && level <= 3) {
        // Store header in section
        currentSection.header = {
          level: level as 1 | 2 | 3,
          text: extractText(node),
          node: heading,
        };
        // Also add as an element for clip generation
        const parsed = parseNode(node);
        if (parsed) {
          currentSection.elements.push(parsed);
        }
      }
    } else {
      const parsed = parseNode(node);
      if (parsed) {
        currentSection.elements.push(parsed);
      }
    }
  }

  // Don't forget the last section
  if (currentSection && (currentSection.header || currentSection.elements.length > 0)) {
    sections.push(currentSection);
  }

  // Calculate durations and start times
  let cumulativeTime = 0;
  for (const section of sections) {
    section.duration = calculateSectionDuration(section);
    section.startTime = cumulativeTime;
    cumulativeTime += section.duration;
  }

  return sections;
}

/**
 * Generate track items from sections
 * All clips in a section have the same start/end times (stacked horizontally)
 */
export function generateClipsFromSections(sections: Section[]): TrackItem[] {
  const clips: TrackItem[] = [];
  let clipId = 0;

  for (const section of sections) {
    // All clips in this section share the same time range
    const sectionStart = section.startTime;
    const sectionEnd = section.startTime + section.duration;

    // Add header clip if present
    if (section.header) {
      const track = TRACK_MAP[`h${section.header.level}`];
      clips.push({
        id: `clip-${clipId++}`,
        content: section.header.text,
        name: section.header.text.substring(0, 30) + (section.header.text.length > 30 ? "..." : ""),
        track,
        type: `h${section.header.level}` as "h1" | "h2" | "h3",
        start: sectionStart,
        end: sectionEnd,
        node: section.header.node,
      });
    }

    // Add element clips (skip headers since we already added them above)
    for (const element of section.elements) {
      // Skip if this element is a header that we already processed
      if (section.header && element.type === `h${section.header.level}` && element.content === section.header.text) {
        continue;
      }

      const track = TRACK_MAP[element.type];
      if (track !== undefined) {
        clips.push({
          id: `clip-${clipId++}`,
          content: element.content,
          name:
            element.type === "img"
              ? element.alt || "Image"
              : element.content.substring(0, 30) + (element.content.length > 30 ? "..." : ""),
          track,
          type: element.type,
          start: sectionStart, // Same start time for all clips in section
          end: sectionEnd, // Same end time for all clips in section
          node: element.node,
          imageUrl: element.imageUrl,
          alt: element.alt,
        });
      }
    }
  }

  return clips;
}

/**
 * Main function to parse markdown and generate clips
 */
export function parseMarkdownToClips(markdown: string): {
  clips: TrackItem[];
  totalDuration: number;
  sections: Section[];
} {
  const sections = parseMarkdownToSections(markdown);
  const clips = generateClipsFromSections(sections);
  const totalDuration =
    sections.length > 0
      ? sections[sections.length - 1].startTime + sections[sections.length - 1].duration
      : 0;

  return {
    clips,
    totalDuration,
    sections,
  };
}

