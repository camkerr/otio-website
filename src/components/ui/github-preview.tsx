"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useTheme } from "next-themes";
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
  accentBar: { light: string; dark: string };
  accentContainer: { light: string; dark: string };
  badge: { light: string; dark: string };
  icon: ReactNode;
};

const STATUS_THEMES: Record<string, StatusTheme> = {
  open: {
    label: "Open",
    accentBar: {
      light: "bg-emerald-400",
      dark: "bg-emerald-400/90",
    },
    accentContainer: {
      light: "border-emerald-500/35 bg-emerald-500/12 text-emerald-600 shadow-inner",
      dark: "border-emerald-400/40 bg-emerald-500/20 text-emerald-200 shadow-inner",
    },
    badge: {
      light: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
      dark: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
    },
    icon: <GitPullRequest className="h-4 w-4" strokeWidth={2.2} />,
  },
  closed: {
    label: "Closed",
    accentBar: {
      light: "bg-rose-500",
      dark: "bg-rose-400/90",
    },
    accentContainer: {
      light: "border-rose-500/35 bg-rose-500/12 text-rose-600 shadow-inner",
      dark: "border-rose-400/35 bg-rose-500/20 text-rose-200 shadow-inner",
    },
    badge: {
      light: "bg-rose-500/15 text-rose-700 border-rose-500/30",
      dark: "bg-rose-500/20 text-rose-200 border-rose-400/35",
    },
    icon: <CheckCircle className="h-4 w-4" strokeWidth={2.2} />,
  },
  merged: {
    label: "Merged",
    accentBar: {
      light: "bg-violet-500",
      dark: "bg-violet-500/90",
    },
    accentContainer: {
      light: "border-violet-500/35 bg-violet-500/12 text-violet-600 shadow-inner",
      dark: "border-violet-400/35 bg-violet-500/20 text-violet-200 shadow-inner",
    },
    badge: {
      light: "bg-violet-500/15 text-violet-700 border-violet-500/30",
      dark: "bg-violet-500/20 text-violet-200 border-violet-400/35",
    },
    icon: <GitMerge className="h-4 w-4" strokeWidth={2.2} />,
  },
  default: {
    label: "Unknown",
    accentBar: {
      light: "bg-slate-400/80",
      dark: "bg-slate-500/70",
    },
    accentContainer: {
      light: "border-slate-400/40 bg-slate-200/70 text-slate-600 shadow-inner",
      dark: "border-slate-600/50 bg-slate-800/70 text-slate-200 shadow-inner",
    },
    badge: {
      light: "bg-slate-200/80 text-slate-600 border-slate-300/60",
      dark: "bg-slate-800/60 text-slate-200 border-slate-700/50",
    },
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
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
    const surfaceBase = isDark ? "bg-slate-900/85" : "bg-white/95";
    const subtleText = isDark ? "text-slate-200" : "text-slate-600";
    const mutedText = isDark ? "text-slate-300" : "text-slate-500";
    const spinnerBorder = isDark ? "border-slate-700" : "border-slate-200";

    if (loading) {
      return (
        <div className={cn("flex flex-col items-center gap-3 px-6 py-10", surfaceBase)}>
          <div
            className={cn(
              "h-9 w-9 animate-spin rounded-full border-[3px] border-b-transparent",
              spinnerBorder,
            )}
          />
          <p className={cn("text-sm", subtleText)}>Fetching from GitHub…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", surfaceBase)}>
          <AlertCircle className={cn("h-8 w-8", isDark ? "text-rose-300" : "text-rose-500")} />
          <p className={cn("text-sm", isDark ? "text-rose-300" : "text-rose-600")}>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className={cn(
              "text-xs font-medium transition-colors",
              isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700",
            )}
          >
            Try again
          </button>
        </div>
      );
    }

    if (!issueData) {
      return (
        <div className={cn("px-6 py-8 text-center text-sm", subtleText)}>
          No details available for this reference yet.
        </div>
      );
    }

    const statusTheme = getStatusTheme(issueData.state);
    const accentBarClass = statusTheme.accentBar[isDark ? "dark" : "light"];
    const accentContainerClass = statusTheme.accentContainer[isDark ? "dark" : "light"];
    const badgeClass = statusTheme.badge[isDark ? "dark" : "light"];
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
          <div
            className={cn(
              "flex items-start gap-4 border-b px-6 py-5 backdrop-blur-sm",
              isDark ? "border-slate-700/70 bg-slate-800/80" : "border-slate-200/80 bg-slate-50/95",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border text-base",
                accentContainerClass,
              )}
            >
              {statusTheme.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "text-sm font-semibold leading-snug",
                  isDark ? "text-slate-50" : "text-slate-900",
                )}
              >
                {issueData.title}
              </h3>
              <div
                className={cn(
                  "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs",
                  isDark ? "text-slate-200" : "text-slate-600",
                )}
              >
                <span
                  className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border", badgeClass)}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusTheme.label}
                </span>
                <span className={cn("font-medium", mutedText)}>#{issueData.number}</span>
                <span className={cn("font-medium", isDark ? "text-slate-500" : "text-slate-400")}>•</span>
                <span className={cn("font-medium", subtleText)}>by {issueData.user.login}</span>
                {lastUpdated && (
                  <>
                    <span className={cn("font-medium", isDark ? "text-slate-500" : "text-slate-400")}>•</span>
                    <span className={cn("font-medium", subtleText)}>Updated {lastUpdated}</span>
                  </>
                )}
              </div>
            </div>
            <a
              href={issueData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "text-blue-300 hover:bg-blue-500/10 hover:text-blue-200 ring-blue-400/40 ring-offset-slate-900"
                  : "text-blue-600 hover:bg-blue-50 hover:text-blue-700 ring-blue-600/30 ring-offset-white",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div
          className={cn(
            "flex-1 overflow-y-auto px-6 py-5",
            isDark ? "bg-slate-900/90" : "bg-white/98",
          )}
        >
          <MarkdownRenderer
            content={issueData.body || "No description provided."}
            className={cn(
              "text-xs",
              isDark
                ? "prose-headings:text-slate-50 prose-li:text-slate-200 prose-p:text-slate-200 prose-strong:text-slate-50 prose-a:text-blue-300 hover:prose-a:text-blue-200 prose-code:text-slate-100"
                : "prose-headings:text-slate-900 prose-li:text-slate-700 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700",
            )}
          />
        </div>
      </div>
    );
  };

  const cardContent = renderCardContent();
  const cardShellClass = cn(
    "overflow-hidden rounded-2xl transition-[background-color,box-shadow,border-color] backdrop-blur-sm ring-1",
    isDark
      ? "border border-slate-700/80 bg-slate-900/90 shadow-[0_24px_60px_rgba(15,23,42,0.65)] ring-white/10"
      : "border border-slate-200/80 bg-white/95 shadow-xl ring-black/5",
  );

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
        <div className={cardShellClass}>
          {cardContent}
        </div>
      </PopoverContent>
    </Popover>
  );
}

