import Link from "next/link";
import { generateDocsManifest } from "@/lib/docs-manifest";
import { BookOpen, Code, PlayCircle, Lightbulb } from "lucide-react";

export default async function DocsPage() {
  let manifest;
  try {
    manifest = await generateDocsManifest();
  } catch (error) {
    console.error("Error loading documentation:", error);
    manifest = null;
  }

  const categories = [
    {
      title: "Quick Start",
      description: "Get up and running with OpenTimelineIO",
      icon: PlayCircle,
      docs: manifest?.categories.quickstart || [],
      path: "/docs/tutorials/quickstart",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Tutorials",
      description: "Learn how to use OTIO features",
      icon: BookOpen,
      docs: manifest?.categories.tutorials || [],
      path: "/docs/tutorials",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Use Cases",
      description: "Real-world examples and workflows",
      icon: Lightbulb,
      docs: manifest?.categories["use-cases"] || [],
      path: "/docs/use-cases",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "API Reference",
      description: "Complete API documentation",
      icon: Code,
      docs: [],
      path: "https://opentimelineio.readthedocs.io/en/latest/",
      external: true,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-4">OpenTimelineIO Documentation</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Learn how to use OpenTimelineIO to work with editorial cut information.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            const content = category.external ? (
              <a
                href={category.path}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 border rounded-lg hover:border-primary transition-colors h-full"
              >
                <Icon className={`w-8 h-8 mb-4 ${category.color}`} />
                <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <span className="text-sm text-primary">View API Reference ↗</span>
              </a>
            ) : (
              <Link
                href={category.path}
                className="block p-6 border rounded-lg hover:border-primary transition-colors h-full"
              >
                <Icon className={`w-8 h-8 mb-4 ${category.color}`} />
                <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                {category.docs.length > 0 && (
                  <span className="text-sm text-primary">
                    {category.docs.length} {category.docs.length === 1 ? "article" : "articles"} →
                  </span>
                )}
              </Link>
            );
            return <div key={category.title}>{content}</div>;
          })}
        </div>

        {manifest && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-2">
              {manifest.categories.quickstart.slice(0, 3).map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="block p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <h3 className="font-medium">{doc.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
