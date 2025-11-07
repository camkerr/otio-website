"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FolderKanban, PlayCircle, Edit2, Monitor, Wrench, FileJson, Package, Workflow } from "lucide-react";
import { Integration } from "@/types/integrations";
import { DialogTitle } from "@radix-ui/react-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EditInGithub } from "@/components/edit-in-github";
import { getIntegrations, getAllCategories } from "@/lib/integrations";

export default function AppsAndToolsPage() {
  const [selectedProject, setSelectedProject] = useState<Integration | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaIndex, setMediaIndex] = useState(0);

  // Load integrations from JSON
  const integrations = getIntegrations();
  const categories = getAllCategories();

  const categoryIcons: Record<string, typeof PlayCircle> = {
    Player: PlayCircle,
    Review: Eye,
    Editor: Edit2,
    Management: FolderKanban,
    Compositor: Monitor,
    Plugin: Wrench,
    Adapter: FileJson,
    Library: Package,
    Pipeline: Workflow,
    Inspector: Eye,
    Renderer: Monitor,
    Automation: Workflow,
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
        title="Apps and Tools"
        subtitle="Find out if your favorite application or tool already supports OTIO - or discover new ones!"
        rightContent={
          <EditInGithub repoPath="/content/integrations/integrations.json" />
        }
        hasBorder={true}
        sticky={true}
      />

      {/* Main layout with sticky sidebar */}
      <div className="container mx-auto px-4 max-w-7xl flex gap-8 py-8">
        {/* Sticky sidebar */}
        <aside className="w-[280px] shrink-0">
          <div className="sticky top-[calc(var(--top-nav-height)+11.1rem)] space-y-6">
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
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
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
            {filteredAppsAndTools.map((integration) => {
              const heroMedia = integration.media.find(m => m.isHero) || integration.media[0];
              const hasMedia = integration.media.length > 0 && heroMedia;
              
              return (
                <div
                  key={integration.id}
                  className="group cursor-pointer rounded-lg border bg-card transition-all hover:shadow-lg"
                  onClick={() => {
                    setSelectedProject(integration);
                    setMediaIndex(0);
                  }}
                >
                  <div className="aspect-video relative bg-muted overflow-hidden rounded-t-lg">
                    {hasMedia ? (
                      <Image
                        src={heroMedia.url}
                        alt={integration.name}
                        className="object-cover transition-transform group-hover:scale-105"
                        fill
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {integration.type === "app" ? (
                          <Monitor className="w-16 h-16" />
                        ) : (
                          <Wrench className="w-16 h-16" />
                        )}
                      </div>
                    )}
                    {integration.logo && (
                      <div className="absolute bottom-3 left-4 z-1">
                        <div className="h-14 w-14 rounded-lg border-4 border-background bg-white shadow-lg overflow-hidden">
                          <div className="relative w-full h-full">
                            <Image
                              src={integration.logo}
                              alt={`${integration.company} logo`}
                              className="object-contain"
                              fill
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col min-h-[180px]">
                    <h3 className="font-semibold text-lg mb-2">
                      {integration.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {integration.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-medium text-muted-foreground">
                        {integration.company}
                      </span>
                      <Button size="sm">Learn More</Button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              {selectedProject.media.length > 0 ? (
                <>
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
                  {selectedProject.media.length > 1 && (
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
                  )}
                </>
              ) : (
                <div className="aspect-video relative rounded-lg overflow-hidden mb-4 bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="w-16 h-16 mx-auto mb-2" />
                    <p>No media available</p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {selectedProject.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Company:</span>
                  <span className="text-muted-foreground">{selectedProject.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Type:</span>
                  <span className="text-muted-foreground capitalize">{selectedProject.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span className="font-medium">Categories:</span>
                  {selectedProject.categories.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-muted rounded-md text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
