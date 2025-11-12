"use client";

import { useState, useEffect, Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { rehypeSlugCustom } from "@/lib/rehype-slug-custom";
import { Info, Lightbulb, AlertCircle, AlertTriangle, OctagonAlert, Copy, Check, GitPullRequest, GitCommit, Hash } from "lucide-react";

// Simple formatter for release notes - preserves structure without aggressive reformatting
function formatReleaseNotes(content: string): string {
  // Normalize line breaks - GitHub might use \r\n
  // Then ensure proper spacing around lists for markdown parsing
  const normalized = content
    .replace(/\r\n/g, '\n')  // Convert Windows line breaks
    .replace(/\r/g, '\n');    // Convert old Mac line breaks
  
  const lines = normalized.split('\n');
  const result: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    const isListItem = /^(\s*)([-*+]|\d+[.)])\s/.test(line);
    const prevWasListItem = /^(\s*)([-*+]|\d+[.)])\s/.test(prevLine);
    
    // Add blank line before list if previous line was non-empty and not a list
    if (isListItem && prevLine && !prevWasListItem && result.length > 0 && result[result.length - 1] !== '') {
      result.push('');
    }
    
    result.push(line);
  }
  
  return result.join('\n');
}

interface ReleaseNotesRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  language: string;
  value: string;
  isDark: boolean;
}

