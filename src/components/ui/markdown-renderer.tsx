"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { getProxiedImageUrl } from "@/lib/utils";
import { type LightboxImage } from "@/components/ui/lightbox";

interface MarkdownRendererProps {
  content: string;
  openLightbox?: (images: LightboxImage[], startIndex: number) => void;
  className?: string;
}

export function MarkdownRenderer({ content, openLightbox, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm lg:prose-base max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-100 prose-li:text-gray-700 dark:prose-li:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-strong:text-gray-900 dark:prose-strong:text-white ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ ...props }) => {
            const proxiedSrc = props.src && typeof props.src === 'string' ? getProxiedImageUrl(props.src) : props.src;

            if (!proxiedSrc || typeof proxiedSrc !== 'string') {
              return <div className="text-gray-700 dark:text-gray-100">Invalid image source</div>;
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
          a: ({ ...props }) => (
            <a
              {...props}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 dark:decoration-blue-500 hover:decoration-blue-500 dark:hover:decoration-blue-400"
              target={props.href?.startsWith('http') ? "_blank" : undefined}
              rel={props.href?.startsWith('http') ? "noopener noreferrer" : undefined}
            />
          ),
          video: ({ ...props }) => (
            <video
              {...props}
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm my-3 lg:my-4"
              controls
              style={{ maxHeight: '300px' }}
            />
          ),
          h1: ({ ...props }) => (
            <h1 {...props} className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-2 lg:mt-6 mb-3 lg:mb-4" />
          ),
          h2: ({ ...props }) => (
            <h2 {...props} className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mt-1 lg:mt-5 mb-2 lg:mb-3" />
          ),
          h3: ({ ...props }) => (
            <h3 {...props} className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mt-2 lg:mt-4 mb-2" />
          ),
          p: ({ ...props }) => (
            <p {...props} className="mb-3 lg:mb-4 leading-relaxed text-sm lg:text-base text-gray-700 dark:text-gray-100" />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc list-outside mb-3 lg:mb-4 space-y-1 lg:space-y-2 pl-6 text-gray-700 dark:text-gray-100 [&_ul]:list-[circle] [&_ul_ul]:list-[square] [&_ul_ul_ul]:list-['▸\00a0'] [&_ul_ul_ul_ul]:list-['–\00a0'] [&_ul]:mt-1 [&_ul]:mb-1 [&_ul]:pl-4" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-3 lg:mb-4 space-y-1 lg:space-y-2 pl-2 text-gray-700 dark:text-gray-100" />
          ),
          li: ({ ...props }) => (
            <li {...props} className="leading-relaxed text-sm lg:text-base text-gray-700 dark:text-gray-100" />
          ),
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold text-gray-900 dark:text-white" />
          ),
          em: ({ ...props }) => (
            <em {...props} className="italic text-gray-700 dark:text-gray-100" />
          ),
          br: ({ ...props }) => (
            <br {...props} />
          ),
          code: ({ ...props }) => {
            const isInline = !(props as { className?: string }).className?.includes('language-');
            return isInline ? (
              <code {...props} className="bg-gray-100 dark:bg-black/30 text-gray-800 dark:text-gray-100 px-1.5 py-0.5 rounded text-xs lg:text-sm font-mono" />
            ) : (
              <code {...props} className="block bg-gray-100 dark:bg-black/30 text-gray-800 dark:text-gray-100 p-2 rounded text-xs lg:text-sm font-mono overflow-x-auto" />
            );
          },
          pre: ({ ...props }) => (
            <pre {...props} className="bg-gray-100 dark:bg-black/30 text-gray-800 dark:text-gray-100 p-2 lg:p-3 rounded border border-gray-200 dark:border-white/5 overflow-x-auto my-2 lg:my-3 text-xs lg:text-sm" />
          ),
          blockquote: ({ ...props }) => (
            <blockquote {...props} className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 lg:pl-4 italic text-gray-600 dark:text-gray-100 my-3 lg:my-4 text-sm lg:text-base" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
