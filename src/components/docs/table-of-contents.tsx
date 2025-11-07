"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type TocItem } from "@/lib/toc-extractor";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const headingCacheRef = useRef<{ id: string; element: HTMLElement }[]>([]);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (items.length === 0) return;

    activeIdRef.current = null;
    setActiveId(null);
    headingCacheRef.current = [];

    scrollContainerRef.current = document.querySelector('[data-docs-scroll-container]') as HTMLElement | null;

    const HEADER_OFFSET = 120;

    const getScrollPosition = () => {
      if (scrollContainerRef.current) {
        return scrollContainerRef.current.scrollTop;
      }
      return window.scrollY;
    };

    const getElementTop = (element: HTMLElement) => {
      if (scrollContainerRef.current) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return elementRect.top - containerRect.top + scrollContainerRef.current.scrollTop;
      }
      return element.getBoundingClientRect().top + window.scrollY;
    };

    const collectHeadings = () => {
      headingCacheRef.current = items
        .map((item) => {
          const element = document.getElementById(item.id);
          if (element instanceof HTMLElement) {
            return { id: item.id, element };
          }
          return null;
        })
        .filter((entry): entry is { id: string; element: HTMLElement } => entry !== null);
    };

    const getActiveHeading = (): string | null => {
      if (headingCacheRef.current.length === 0) {
        collectHeadings();
      }

      const headings = headingCacheRef.current;
      if (headings.length === 0) {
        return null;
      }

      const scrollPosition = getScrollPosition() + HEADER_OFFSET;
      let currentId = headings[0].id;

      for (const { id, element } of headings) {
        const elementTop = getElementTop(element);
        if (elementTop <= scrollPosition) {
          currentId = id;
        } else {
          break;
        }
      }

      return currentId;
    };

    const updateActiveHeading = () => {
      const newActiveId = getActiveHeading();
      if (newActiveId && newActiveId !== activeIdRef.current) {
        activeIdRef.current = newActiveId;
        setActiveId(newActiveId);
      }
    };

    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        updateActiveHeading();
        rafIdRef.current = null;
      });
    };

    collectHeadings();
    updateActiveHeading();

    const retryTimeouts: number[] = [];
    retryTimeouts.push(window.setTimeout(() => {
      collectHeadings();
      updateActiveHeading();
    }, 100));
    retryTimeouts.push(window.setTimeout(() => {
      collectHeadings();
      updateActiveHeading();
    }, 300));

    const scrollTarget: HTMLElement | Window = scrollContainerRef.current ?? window;
    scrollTarget.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    const contentArea = document.querySelector('.document-content');
    const mutationObserver = new MutationObserver(() => {
      collectHeadings();
      updateActiveHeading();
    });

    if (contentArea) {
      mutationObserver.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      scrollTarget.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      retryTimeouts.forEach((id) => clearTimeout(id));
      mutationObserver.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block sticky top-[calc(73px+1rem)] self-start w-64 shrink-0 ml-8 max-h-[calc(100vh-73px-2rem)]">
      <div className="h-full overflow-y-auto">
        <nav className="relative">
          {/* Progress indicator line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
          
          <ul className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeId === item.id;
              
              return (
                <li key={`${item.id}-${index}`}>
                  <Link
                    href={`#${item.id}`}
                    className={cn(
                      "group relative flex items-start py-1.5 pl-4 transition-colors",
                      "hover:text-foreground",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                    )}
                    onClick={() => {
                      // Update active ID when clicked
                      activeIdRef.current = item.id;
                      setActiveId(item.id);
                    }}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground" />
                    )}
                    
                    {/* Text with truncation */}
                    <span
                      className={cn(
                        "block truncate text-sm leading-relaxed",
                        item.level === 1 ? "font-semibold" : "font-normal",
                        item.level === 2 && "pl-4"
                      )}
                      title={item.text}
                    >
                      {item.text}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}


