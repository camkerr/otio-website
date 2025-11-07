import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { EditInGithub } from "@/components/edit-in-github";
import FeatureMatrixDataGrid from "@/components/data-grid/feature-matrix";
import { PageHeader } from "@/components/layout/page-header";

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
