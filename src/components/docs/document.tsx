"use client";

import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { type DocMetadata } from "@/lib/github-docs";
import { formatDistanceToNow } from "date-fns";
import { EditInGithub } from "@/components/edit-in-github";

interface DocumentProps {
  markdown: string;
  title?: string;
  metadata?: DocMetadata;
  editUrl?: string;
}

export function Document({ markdown, title, metadata, editUrl }: DocumentProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <article className="w-full">
      {title && (
        <header className="mb-8 py-6 border-b border-border">
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
    </article>
  );
}

