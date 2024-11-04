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
        <TableCell className="text-center align-middle">
          <Check className="mx-auto" />
        </TableCell>
      );
      break;
    case "N":
      return (
        <TableCell className="text-center align-middle">
          <X className="mx-auto" />
        </TableCell>
      );
    case value.match(/#\d+/) ? value : null:
      return (
        <TableCell className="text-center align-middle">
          {value.split(",").map((token, index) => {
            const prNumber = token.trim().replace("#", "");
            return (
              <>
                <a 
                  href={`https://github.com/AcademySoftwareFoundation/OpenTimelineIO/pull/${prNumber}`}
                  className="text-blue-500 hover:text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {token.trim()}
                </a>
                {index < value.split(",").length - 1 && ", "}
              </>
            );
          })}
        </TableCell>
      );
    default:
      return <TableCell className="text-center align-middle">{value}</TableCell>;
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
        style={{ margin: "auto", width: "fit-content" }}
      >
        <div className="container mx-auto px-4 pt-12 pb-8">
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
        <Card style={{ width: "w-[1000px]", alignSelf: "center" }} >
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableHead className="w-[100px]">Feature</TableHead>
                <TableHead className="w-[200px] text-center">OpenTimelineIO</TableHead>
                <TableHead className="w-[100px] text-center">ALE</TableHead>
                <TableHead className="w-[100px] text-center">AAF</TableHead>
                <TableHead className="w-[200px] text-center">FCP7XML</TableHead>
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
