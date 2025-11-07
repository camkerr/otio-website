"use client";

import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { type DocMetadata } from "@/lib/github-docs";
import { type DocItem } from "@/lib/docs-manifest";
import { formatDistanceToNow } from "date-fns";
import { EditInGithub } from "@/components/edit-in-github";
import { DocNavigation } from "@/components/docs/doc-navigation";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { extractHeadings } from "@/lib/toc-extractor";
import { useMemo } from "react";

interface DocumentProps {
  markdown: string;
  title?: string;
  metadata?: DocMetadata;
  editUrl?: string;
  previous?: DocItem | null;
  next?: DocItem | null;
}

export function Document({ markdown, title, metadata, editUrl, previous, next }: DocumentProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const headings = useMemo(() => extractHeadings(markdown), [markdown]);

  return (
    <div className="flex gap-8 w-full">
      <article className="flex-1 min-w-0">
        {title && (
          <header className="mb-8 py-8 border-b border-border">
            <h1 className="text-3xl lg:text-4xl xl:text-4xl font-bold tracking-tight text-foreground mb-4">
              {title}
            </h1>
            {(metadata || editUrl) && (
              <div className="flex items-center justify-between gap-4">
                {metadata && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Last updated {formatDate(metadata.lastModified)} by{" "}
                    </span>
                    {metadata.lastEditor.avatar_url && (
                      <img
                        src={metadata.lastEditor.avatar_url}
                        alt={metadata.lastEditor.login}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <a
                      href={`https://github.com/${metadata.lastEditor.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {metadata.lastEditor.login}
                    </a>
                  </div>
                )}
                {editUrl && (
                  <div className="shrink-0">
                    <EditInGithub url={editUrl} />
                  </div>
                )}
              </div>
            )}
          </header>
        )}
        <div className="document-content">
          <MarkdownRenderer content={markdown} />
        </div>
        <DocNavigation previous={previous || null} next={next || null} />
      </article>
      <TableOfContents items={headings} />
    </div>
  );
}

