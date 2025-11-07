"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Film, Eye, FolderKanban, PlayCircle } from "lucide-react";
import { Integration, MediaItem } from "@/types/integrations";
import { DialogTitle } from "@radix-ui/react-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EditInGithub } from "@/components/edit-in-github";

export default function AppsAndToolsPage() {
  const [selectedProject, setSelectedProject] = useState<Integration | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaIndex, setMediaIndex] = useState(0);

  const integrations: Integration[] = [
    {
      id: "1",
      name: "Cezanne",
      description: "Media player and review tool",
      company: "Cezanne",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Media", "Review"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "2",
      name: "ftrack cineSync Play",
      description: "Frame-accurate playback & review & tool",
      company: "ftrack",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Media", "Review"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "3",
      name: "Hiero",
      description:
        "Multi-shot management, conform, editorial, review and distribution workflows tool",
      company: "Foundry",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Management", "Review"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "4",
      name: "mrViewer",
      description:
        "flipbook, video and audio player, with OTIO support demonstrated here",
      company: "mrViewer",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Media", "Player"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "5",
      name: "OpenRV",
      description: "A digital review tool for film, TV, and games",
      company: "OpenRV",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Review", "Media"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "6",
      name: "Hiero",
      description:
        "Multi-shot management, conform, editorial, review and distribution workflows tool",
      company: "Foundry",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Management", "Review"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "7",
      name: "mrViewer",
      description:
        "flipbook, video and audio player, with OTIO support demonstrated here",
      company: "mrViewer",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Media", "Player"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
    {
      id: "8",
      name: "OpenRV",
      description: "A digital review tool for film, TV, and games",
      company: "OpenRV",
      logo: "/placeholder.svg?height=100&width=100",
      type: "app",
      categories: ["Review", "Media"],
      media: [
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
        { type: "image", url: "/placeholder.svg?height=720&width=1280" },
      ],
    },
  ];

  const categories = ["Media", "Review", "Management", "Player"];

  const categoryIcons = {
    Media: Film,
    Review: Eye,
    Management: FolderKanban,
    Player: PlayCircle,
  };

  const filteredAppsAndTools = integrations.filter((integration) => {
    const matchesCategories =
      selectedCategories.length === 0 ||
      integration.categories.some((cat) => selectedCategories.includes(cat));
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategories && matchesSearch;
  });

  // Scroll to top when categories change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategories]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Apps and Integrations"
        subtitle="Find out if your favorite app already supports OTIO, and search for new tools!"
        rightContent={
          <EditInGithub repoPath="/content/integrations" />
        }
        hasBorder={true}
        sticky={true}
      />

      {/* Main layout with sticky sidebar */}
      <div className="container mx-auto px-4 max-w-7xl flex gap-8 py-8">
        {/* Sticky sidebar */}
        <aside className="w-[280px] shrink-0">
          <div className="sticky top-[calc(73px+11.1rem)] space-y-6">
            {/* Search bar */}
            <div className="relative">
              <Input
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                placeholder="Search tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategories([])}
                  className={`h-auto py-1 px-2 text-muted-foreground transition-opacity ${
                    selectedCategories.length > 0
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  const isActive = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          isActive
                            ? prev.filter((c) => c !== category)
                            : [...prev, category]
                        );
                      }}
                      className={`group w-[calc(280px+1rem)] flex items-center gap-4 -ml-4 pl-4 pr-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        }`}
                      />
                      <span className="flex-1 text-left">{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredAppsAndTools.map((integration) => (
              <div
                key={integration.id}
                className="group cursor-pointer rounded-lg border bg-card transition-all hover:shadow-lg"
                onClick={() => {
                  setSelectedProject(integration);
                  setMediaIndex(0);
                }}
              >
                <div className="aspect-video relative">
                  <Image
                    src={integration.media[0].url}
                    alt={integration.name}
                    className="object-cover transition-transform group-hover:scale-105"
                    fill
                  />
                </div>
                <div className="p-4 relative">
                  <div className="absolute -top-8 left-4">
                    <div className="h-12 w-12 rounded-full border-4 border-background bg-white shadow-md">
                      <Image
                        src={integration.logo}
                        alt={`${integration.company} logo`}
                        className="rounded-full object-cover"
                        fill
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {integration.name}
                    </h3>
                    <div className="min-h-10">
                      <p className="text-sm text-muted-foreground line-clamp-2 pb-4">
                        {integration.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-bottom justify-between">
                      <span className="text-sm font-medium">
                        {integration.company}
                      </span>
                      <Button size="sm">Learn More</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedProject}
        onOpenChange={() => setSelectedProject(null)}
      >
        <DialogContent className="max-w-4xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                {selectedProject.media[mediaIndex].type === "video" ? (
                  <video
                    src={selectedProject.media[mediaIndex].url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={selectedProject.media[mediaIndex].url}
                    alt={`${selectedProject.name} preview`}
                    className="object-cover"
                    fill
                  />
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4">
                {selectedProject.media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setMediaIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 ${
                      mediaIndex === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <Image
                      src={item.type === "video" ? item.thumbnail! : item.url}
                      alt={`Preview ${index + 1}`}
                      className="object-cover"
                      fill
                    />
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground">
                {selectedProject.description}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
