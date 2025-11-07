"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type DocItem } from "@/lib/docs-manifest";
import { getCategoryDisplayName } from "@/lib/docs-manifest";
import { cn } from "@/lib/utils";

interface DocNavigationProps {
  previous: DocItem | null;
  next: DocItem | null;
}

export function DocNavigation({ previous, next }: DocNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 pb-4 border-t border-border">
      <div className="flex flex-col sm:flex-row gap-4">
        {previous ? (
          <Link
            href={`/docs/${previous.slug}`}
            className={cn(
              "flex-1 group rounded-lg border border-border bg-card p-4 transition-colors",
              "hover:bg-muted hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-foreground group-hover:text-primary transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>{previous.title}</span>
            </div>
            {previous.category && (
              <div className="text-sm text-muted-foreground mt-1 ml-6">
                {getCategoryDisplayName(previous.category)}
              </div>
            )}
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        
        {next ? (
          <Link
            href={`/docs/${next.slug}`}
            className={cn(
              "flex-1 group rounded-lg border border-border bg-card p-4 transition-colors",
              "hover:bg-muted hover:border-primary/50 text-right"
            )}
          >
            <div className="flex items-center justify-end gap-2 font-semibold text-foreground group-hover:text-primary transition-colors">
              <span>{next.title}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
            {next.category && (
              <div className="text-sm text-muted-foreground mt-1 mr-6 text-right">
                {getCategoryDisplayName(next.category)}
              </div>
            )}
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}

