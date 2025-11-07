"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type TocItem } from "@/lib/toc-extractor";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const observerOptions = {
      rootMargin: "-73px 0px -66% 0px", // Account for header and trigger when section is in upper third
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Get all visible entries
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Find the entry with the highest intersection ratio
        const mostVisible = visibleEntries.reduce((prev, current) => 
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );
        setActiveId(mostVisible.target.id);
      } else {
        // No visible entries - find the last heading that passed the top
        const passedEntries = entries
          .filter((entry) => entry.boundingClientRect.top < 100)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);
        
        if (passedEntries.length > 0) {
          setActiveId(passedEntries[0].target.id);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Wait for DOM to be ready, then observe all heading elements
    const observeHeadings = () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.observe(element);
        }
      });
    };

    // Try immediately, then retry after a short delay to ensure DOM is ready
    observeHeadings();
    const timeoutId = setTimeout(observeHeadings, 100);

    // Set initial active item to first heading
    if (items.length > 0) {
      const firstElement = document.getElementById(items[0].id);
      if (firstElement) {
        setActiveId(items[0].id);
      }
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
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

