"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Integration, MediaItem } from "@/types/integrations";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function ToolsAndAppsPage() {
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

  const filteredAppsAndTools = integrations.filter((integration) => {
    const matchesCategories =
      selectedCategories.length === 0 ||
      integration.categories.some((cat) => selectedCategories.includes(cat));
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategories && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-210px)] bg-background">
      {/* Make header sticky */}
      {/* <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"> */}
      <div className="sticky top-0">
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Apps and Integrations</h1>
            <p className="text-xl text-muted-foreground">
              Find out if your favorite app alredy supports OTIO, and search for
              new tools!
            </p>
          </div>
        </div>
      </div>

      {/* Main layout with sticky sidebar */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-8">
          {/* Sticky sidebar */}
          <div className="sticky top-[156px] h-fit space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg py-1 font-semibold">Categories</h2>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="outline"
                    // size="lg"
                    onClick={() => setSelectedCategories([])}
                    className="h-auto py-1 px-2 text-muted-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      setSelectedCategories((prev) =>
                        checked
                          ? [...prev, category]
                          : prev.filter((c) => c !== category)
                      );
                    }}
                  />
                  <label
                    htmlFor={category}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable main content */}
          <ScrollArea className="h-[calc(100vh-213px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 pr-4">
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
                      <div className="min-h-[2.5rem]">
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
          </ScrollArea>
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
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
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
