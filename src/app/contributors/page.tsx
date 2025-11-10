import type { Metadata } from "next";
import { getContributors, getRepoStats } from "@/lib/github-contributors";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Users, Star, GitFork, Eye } from "lucide-react";
import { getFullUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contributors | OpenTimelineIO",
  description:
    "Meet the amazing contributors who have helped build and maintain OpenTimelineIO. Join the community and contribute!",
  openGraph: {
    title: "Contributors | OpenTimelineIO",
    description: "Meet the amazing contributors who have helped build OpenTimelineIO.",
    type: "website",
    url: getFullUrl("/contributors"),
    siteName: "OpenTimelineIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contributors | OpenTimelineIO",
    description: "Meet the amazing contributors who have helped build OpenTimelineIO.",
  },
};

export default async function ContributorsPage() {
  const contributors = await getContributors();
  const repoStats = await getRepoStats();

  // Calculate total contributions
  const totalContributions = contributors.reduce(
    (sum, c) => sum + c.contributions,
    0
  );

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Contributors"
        subtitle={`${contributors.length} amazing people who have contributed ${totalContributions.toLocaleString()} commits to OpenTimelineIO`}
        hasBorder={true}
        sticky={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Repository Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 flex flex-col items-center justify-center space-y-2 bg-card hover:bg-accent/50 transition-colors">
            <Users className="w-8 h-8 text-primary" />
            <div className="text-3xl font-bold">
              {contributors.length}
            </div>
            <div className="text-sm text-muted-foreground">Contributors</div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center space-y-2 bg-card hover:bg-accent/50 transition-colors">
            <Star className="w-8 h-8 text-yellow-500" />
            <div className="text-3xl font-bold">
              {repoStats.stars.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Stars</div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center space-y-2 bg-card hover:bg-accent/50 transition-colors">
            <GitFork className="w-8 h-8 text-blue-500" />
            <div className="text-3xl font-bold">
              {repoStats.forks.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Forks</div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center space-y-2 bg-card hover:bg-accent/50 transition-colors">
            <Eye className="w-8 h-8 text-green-500" />
            <div className="text-3xl font-bold">
              {repoStats.watchers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Watchers</div>
          </Card>
        </div>

        {/* Top Contributors Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Contributors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributors.slice(0, 9).map((contributor) => (
              <Link
                key={contributor.id}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-card hover:bg-accent/30 h-full">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {contributor.login}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contributor.contributions.toLocaleString()} contributions
                      </p>
                      {contributor.type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {contributor.type}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* All Contributors Section */}
        {contributors.length > 9 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Contributors</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {contributors.slice(9).map((contributor) => (
                <Link
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="p-4 hover:shadow-md transition-shadow bg-card hover:bg-accent/30 h-full">
                    <div className="flex flex-col items-center space-y-2 text-center">
                      <div className="relative w-12 h-12">
                        <Image
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="w-full">
                        <h3 className="font-medium text-sm truncate">
                          {contributor.login}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {contributor.contributions}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Thank you to all our contributors for making OpenTimelineIO better!
          </p>
          <p className="mt-2">
            Want to contribute?{" "}
            <Link
              href="https://github.com/AcademySoftwareFoundation/OpenTimelineIO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Visit our GitHub repository
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

