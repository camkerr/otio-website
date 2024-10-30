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

import { Check, X } from "lucide-react";

async function getCsvData() {
  const filePath = path.join(process.cwd(), "content", "features", "feature-matrix.csv");
  const csvData = fs.readFileSync(filePath, "utf-8");

  const parsedData = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  }).data;

  return parsedData;
}

const CellRenderer = ({ value }) => {
  switch (value) {
    case "Y":
      return (
        <TableCell style={{ textAlign: 'center' }}>
          <Check />
        </TableCell>
      );
      break;
    case "N":
      return (
        <TableCell style={{ textAlign: 'center' }}>
          <X />
        </TableCell>
      );
    default:
      return <TableCell style={{ textAlign: 'center' }}>{value}</TableCell>;
      break;
  }
};

const TableData = ({ data }: any) => {
  return (
    <>
      {data.map((row) => (
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
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Card
        className="w-[800px]"
        style={{ width: "fit-content", alignSelf: "center" }}
      >
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
  );
}