function CodeBlock({ language, value, isDark }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Format language name for display
  const displayLanguage = language === 'text' ? 'plaintext' : language;
  const languageLabel = displayLanguage.charAt(0).toUpperCase() + displayLanguage.slice(1);
  
  return (
    <div className="relative rounded-lg border border-border shadow-sm my-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground">
          {languageLabel}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code content with max-height and overflow */}
      <div className="max-h-[400px] overflow-y-auto">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          PreTag="div"
          className="m-0! rounded-none! border-0!"
          customStyle={{
            margin: 0,
            padding: '0.75rem 1rem',
            background: 'transparent',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
              fontSize: '0.875rem',
            }
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Process text to convert GitHub references to links
function processGitHubReferences(text: string): ReactNode {
  if (typeof text !== 'string') return text;
  
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex patterns for GitHub references
  const patterns = [
    // PR/Issue references: #1234
    { regex: /#(\d+)/g, type: 'issue' as const },
    // User mentions: @username (but not in email addresses)
    { regex: /(?<![a-zA-Z0-9.])@([a-zA-Z0-9][-a-zA-Z0-9]*)/g, type: 'user' as const },
    // Commit references: SHA (7+ hex chars)
    { regex: /\b([0-9a-f]{7,40})\b/g, type: 'commit' as const },
  ];
  
  // Combined regex to find all matches
  const combinedRegex = /#(\d+)|(?<![a-zA-Z0-9.])@([a-zA-Z0-9][-a-zA-Z0-9]*)|\\b([0-9a-f]{7,40})\\b/g;
  let match;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    if (match[1]) {
      // Issue/PR reference
      const number = match[1];
      parts.push(
        <a
          key={`issue-${match.index}`}
          href={`https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/${number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium no-underline hover:underline transition-colors"
        >
          <Hash className="w-3 h-3" />
          {number}
        </a>
      );
    } else if (match[2]) {
      // User mention
      const username = match[2];
      parts.push(
        <a
          key={`user-${match.index}`}
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:text-foreground/80 font-bold no-underline hover:underline transition-colors"
        >
          @{username}
        </a>
      );
    } else if (match[3]) {
      // Commit SHA
      const sha = match[3];
      // Only link if it's 7+ characters (likely a real commit)
      if (sha.length >= 7) {
        parts.push(
          <a
            key={`commit-${match.index}`}
            href={`https://github.com/AcademySoftwareFoundation/OpenTimelineIO/commit/${sha}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary hover:text-primary/80 font-mono text-xs no-underline hover:underline transition-colors"
          >
            <GitCommit className="w-3 h-3" />
            {sha.substring(0, 7)}
          </a>
        );
      } else {
        parts.push(sha);
      }
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

export function ReleaseNotesRenderer({ content, className = "" }: ReleaseNotesRendererProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isDark = mounted && resolvedTheme === "dark";
  const formattedContent = formatReleaseNotes(content);
  
  return (
    <div className={`prose prose-sm lg:prose-base max-w-none dark:prose-invert [&_h1]:no-underline [&_h2]:no-underline [&_h3]:no-underline [&_h4]:no-underline [&_h5]:no-underline [&_h6]:no-underline ${className}`}>
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlugCustom]}
        components={{
          a: ({ ...props }) => {
            const isExternal = props.href?.startsWith('http');
            const isAnchor = props.href?.startsWith('#');
            const Component = isExternal || isAnchor ? 'a' : Link;
            const href = props.href || '#';
            
            // Special handling for GitHub PR/Issue links
            const prMatch = href.match(/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/);
            const issueMatch = href.match(/github\.com\/[^/]+\/[^/]+\/issues\/(\d+)/);
            
            if (prMatch) {
              return (
                <Component
                  {...props}
                  href={href}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium no-underline hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  #{prMatch[1]}
                </Component>
              );
            }
            
            if (issueMatch) {
              return (
                <Component
                  {...props}
                  href={href}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium no-underline hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Hash className="w-3.5 h-3.5" />
                  {issueMatch[1]}
                </Component>
              );
            }
            
            // Regular links
            return (
              <Component
                {...props}
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {props.children}
              </Component>
            );
          },
          h1: ({ ...props }) => (
            <h2
              {...props}
              className="text-xl lg:text-2xl font-bold mt-6 lg:mt-8 mb-3 lg:mb-4 scroll-mt-8 border-b border-border pb-2"
            >
              {props.children}
            </h2>
          ),
          h2: ({ ...props }) => (
            <h3
              {...props}
              className="text-lg lg:text-xl font-semibold mt-5 lg:mt-6 mb-2 lg:mb-3 scroll-mt-8"
            >
              {props.children}
            </h3>
          ),
          h3: ({ ...props }) => (
            <h4
              {...props}
              className="text-base lg:text-lg font-medium mt-4 lg:mt-5 mb-2 scroll-mt-8"
            >
              {props.children}
            </h4>
          ),
          h4: ({ ...props }) => (
            <h5
              {...props}
              className="text-sm lg:text-base font-medium mt-3 lg:mt-4 mb-2 scroll-mt-8"
            >
              {props.children}
            </h5>
          ),
          p: ({ children, ...props }) => {
            // Process text nodes to convert GitHub references
            const processedChildren = Children.map(children, child => {
              if (typeof child === 'string') {
                return processGitHubReferences(child);
              }
              return child;
            });
            
            return (
              <p {...props} className="mb-4 lg:mb-5 leading-relaxed text-sm lg:text-base">
                {processedChildren}
              </p>
            );
          },
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc list-outside mb-3 lg:mb-4 space-y-0.5 pl-6 [&_ul]:list-[circle] [&_ul_ul]:list-[square] [&_ul]:mt-1 [&_ul]:mb-1 [&_ul]:pl-4 [&_li>p]:mb-0! [&_li>p]:mt-0!" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-3 lg:mb-4 space-y-2 lg:space-y-3 pl-0 [&_li>p]:mb-0! [&_li>p]:mt-0!" />
          ),
          li: ({ children, className = "", ...props }) => {
            const childArray = Children.toArray(children);
            let singleParagraphChild = false;
            let paragraphChildren: ReactNode = null;

            if (childArray.length === 1) {
              const onlyChild = childArray[0];

              if (
                isValidElement(onlyChild) &&
                typeof onlyChild.type === "string" &&
                onlyChild.type === "p"
              ) {
                singleParagraphChild = true;
                paragraphChildren = (onlyChild as ReactElement<{ children: ReactNode }>).props
                  .children;
              }
            }
            
            // Process text in list items for GitHub references
            const processedChildren = Children.map(
              singleParagraphChild ? paragraphChildren : children,
              child => {
                if (typeof child === 'string') {
                  return processGitHubReferences(child);
                }
                return child;
              }
            );

            return (
              <li
                {...props}
                className={`leading-snug text-sm lg:text-base ${className}`.trim()}
              >
                {processedChildren}
              </li>
            );
          },
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold" />
          ),
          em: ({ ...props }) => (
            <em {...props} className="italic" />
          ),
          code: ({ className, children, ...props }: any) => {
            const hasLanguageClass = className && typeof className === 'string' && className.startsWith('language-');
            const match = /language-(.+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !hasLanguageClass;
            
            if (isInline) {
              const inlineChildren = Children.toArray(children);
              const hasHyphenatedWord = inlineChildren.some(
                (child) => typeof child === "string" && /(?<=\w)-(?=\w)/.test(child)
              );
              const inlineCodeClasses = [
                "bg-muted",
                "text-foreground",
                "px-1.5",
                "py-0.5",
                "rounded",
                "text-xs",
                "lg:text-sm",
                "font-mono",
                "border",
                "border-border",
                hasHyphenatedWord ? "whitespace-nowrap" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <code
                  {...props}
                  className={inlineCodeClasses}
                >
                  {children}
                </code>
              );
            }
            
            const displayLanguage = language.match(/^\w+$/) ? language : 'text';
            const codeValue = String(children).replace(/^\n+/, '').replace(/\n$/, '');
            
            return (
              <CodeBlock
                language={displayLanguage}
                value={codeValue}
                isDark={isDark}
              />
            );
          },
          pre: ({ children, ...props }: any) => {
            if (
              children &&
              typeof children === 'object' &&
              !Array.isArray(children) &&
              children.props &&
              children.props.className &&
              typeof children.props.className === 'string' &&
              children.props.className.includes('language-')
            ) {
              return <>{children}</>;
            }
            if (
              children &&
              typeof children === 'object' &&
              !Array.isArray(children) &&
              children.type === 'div' &&
              children.props?.className &&
              typeof children.props.className === 'string' &&
              (children.props.className.includes('rounded-lg') || children.props.className.includes('relative'))
            ) {
              return <>{children}</>;
            }
            return (
              <pre
                {...props}
                className="bg-muted text-foreground p-4 lg:p-5 rounded-lg border border-border overflow-x-auto my-4 lg:my-6 text-xs lg:text-sm shadow-sm"
              >
                {children}
              </pre>
            );
          },
          blockquote: ({ children, ...props }: any) => {
            const extractAllText = (node: any): string => {
              if (typeof node === 'string') return node;
              if (Array.isArray(node)) return node.map(extractAllText).join('');
              if (node && typeof node === 'object' && node.props?.children) {
                return extractAllText(node.props.children);
              }
              return '';
            };
            
            const allText = extractAllText(children).trim();
            const alertMatch = allText.match(/^\s*\[!\s*(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\s*\]/i);
            
            if (alertMatch) {
              const alertType = alertMatch[1].toUpperCase();
              
              const alertStyles: Record<string, { border: string; bg: string; text: string; icon: any; title: string }> = {
                NOTE: {
                  border: isDark ? 'border-l-4 border-blue-400' : 'border-l-4 border-blue-500',
                  bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
                  text: isDark ? 'text-blue-200' : 'text-blue-900',
                  icon: Info,
                  title: 'Note'
                },
                TIP: {
                  border: isDark ? 'border-l-4 border-green-400' : 'border-l-4 border-green-500',
                  bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
                  text: isDark ? 'text-green-200' : 'text-green-900',
                  icon: Lightbulb,
                  title: 'Tip'
                },
                IMPORTANT: {
                  border: isDark ? 'border-l-4 border-purple-400' : 'border-l-4 border-purple-500',
                  bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50',
                  text: isDark ? 'text-purple-200' : 'text-purple-900',
                  icon: AlertCircle,
                  title: 'Important'
                },
                WARNING: {
                  border: isDark ? 'border-l-4 border-orange-400' : 'border-l-4 border-orange-500',
                  bg: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
                  text: isDark ? 'text-orange-200' : 'text-orange-900',
                  icon: AlertTriangle,
                  title: 'Warning'
                },
                CAUTION: {
                  border: isDark ? 'border-l-4 border-red-400' : 'border-l-4 border-red-500',
                  bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
                  text: isDark ? 'text-red-200' : 'text-red-900',
                  icon: OctagonAlert,
                  title: 'Caution'
                }
              };
              
              const style = alertStyles[alertType];
              
              const removeMarker = (node: any, isFirst: boolean = true): any => {
                if (typeof node === 'string') {
                  return isFirst ? node.replace(/^\[![A-Z]+\]\s*/, '') : node;
                }
                if (Array.isArray(node)) {
                  let foundFirst = false;
                  return node.map((child) => {
                    if (!foundFirst && typeof child === 'string' && child.match(/^\[![A-Z]+\]/)) {
                      foundFirst = true;
                      return removeMarker(child, true);
                    }
                    if (!foundFirst && child && typeof child === 'object') {
                      const result = removeMarker(child, !foundFirst);
                      if (result !== child) foundFirst = true;
                      return result;
                    }
                    return child;
                  });
                }
                if (node && typeof node === 'object' && node.props) {
                  const newChildren = removeMarker(node.props.children, isFirst);
                  if (newChildren !== node.props.children) {
                    return { ...node, props: { ...node.props, children: newChildren } };
                  }
                }
                return node;
              };
              
              const contentWithoutMarker = removeMarker(children);
              const IconComponent = style.icon;
              
              return (
                <div className={`${style.bg} ${style.border} ${style.text} rounded-lg p-4 my-4 not-italic`}>
                  <div className="flex items-start gap-3">
                    <IconComponent className="shrink-0 mt-0.5 w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm lg:text-base mb-2">{style.title}</div>
                      <div className="text-sm lg:text-base [&>p]:mb-1! [&>p:last-child]:mb-0! [&>p]:leading-normal! [&_br]:hidden! [&_strong]:font-semibold [&_code]:text-current">
                        {contentWithoutMarker}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 lg:pl-4 italic my-3 lg:my-4 text-sm lg:text-base">
                {children}
              </blockquote>
            );
          },
          // Handle tables nicely
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-border">
              <table {...props} className="min-w-full divide-y divide-border" />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead {...props} className="bg-muted/50" />
          ),
          tbody: ({ ...props }) => (
            <tbody {...props} className="divide-y divide-border bg-background" />
          ),
          tr: ({ ...props }) => (
            <tr {...props} className="hover:bg-muted/30 transition-colors" />
          ),
          th: ({ ...props }) => (
            <th {...props} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" />
          ),
          td: ({ ...props }) => (
            <td {...props} className="px-4 py-3 text-sm" />
          ),
          // Handle horizontal rules
          hr: ({ ...props }) => (
            <hr {...props} className="my-6 border-border" />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

