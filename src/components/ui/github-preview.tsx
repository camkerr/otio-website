"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ExternalLink, GitMerge, GitPullRequest, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubIssueData {
  title: string;
  body: string;
  state: string;
  html_url: string;
  number: number;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

interface GitHubPreviewProps {
  issueNumber: string;
  repo?: string;
  children: React.ReactNode;
}

type StatusTheme = {
  label: string;
  accentBar: string;
  accentClass: string;
  badgeClass: string;
  icon: ReactNode;
};

const STATUS_THEMES: Record<string, StatusTheme> = {
  open: {
    label: "Open",
    accentBar: "bg-emerald-400",
    accentClass:
      "border-emerald-500/35 bg-emerald-500/12 text-emerald-600 shadow-inner dark:border-emerald-400/40 dark:bg-emerald-500/20 dark:text-emerald-200",
    badgeClass:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/40",
    icon: <GitPullRequest className="h-4 w-4" strokeWidth={2.2} />,
  },
  closed: {
    label: "Closed",
    accentBar: "bg-rose-500",
    accentClass:
      "border-rose-500/35 bg-rose-500/12 text-rose-600 shadow-inner dark:border-rose-400/35 dark:bg-rose-500/20 dark:text-rose-200",
    badgeClass:
      "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-400/35",
    icon: <CheckCircle className="h-4 w-4" strokeWidth={2.2} />,
  },
  merged: {
    label: "Merged",
    accentBar: "bg-violet-500",
    accentClass:
      "border-violet-500/35 bg-violet-500/12 text-violet-600 shadow-inner dark:border-violet-400/35 dark:bg-violet-500/20 dark:text-violet-200",
    badgeClass:
      "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:bg-violet-500/20 dark:text-violet-200 dark:border-violet-400/35",
    icon: <GitMerge className="h-4 w-4" strokeWidth={2.2} />,
  },
  default: {
    label: "Unknown",
    accentBar: "bg-slate-400/80",
    accentClass:
      "border-slate-400/40 bg-slate-200/70 text-slate-600 shadow-inner dark:border-slate-600/50 dark:bg-slate-800/70 dark:text-slate-200",
    badgeClass:
      "bg-slate-200/80 text-slate-600 border-slate-300/60 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-700/50",
    icon: <AlertCircle className="h-4 w-4" strokeWidth={2.2} />,
  },
};

function getStatusTheme(state: string): StatusTheme {
  const normalized = state?.toLowerCase();
  return STATUS_THEMES[normalized] ?? STATUS_THEMES.default;
}

export function GitHubPreview({
  issueNumber,
  repo = "AcademySoftwareFoundation/OpenTimelineIO",
  children,
}: GitHubPreviewProps) {
  const [issueData, setIssueData] = useState<GitHubIssueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const fetchIssue = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        number: issueNumber,
        repo,
      });

      const response = await fetch(`/api/github-preview?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch issue data");
      }

      const data = await response.json();
      setIssueData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [issueNumber, repo]);

  useEffect(() => {
    if (!isOpen) return;
    if (issueData) return;

    fetchIssue();
  }, [fetchIssue, isOpen, issueData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      isFetchingRef.current = false;
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      openTimeoutRef.current = null;
    }, 180);
  };

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 120);
  };

  const handleRetry = () => {
    setIssueData(null);
    fetchIssue();
  };

  const renderCardContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-10 bg-white/95 dark:bg-slate-900/85">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-b-transparent dark:border-slate-700 dark:border-b-transparent" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Fetching from GitHub…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center bg-white/95 dark:bg-slate-900/85">
          <AlertCircle className="h-8 w-8 text-rose-500 dark:text-rose-300" />
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!issueData) {
      return (
        <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
          No details available for this reference yet.
        </div>
      );
    }

    const statusTheme = getStatusTheme(issueData.state);
    const lastUpdated = issueData.updated_at
      ? new Date(issueData.updated_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

    return (
      <div className="flex max-h-[min(520px,70vh)] flex-col">
        <div className="relative">
          <span className={cn("absolute inset-y-0 left-0 w-1", statusTheme.accentBar)} aria-hidden />
          <div className="flex items-start gap-4 border-b border-slate-200/80 bg-slate-50/90 px-6 py-5 pl-7 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-800/70">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-base",
                statusTheme.accentClass,
              )}
            >
              {statusTheme.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                {issueData.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border",
                    statusTheme.badgeClass,
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusTheme.label}
                </span>
                <span className="text-slate-500 dark:text-slate-400">#{issueData.number}</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-slate-500 dark:text-slate-300">by {issueData.user.login}</span>
                {lastUpdated && (
                  <>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-slate-500 dark:text-slate-300">Updated {lastUpdated}</span>
                  </>
                )}
              </div>
            </div>
            <a
              href={issueData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white/98 px-6 py-5 dark:bg-slate-900/85">
          <MarkdownRenderer
            content={issueData.body || "No description provided."}
            className="text-xs prose-headings:text-slate-900 prose-li:text-slate-700 prose-p:text-slate-700 prose-strong:text-slate-900 dark:prose-headings:text-slate-100 dark:prose-li:text-slate-300 dark:prose-p:text-slate-300 dark:prose-strong:text-slate-100"
          />
        </div>
      </div>
    );
  };

  const cardContent = renderCardContent();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        variant="unstyled"
        className="w-[min(520px,90vw)] max-w-[min(520px,90vw)] border-none bg-transparent p-0 shadow-none"
        side="top"
        align="center"
        sideOffset={12}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl ring-1 ring-black/5 transition-colors dark:border-slate-700/80 dark:bg-slate-900/85 dark:backdrop-blur-md dark:ring-white/5 dark:shadow-[0_24px_60px_rgba(15,23,42,0.6)]">
          {cardContent}
        </div>
      </PopoverContent>
    </Popover>
  );
}

