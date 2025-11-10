import type { Metadata } from "next";
import { getFullUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Apps and Tools | OpenTimelineIO",
  description: "Discover applications and tools that support OpenTimelineIO. Find your favorite NLE, compositor, or pipeline tool with OTIO integration.",
  openGraph: {
    title: "Apps and Tools | OpenTimelineIO",
    description: "Discover applications and tools that support OpenTimelineIO integration.",
    type: "website",
    url: getFullUrl("/apps-and-tools"),
    siteName: "OpenTimelineIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apps and Tools | OpenTimelineIO",
    description: "Discover applications and tools that support OpenTimelineIO integration.",
  },
};

export default function AppsAndToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

