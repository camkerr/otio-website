import type { Metadata } from "next";
import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { EditInGithub } from "@/components/edit-in-github";
import FeatureMatrixDataGrid from "@/components/data-grid/feature-matrix";
import { PageHeader } from "@/components/layout/page-header";
import { getSiteUrl, getFullUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Timeline Format Support | OpenTimelineIO",
  description: "Compare timeline format features supported by OpenTimelineIO. View detailed compatibility matrix for different formats.",
  openGraph: {
    title: "Timeline Format Support | OpenTimelineIO",
    description: "Compare timeline format features and compatibility with OpenTimelineIO.",
    type: "website",
    url: getFullUrl("/features"),
    siteName: "OpenTimelineIO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeline Format Support | OpenTimelineIO",
    description: "Compare timeline format features supported by OpenTimelineIO.",
  },
};

async function getCsvData() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "features",
    "feature-matrix.csv"
  );
  const csvData = fs.readFileSync(filePath, "utf-8");

  const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  }).data;

  // Add unique IDs to each row
  const dataWithIds = (parsedData as any[]).map((row, index) => ({
    ...row,
    id: `feature-${index}`,
  }));

  return dataWithIds;
}

export default async function FeaturesIndex() {
  const featureMatrix = await getCsvData();

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <PageHeader
        title="Timeline Format Support"
        subtitle="Different timeline formats have different features. This table shows which features are supported by each format."
        rightContent={
          <EditInGithub repoPath="/content/features/feature-matrix.csv" />
        }
        hasBorder={true}
        sticky={true}
      />

      <div className="container mx-auto px-4 pt-8 pb-4 max-w-7xl flex-1 min-h-0">
        <FeatureMatrixDataGrid data={featureMatrix} />
      </div>
    </div>
  );
}
