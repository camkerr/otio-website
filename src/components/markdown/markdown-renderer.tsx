"use client";

import { useState, useEffect, Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { getProxiedImageUrl } from "@/lib/utils";
import { rehypeSlugCustom } from "@/lib/rehype-slug-custom";
import { type LightboxImage } from "@/components/media/lightbox";
import { formatMarkdown } from "@/lib/markdown-utils";
import { Info, Lightbulb, AlertCircle, AlertTriangle, OctagonAlert, Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  openLightbox?: (images: LightboxImage[], startIndex: number) => void;
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

export function MarkdownRenderer({ content, openLightbox, className = "" }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we only use the theme after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use a default theme during SSR to match initial client render
  // Default to light theme to match the default system preference
  const isDark = mounted && resolvedTheme === "dark";
  
  // Format markdown to normalize line breaks before rendering
  const formattedContent = formatMarkdown(content);
  
  return (
    <div className={`prose prose-sm lg:prose-base max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeSlugCustom]}
        components={{
          img: ({ ...props }) => {
            const proxiedSrc = props.src && typeof props.src === 'string' ? getProxiedImageUrl(props.src) : props.src;

            if (!proxiedSrc || typeof proxiedSrc !== 'string') {
              return <div>Invalid image source</div>;
            }

            const handleImageClick = () => {
              if (!openLightbox) return;

              // Collect all images from the rendered DOM
              const images: LightboxImage[] = [];
              
              // Find all img elements in the current document that are part of the markdown content
              const articleElement = document.querySelector('.document-content') || document.querySelector('article');
              if (articleElement) {
                const imgElements = articleElement.querySelectorAll('img');
                
                imgElements.forEach((img) => {
                  const src = img.getAttribute('src');
                  if (src && !src.includes('avatar')) { // Skip avatar images
                    images.push({
                      src: src,
                      alt: img.getAttribute('alt') || undefined,
                      title: img.getAttribute('title') || img.getAttribute('alt') || undefined,
                    });
                  }
                });
              }

              const currentIndex = images.findIndex(img => img.src === proxiedSrc);
              openLightbox(images, Math.max(0, currentIndex));
            };

            return (
              <Image
                {...props}
                src={proxiedSrc}
                alt={props.alt || "Image"}
                width={800}
                height={500}
                className={`max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm my-3 lg:my-4 transition-opacity ${openLightbox ? 'cursor-pointer hover:opacity-90' : ''}`}
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onClick={openLightbox ? handleImageClick : undefined}
                unoptimized
              />
            );
          },
          a: ({ ...props }) => {
            const isExternal = props.href?.startsWith('http');
            const isAnchor = props.href?.startsWith('#');
            const Component = isExternal || isAnchor ? 'a' : Link;
            const href = props.href || '#';
            
            return (
              <Component
                {...props}
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              />
            );
          },
          video: ({ ...props }) => (
            <video
              {...props}
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm my-3 lg:my-4"
              controls
              style={{ maxHeight: '300px' }}
            />
          ),
          h1: ({ ...props }) => (
            <h1
              {...props}
              className="text-2xl lg:text-3xl font-bold mt-6 lg:mt-8 mb-4 lg:mb-6 scroll-mt-8 group relative"
            >
              {props.children}
              {props.id && (
                <a
                  href={`#${props.id}`}
                  className="anchor-link opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground/60 hover:text-muted-foreground no-underline hover:underline"
                  aria-label="Link to this section"
                >
                  #
                </a>
              )}
            </h1>
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className="text-xl lg:text-2xl font-semibold mt-6 lg:mt-8 mb-3 lg:mb-4 scroll-mt-8 group relative"
            >
              {props.children}
              {props.id && (
                <a
                  href={`#${props.id}`}
                  className="anchor-link opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground/60 hover:text-muted-foreground no-underline hover:underline"
                  aria-label="Link to this section"
                >
                  #
                </a>
              )}
            </h2>
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className="text-lg lg:text-xl font-medium mt-5 lg:mt-6 mb-2 lg:mb-3 scroll-mt-8 group relative"
            >
              {props.children}
              {props.id && (
                <a
                  href={`#${props.id}`}
                  className="anchor-link opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground/60 hover:text-muted-foreground no-underline hover:underline"
                  aria-label="Link to this section"
                >
                  #
                </a>
              )}
            </h3>
          ),
          h4: ({ ...props }) => (
            <h4
              {...props}
              className="text-base lg:text-lg font-medium mt-4 lg:mt-5 mb-2 scroll-mt-8 group relative"
            >
              {props.children}
              {props.id && (
                <a
                  href={`#${props.id}`}
                  className="anchor-link opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-muted-foreground/60 hover:text-muted-foreground no-underline hover:underline"
                  aria-label="Link to this section"
                >
                  #
                </a>
              )}
            </h4>
          ),
          p: ({ ...props }) => (
            <p {...props} className="mb-5 lg:mb-6 leading-loose tracking-[0.0025em] text-sm lg:text-base" />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc list-outside mb-3 lg:mb-4 space-y-1 lg:space-y-2 pl-6 [&_ul]:list-[circle] [&_ul_ul]:list-[square] [&_ul_ul_ul]:list-['▸\00a0'] [&_ul_ul_ul_ul]:list-['–\00a0'] [&_ul]:mt-1 [&_ul]:mb-1 [&_ul]:pl-4 [&_li_br]:hidden! [&_li>p]:mb-0! [&_li>p]:mt-0!" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-3 lg:mb-4 space-y-3 lg:space-y-4 pl-0 [&_li_br]:hidden! [&_li>p]:mb-0! [&_li>p]:mt-0!" />
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

            return (
              <li
                {...props}
                className={`leading-relaxed text-sm lg:text-base ${className}`.trim()}
              >
                {singleParagraphChild ? paragraphChildren : children}
              </li>
            );
          },
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold" />
          ),
          em: ({ ...props }) => (
            <em {...props} className="italic" />
          ),
          br: ({ ...props }) => (
            <br {...props} />
          ),
          code: ({ className, children, ...props }: any) => {
            // Check if this is a code block (has language- prefix in className) or inline code
            // Also handle directive syntax like {glossary} by checking for language- prefix
            const hasLanguageClass = className && typeof className === 'string' && className.startsWith('language-');
            const match = /language-(.+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Inline code: no language class
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
                "rounded-lg",
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
            
            // For code blocks with directive syntax like {glossary}, use plain text highlighting
            // Standard languages like python, javascript, etc. will be highlighted normally
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
            // For code blocks, the code component returns CodeBlock which already has all styling
            // Check if children is a code element with language class and return it directly
            if (
              children &&
              typeof children === 'object' &&
              !Array.isArray(children) &&
              children.props &&
              children.props.className &&
              typeof children.props.className === 'string' &&
              children.props.className.includes('language-')
            ) {
              // Return the children directly - the code component will handle rendering
              return <>{children}</>;
            }
            // Also check if it's already been transformed to CodeBlock (div)
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
            // Fallback for pre without code highlighting
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
            // Helper to extract all text content recursively
            const extractAllText = (node: any): string => {
              if (typeof node === 'string') return node;
              if (Array.isArray(node)) return node.map(extractAllText).join('');
              if (node && typeof node === 'object' && node.props?.children) {
                return extractAllText(node.props.children);
              }
              return '';
            };
            
            // Get all text content to search for the alert marker
            const allText = extractAllText(children).trim();
            
            // Check for alert syntax [!TYPE] (case insensitive, with optional whitespace)
            const alertMatch = allText.match(/^\s*\[!\s*(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\s*\]/i);
            
            if (alertMatch) {
              const alertType = alertMatch[1].toUpperCase();
              
              // Define styling for each alert type with proper light/dark mode support
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
              
              // Helper to recursively remove the [!TYPE] marker from content
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
            
            // Regular blockquote
            return (
              <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 lg:pl-4 italic my-3 lg:my-4 text-sm lg:text-base">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
