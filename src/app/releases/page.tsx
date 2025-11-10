import type { Metadata } from "next";
import { getReleases } from "@/lib/github-releases";
import { PageHeader } from "@/components/layout/page-header";
import { ReleasesClient } from "@/components/releases/releases-client";
import { getFullUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Releases | OpenTimelineIO",
  description: "View all releases and updates for OpenTimelineIO. Stay up to date with new features, improvements, and bug fixes.",
  openGraph: {
    title: "Releases | OpenTimelineIO",
    description: "View all releases and updates for OpenTimelineIO.",
    type: "website",
    url: getFullUrl("/releases"),
    siteName: "OpenTimelineIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Releases | OpenTimelineIO",
    description: "View all releases and updates for OpenTimelineIO.",
  },
};

export default async function ReleasesPage() {
  const releases = await getReleases();

  // Filter out drafts
  const publishedReleases = releases.filter(r => !r.draft);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader
        title="Releases"
        subtitle={`${publishedReleases.length} releases tracking the evolution of OpenTimelineIO`}
        hasBorder={true}
        sticky={true}
      />
      <ReleasesClient releases={publishedReleases} />
    </div>
  );
}
