import path from "path";
import fs from "fs";
import Papa from "papaparse";
import { EditInGithub } from "@/components/edit-in-github";
import FeatureMatrixDataGrid from "@/components/data-grid/feature-matrix";

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
    <div className="flex flex-col h-full">
      <div className="container mx-auto px-4 pt-8 max-w-7xl shrink-0">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-4">Timeline Format Support</h1>
            <p className="text-md text-muted-foreground max-w-4xl text-left">
              Different timeline formats have different features. This table shows
              which features are supported by each format.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <EditInGithub repoPath="/content/features/feature-matrix.csv" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 max-w-7xl flex-1 min-h-0">
        <FeatureMatrixDataGrid data={featureMatrix} />
      </div>
    </div>
  );
}
