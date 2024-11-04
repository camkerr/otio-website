// import { useMarkdownContent } from "@/components/editor/hooks";
import { MarkdownTutorial } from "@/components/Tutorial";
import { OTIO_REPO_FOR_DOCS } from "@/lib/constants";
import { promises as fs } from "fs";
import path from "path";

async function getMarkdownContent() {
  const filePath = path.join(
    process.cwd(),
    "content",
    "tutorials",
    "raven-demo.md"
  );
  const markdown = await fs.readFile(filePath, "utf8");
  return markdown;
}

export default async function DocTemplate() {
  // const { markdown, isLoading } = useMarkdownContent(OTIO_REPO_FOR_DOCS);
  const markdown = await getMarkdownContent();

  return (
    <>
      <div style={{ padding: "1rem", overflowY: "scroll" }}>
        <MarkdownTutorial markdown={markdown} layout="sidebar" />
      </div>
      <iframe src="/raven/raven.html" width="100%" height="100%"></iframe>
    </>
  );
}
