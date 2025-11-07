"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Lightbox, type LightboxImage } from "@/components/ui/lightbox";

export interface MarkdownTutorialProps {
  markdown: string;
  layout?: "sidebar" | "full";
}

export function MarkdownTutorial({
  markdown,
  layout = "sidebar",
}: MarkdownTutorialProps) {
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (images: LightboxImage[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4">
        <MarkdownRenderer
          content={markdown}
          openLightbox={openLightbox}
        />
      </div>
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </>
  );
}
