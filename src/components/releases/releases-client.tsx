"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag, User, Download, FileArchive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReleaseNotesRenderer } from "@/components/releases/release-notes-renderer";
import { GitHubRelease, parseContributorsFromBody } from "@/lib/github-releases";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

interface TimelineProps {
  releases: GitHubRelease[];
  activeIndex: number;
}

function Timeline({ releases, activeIndex }: TimelineProps) {
  // Calculate relative positions based on dates
  const dates = releases.map(r => new Date(r.published_at).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate || 1; // Avoid division by zero

  const getPosition = (dateString: string) => {
    const date = new Date(dateString).getTime();
    // Invert because newest (max) should be at top (0%)
    return ((maxDate - date) / dateRange) * 100;
  };

  return (
    <div className="relative w-full h-full py-8">
      {/* Timeline line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-border" />

      {/* Timeline dots */}
      {releases.map((release, index) => {
        const position = getPosition(release.published_at);
        const isActive = index === activeIndex;

        return (
          <div
            key={release.id}
            className="absolute left-0 right-0 transition-all duration-300"
            style={{ top: `${position}%` }}
          >
            {/* Dot */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background transition-all duration-300 ${
                isActive
                  ? "bg-primary scale-150 shadow-lg shadow-primary/50"
                  : "bg-muted-foreground/30 scale-100"
              }`}
            />

            {/* Active release label */}
            {isActive && (
              <div className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 pr-6 text-right whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="text-sm font-bold">{release.tag_name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatShortDate(release.published_at)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ReleasesClientProps {
  releases: GitHubRelease[];
}

export function ReleasesClient({ releases }: ReleasesClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers = releases.map((release, index) => {
      const element = document.getElementById(`release-${release.id}`);
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        {
          threshold: 0.5,
          rootMargin: "-20% 0px -20% 0px",
        }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [releases]);

  return (
    <div className="w-full">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          {/* Sticky Timeline Sidebar - hidden on mobile */}
          <div className="hidden lg:block w-48 shrink-0">
            <div
              className="sticky bg-background"
              style={{
                top: "calc(var(--top-nav-height) + 11rem)",
                height: "calc(100vh - var(--top-nav-height) - 11rem - 2rem)",
              }}
            >
              <Timeline releases={releases} activeIndex={activeIndex} />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="space-y-8">
            {releases.map((release, index) => {
              const contributors = parseContributorsFromBody(release.body);

              return (
                <div key={release.id} id={`release-${release.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Release Header */}
                    <div className="bg-muted/50 border-b px-6 py-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h2 className="text-2xl font-bold">{release.name}</h2>
                            {release.prerelease && (
                              <Badge variant="secondary">Pre-release</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                                {release.tag_name}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(release.published_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Author */}
                        <Link
                          href={release.author.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">
                              {release.author.login}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Release Author
                            </div>
                          </div>
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border">
                            <Image
                              src={release.author.avatar_url}
                              alt={release.author.login}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Release Body */}
                    <div className="px-6 pb-6">
                      <ReleaseNotesRenderer content={release.body} />

                      {/* Contributors */}
                      {contributors.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">
                              Contributors ({contributors.length})
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {contributors.slice(0, 20).map((contributor) => (
                              <Link
                                key={contributor}
                                href={`https://github.com/${contributor}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Badge
                                  variant="secondary"
                                  className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                >
                                  @{contributor}
                                </Badge>
                              </Link>
                            ))}
                            {contributors.length > 20 && (
                              <Badge variant="outline">
                                +{contributors.length - 20} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Assets */}
                      {release.assets.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <FileArchive className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">
                              Assets ({release.assets.length})
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {release.assets.map((asset) => (
                              <Link
                                key={asset.name}
                                href={asset.browser_download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                              >
                                <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                        {asset.name}
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>{formatFileSize(asset.size)}</span>
                                        <span className="flex items-center gap-1">
                                          <Download className="w-3 h-3" />
                                          {asset.download_count.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                  </div>
                                </Card>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View on GitHub */}
                      <div className="mt-6 pt-6 border-t">
                        <Link href={release.html_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on GitHub
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

