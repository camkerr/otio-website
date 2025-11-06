"use client";

import "@/styles/editor.css";
import { TrackItem } from "@/lib/markdown-parser";
import { msToPercentage } from "@/lib/time-utils";
import { useMemo, memo } from "react";

// Track configuration: h1=0, h2=1, h3=2, img=3, p=4
const TRACK_CONFIG = [
  { label: "<h1>", name: "Header 1", type: "h1" as const },
  { label: "<h2>", name: "Header 2", type: "h2" as const },
  { label: "<h3>", name: "Header 3", type: "h3" as const },
  { label: "<img>", name: "Image", type: "img" as const },
  { label: "<p>", name: "Paragraph", type: "p" as const },
];

interface ClipRendererProps {
  item: TrackItem;
  totalDurationMs: number;
  timelineWidth: number;
}

// Memoize ClipRenderer to prevent unnecessary re-renders
const ClipRenderer = memo(({ item, totalDurationMs, timelineWidth }: ClipRendererProps) => {
  // Convert milliseconds to percentage, then to pixels
  const startPercentage = msToPercentage(item.start, totalDurationMs);
  const endPercentage = msToPercentage(item.end, totalDurationMs);
  const left = startPercentage * timelineWidth;
  const width = (endPercentage - startPercentage) * timelineWidth;

  // Different colors for different clip types with glass effect
  const getClipColor = () => {
    switch (item.type) {
      case "h1":
        return "border-blue-500/60 bg-blue-500/20";
      case "h2":
        return "border-green-500/40 bg-green-500/15";
      case "h3":
        return "border-purple-500/60 bg-purple-500/20";
      case "img":
        return "border-orange-500/60 bg-orange-500/20";
      case "p":
        return "border-gray-500/60 bg-gray-500/20";
      default:
        return "border-blue-500/60 bg-blue-500/20";
    }
  };

  return (
    <div
      style={{
        left: `${left}px`,
        width: `${Math.max(20, width - 2)}px`, // Subtract small margin for visual separation
        minWidth: "20px",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      className={`clip border-2 ${getClipColor()} rounded pl-1 pr-1 text-xs overflow-hidden shadow-sm flex items-center`}
      title={`${item.name} (${item.start}ms - ${item.end}ms)`}
    >
      <div className="truncate">{item.name}</div>
    </div>
  );
});

ClipRenderer.displayName = "ClipRenderer";

interface SequenceProps {
  clips: TrackItem[];
  totalDurationMs: number;
  zoomLevel: number;
}

// Memoize entire Sequence component
export const Sequence = memo(({ clips, totalDurationMs, zoomLevel }: SequenceProps) => {
  // Calculate timeline width:
  // 1. Base width fits all content with 10% padding on the right (200px per second * 1.1)
  // 2. This becomes the "natural fit" baseline, which is 100% zoom (zoomLevel = 1)
  // 3. Zooming in/out scales relative to this baseline
  const minTimelineWidth = useMemo(() => {
    // Calculate base width that fits all content with 10% right padding
    // This padded width is what we consider "100%" zoom
    const baseWidth = Math.max(2000, (totalDurationMs / 1000) * 200 * 1.1);
    return baseWidth * zoomLevel;
  }, [totalDurationMs, zoomLevel]);

  // Group clips by track - memoized to prevent recalculation
  const clipsByTrack = useMemo(() => {
    const grouped: Record<number, TrackItem[]> = {};
    for (const clip of clips) {
      if (!grouped[clip.track]) {
        grouped[clip.track] = [];
      }
      grouped[clip.track].push(clip);
    }
    return grouped;
  }, [clips]);

  return (
    <div className="timeline-tracks-area">
      {TRACK_CONFIG.map((config, trackIndex) => {
        const trackClips = clipsByTrack[trackIndex] || [];
        return (
          <div
            key={`content-${trackIndex}`}
            className="track-content"
            style={{ minWidth: `${minTimelineWidth}px` }}
          >
            {trackClips.map((clip) => (
              <ClipRenderer
                key={clip.id}
                item={clip}
                totalDurationMs={totalDurationMs}
                timelineWidth={minTimelineWidth}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
});

Sequence.displayName = "Sequence";