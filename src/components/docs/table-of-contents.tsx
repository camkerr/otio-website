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
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) return;

    // Reset initialization flag when items change
    hasInitializedRef.current = false;

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
    const observedElements = new Set<Element>();

    // Wait for DOM to be ready, then observe all heading elements
    const observeHeadings = () => {
      const foundElements: Element[] = [];
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element && !observedElements.has(element)) {
          foundElements.push(element);
          observedElements.add(element);
          observer.observe(element);
        }
      });
      
      // If we found elements, set initial active item (only once)
      if (foundElements.length > 0 && !hasInitializedRef.current) {
        setActiveId(foundElements[0].id);
        hasInitializedRef.current = true;
      }
      
      return observedElements.size;
    };

    // Use MutationObserver to detect when headings are added to the DOM
    // Only observe the document content area to avoid excessive callbacks
    const contentArea = document.querySelector('.document-content');
    const targetNode = contentArea || document.body;
    
    let mutationObserver: MutationObserver | null = null;
    let hasFoundAllHeadings = false;

    const setupMutationObserver = () => {
      if (hasFoundAllHeadings) return;
      
      mutationObserver = new MutationObserver(() => {
        const foundCount = observeHeadings();
        // If we found all headings, we can disconnect the mutation observer
        if (foundCount === items.length) {
          hasFoundAllHeadings = true;
          mutationObserver?.disconnect();
        }
      });

      // Start observing the document for changes
      mutationObserver.observe(targetNode, {
        childList: true,
        subtree: true,
      });
    };

    // Try immediately, then retry with increasing delays
    let foundCount = observeHeadings();
    const timeoutIds: NodeJS.Timeout[] = [];
    
    if (foundCount === items.length) {
      hasFoundAllHeadings = true;
    } else {
      // Setup mutation observer to catch headings as they're added
      setupMutationObserver();
      
      // Retry after short delay
      timeoutIds.push(setTimeout(() => {
        foundCount = observeHeadings();
        if (foundCount === items.length) {
          hasFoundAllHeadings = true;
          mutationObserver?.disconnect();
        } else if (foundCount < items.length) {
          // Retry after longer delay
          timeoutIds.push(setTimeout(() => {
            const finalCount = observeHeadings();
            if (finalCount === items.length) {
              hasFoundAllHeadings = true;
              mutationObserver?.disconnect();
            }
          }, 300));
        }
      }, 100));
    }

    return () => {
      mutationObserver?.disconnect();
      timeoutIds.forEach(id => clearTimeout(id));
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

