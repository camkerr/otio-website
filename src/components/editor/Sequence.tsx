import "@/styles/editor.css";
import { Lock, Monitor, Eye, Mic, Volume2, Settings } from "lucide-react";
import { TrackItem } from "@/lib/markdown-parser";
import { msToPercentage } from "@/lib/time-utils";
import { useRef, useEffect, useState } from "react";

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

const ClipRenderer = ({ item, totalDurationMs, timelineWidth }: ClipRendererProps) => {
  // Convert milliseconds to percentage, then to pixels
  const startPercentage = msToPercentage(item.start, totalDurationMs);
  const endPercentage = msToPercentage(item.end, totalDurationMs);
  const left = startPercentage * timelineWidth;
  const width = (endPercentage - startPercentage) * timelineWidth;

  // Different colors for different clip types
  const getClipColor = () => {
    switch (item.type) {
      case "h1":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "h2":
        return "border-transparent bg-green-50 dark:bg-green-950";
      case "h3":
        return "border-purple-500 bg-purple-50 dark:bg-purple-950";
      case "img":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950";
      case "p":
        return "border-gray-500 bg-gray-50 dark:bg-gray-950";
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
    }
  };

  return (
    <div
      style={{
        left: `${left}px`,
        width: `${Math.max(20, width - 4)}px`, // Subtract margin for visual separation
        minWidth: "20px",
      }}
      className={`clip border-2 ${getClipColor()} rounded px-1 py-0.5 text-xs overflow-hidden mr-1`}
      title={`${item.name} (${item.start}ms - ${item.end}ms)`}
    >
      <div className="truncate">{item.name}</div>
    </div>
  );
};

interface SequenceProps {
  clips: TrackItem[];
  totalDurationMs: number;
  zoomLevel: number;
}

export const Sequence = ({ clips, totalDurationMs, zoomLevel }: SequenceProps) => {
  const trackContentRef = useRef<HTMLDivElement>(null);
  
  // Calculate minimum timeline width based on duration and zoom level (200px per second base)
  const baseWidth = Math.max(2000, (totalDurationMs / 1000) * 200);
  const minTimelineWidth = baseWidth * zoomLevel;
  const [timelineWidth, setTimelineWidth] = useState(minTimelineWidth);

  // Use the minimum timeline width based on duration and zoom
  useEffect(() => {
    setTimelineWidth(minTimelineWidth);
  }, [minTimelineWidth, clips, totalDurationMs, zoomLevel]);

  // Group clips by track
  const clipsByTrack: Record<number, TrackItem[]> = {};
  for (const clip of clips) {
    if (!clipsByTrack[clip.track]) {
      clipsByTrack[clip.track] = [];
    }
    clipsByTrack[clip.track].push(clip);
  }

  return (
    <div className="timeline-tracks-area" ref={trackContentRef}>
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
                timelineWidth={timelineWidth}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
