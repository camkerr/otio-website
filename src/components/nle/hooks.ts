import { useState } from "react";
import ReactMarkdown from "react-markdown";

export function useMarkdownContent(markdown: string) {
  const [ast, setAst] = useState<any>(null);

  
  return ast;
}