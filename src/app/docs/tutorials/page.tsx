import type { Metadata } from "next";
import { MarkdownTutorial } from "@/components/docs/tutorial";
import { getFullUrl } from "@/lib/site-config";
import { promises as fs } from "fs";
import path from "path";

async function getMarkdownContent() {
  const filePath = path.join(process.cwd(), "content", "tutorials", "raven-demo.md");
  const markdown = await fs.readFile(filePath, "utf8");
  return markdown;
}

export const metadata: Metadata = {
  title: "Tutorials | OpenTimelineIO",
  description:
    "Learn how to use OpenTimelineIO through practical tutorials and interactive examples.",
  openGraph: {
    title: "Tutorials | OpenTimelineIO",
    description: "Learn how to use OpenTimelineIO through practical tutorials and examples.",
    type: "website",
    url: getFullUrl("/docs/tutorials"),
    siteName: "OpenTimelineIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutorials | OpenTimelineIO",
    description: "Learn how to use OpenTimelineIO through practical tutorials and examples.",
  },
};

export default async function RavenDemo() {
  const markdown = await getMarkdownContent();

  return (
    <>
      <div className="px-4 py-4 md:px-0 md:py-4">
        <div className="md:px-4">
          <MarkdownTutorial markdown={markdown} layout="full" />
        </div>
      </div>
      <iframe src="/raven/raven.html" width="100%" height="100%"></iframe>
    </>
  );
}
