import path from "path";
import fs from "fs";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditInGithub } from "@/components/edit-in-github";
import { Check, X } from "lucide-react";

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

  return parsedData;
}

const CellRenderer = ({ value }: { value: string }) => {
  switch (value) {
    case "Y":
      return (
        <TableCell style={{ textAlign: "center" }}>
          <Check />
        </TableCell>
      );
      break;
    case "N":
      return (
        <TableCell style={{ textAlign: "center" }}>
          <X />
        </TableCell>
      );
    default:
      return <TableCell style={{ textAlign: "center" }}>{value}</TableCell>;
      break;
  }
};

const TableData = ({ data }: any) => {
  return (
    <>
      {data.map((row: any) => (
        <TableRow key={row.Feature}>
          <TableCell className="font-medium" width="700px">
            {row.Feature}
          </TableCell>
          <CellRenderer value={row.OpenTimelineIO} />
          <CellRenderer value={row.AAF} />
          <CellRenderer value={row.ALE} />
          <CellRenderer value={row.EDL} />
        </TableRow>
      ))}
    </>
  );
};

export default async function FeaturesIndex() {
  const featureMatrix = await getCsvData();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        className="w-[1000px]"
        style={{ margin: "auto" }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Timeline Format Support</h1>
            <p className="text-md text-muted-foreground">
              Different timeline formats have different features. This table
              shows which features are supported by each format.
            </p>
          </div>
        </div>
        <div className="py-4">
          <EditInGithub repoPath="/content/features/feature-matrix.csv" />
        </div>
        <Card style={{ width: "fit-content", alignSelf: "center" }}>
          <CardContent>
            <Table>
              <TableHeader>
                <TableHead className="w-[100px]">Feature</TableHead>
                <TableHead className="w-[100px]">OpenTimelineIO</TableHead>
                <TableHead className="w-[100px]">ALE</TableHead>
                <TableHead className="w-[100px]">AAF</TableHead>
                <TableHead className="w-[100px]">FCP7XML</TableHead>
              </TableHeader>
              <TableBody>
                <TableData data={featureMatrix} />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
