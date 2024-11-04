import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card";


interface ContentRendererProps {
  markdown: string;
  onAstUpdate?: (ast: any) => void;
}

export function ContentRenderer({
  markdown,
  onAstUpdate,
}: ContentRendererProps) {
  const [ast, setAst] = useState<any>(null);

  return (
    <div className="contentRenderer">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4" {...props} />
          ),
          section: ({ node, ...props }) => (
            <section className="my-12" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-2" {...props} />,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <Card className="my-4">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0 }}
                >
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
        remarkPlugins={[]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
