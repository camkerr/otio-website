import { getReleases } from "@/lib/github-releases";
import { PageHeader } from "@/components/layout/page-header";
import { ReleasesClient } from "@/components/releases/releases-client";

export const metadata = {
  title: "Releases | OpenTimelineIO",
  description: "View all releases and updates for OpenTimelineIO",
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
