"use client";

import { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { ExternalLink, GitPullRequest, AlertCircle, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    if (!isOpen) return;

    // Only fetch if we don't have data yet
    if (issueData) return;

    const fetchIssueData = async () => {
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
      }
    };

    fetchIssueData();
  }, [isOpen, issueNumber, repo, issueData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case "open":
        return <Circle className="h-4 w-4 text-green-600 dark:text-green-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-500" />;
      case "merged":
        return <GitPullRequest className="h-4 w-4 text-purple-600 dark:text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-500" />;
    }
  };

  const getStateBadge = (state: string) => {
    const stateMap: Record<string, { label: string; variant: "primary" | "secondary" | "success" | "warning" | "info" | "outline" | "destructive" }> = {
      open: { label: "Open", variant: "success" },
      closed: { label: "Closed", variant: "secondary" },
      merged: { label: "Merged", variant: "info" },
    };

    const badgeInfo = stateMap[state.toLowerCase()] || { label: state, variant: "secondary" };
    return <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>;
  };

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Clear any existing open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    
    // Delay opening to avoid flickering on quick mouse movements
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    
    // Delay closing to allow mouse to move into popover
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] max-w-[90vw] p-0 overflow-hidden border-gray-200! dark:border-gray-700! bg-white! dark:bg-gray-900! shadow-xl! dark:shadow-2xl!"
        side="top"
        align="center"
        sideOffset={8}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {loading && (
          <div className="p-6 text-center bg-white! dark:bg-gray-900!">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading issue data...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center bg-white! dark:bg-gray-900!">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {issueData && (
          <div className="flex flex-col max-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-200! dark:border-gray-700! bg-gray-50! dark:bg-gray-800!">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStateIcon(issueData.state)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                    {issueData.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {getStateBadge(issueData.state)}
                    <span className="text-gray-700 dark:text-gray-300">#{issueData.number}</span>
                    <span className="text-gray-500 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400">by {issueData.user.login}</span>
                  </div>
                </div>
                <a
                  href={issueData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 shrink-0 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Body with scrollable markdown */}
            <div className="flex-1 overflow-y-auto p-4 bg-white! dark:bg-gray-900!">
              <MarkdownRenderer
                content={issueData.body || "No description provided."}
                className="text-xs **:text-gray-900 dark:**:text-gray-100"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

