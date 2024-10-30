import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";

export interface MarkdownTutorialProps {
  markdown: string;
  layout?: "sidebar" | "full";
}

export default function MarkdownTutorial({
  markdown,
  layout = "sidebar",
}: MarkdownTutorialProps) {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-2" {...props} />,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <Card className="my-4">
                {/* <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}> */}
                <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </Card>
            ) : (
              <code className="bg-gray-100 rounded px-1" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
