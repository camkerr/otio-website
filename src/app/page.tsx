// import { useRemark } from "@/lib/hooks";
import { EditorialInterfaceComponent } from "../components/editor/index";
import { NavWidthSetter } from "@/components/layout/nav-width-setter";
import { promises as fs } from "fs";
import path from "path";

async function getMarkdownContent() {
  const filePath = path.join(process.cwd(), "content", "homepage", "timelines", "introduction.md");
  const markdown = await fs.readFile(filePath, "utf8");
  return markdown;
}

export default async function NonLinearEditor() {
  const markdown = await getMarkdownContent();
  // const [] = useRemark();

  return (
    <NavWidthSetter width="full">
      <EditorialInterfaceComponent markdown={markdown} />
    </NavWidthSetter>
  );
}
