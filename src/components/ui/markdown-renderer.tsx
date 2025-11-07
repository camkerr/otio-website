"use client";

import { useState, useEffect } from "react";
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
import { type LightboxImage } from "@/components/ui/lightbox";
import { formatMarkdown } from "@/lib/markdown-utils";

interface MarkdownRendererProps {
  content: string;
  openLightbox?: (images: LightboxImage[], startIndex: number) => void;
  className?: string;
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

              // Collect all images from the markdown content
              const images: LightboxImage[] = [];
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = content;
              const imgElements = tempDiv.querySelectorAll('img');

              imgElements.forEach((img) => {
                const src = img.getAttribute('src');
                if (src) {
                  images.push({
                    src: getProxiedImageUrl(src),
                    alt: img.getAttribute('alt') || undefined,
                    title: img.getAttribute('title') || img.getAttribute('alt') || undefined,
                  });
                }
              });

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
            <ul {...props} className="list-disc list-outside mb-3 lg:mb-4 space-y-1 lg:space-y-2 pl-6 [&_ul]:list-[circle] [&_ul_ul]:list-[square] [&_ul_ul_ul]:list-['▸\00a0'] [&_ul_ul_ul_ul]:list-['–\00a0'] [&_ul]:mt-1 [&_ul]:mb-1 [&_ul]:pl-4" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-3 lg:mb-4 space-y-1 lg:space-y-2 pl-2" />
          ),
          li: ({ ...props }) => (
            <li {...props} className="leading-relaxed text-sm lg:text-base" />
          ),
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
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const isInline = !match;
            
            if (isInline) {
              return (
                <code
                  {...props}
                  className="bg-muted text-foreground px-1.5 py-0.5 rounded-lg text-xs lg:text-sm font-mono border border-border"
                >
                  {children}
                </code>
              );
            }
            
            return (
              <SyntaxHighlighter
                language={language}
                style={isDark ? oneDark : oneLight}
                PreTag="div"
                className="rounded-lg border border-border text-xs lg:text-sm shadow-sm"
                customStyle={{
                  margin: '1rem 0',
                  padding: '0.5rem 0.75rem',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                    padding: 0,
                    margin: 0,
                  }
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          pre: ({ children, ...props }: any) => {
            // For code blocks, the code component returns SyntaxHighlighter which already has all styling
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
            // Also check if it's already been transformed to SyntaxHighlighter (div)
            if (
              children &&
              typeof children === 'object' &&
              !Array.isArray(children) &&
              children.type === 'div' &&
              children.props?.className &&
              typeof children.props.className === 'string' &&
              children.props.className.includes('rounded-lg')
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
          blockquote: ({ ...props }) => (
            <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 lg:pl-4 italic my-3 lg:my-4 text-sm lg:text-base" />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
