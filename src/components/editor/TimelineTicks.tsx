import React, { useMemo, memo } from 'react';
import Timecode from 'smpte-timecode';
import { msToFrames } from '@/lib/time-utils';

interface TimelineTicksProps {
  totalDurationMs: number;
  zoomLevel: number;
  timelineWidth: number;
  onSeek?: (percentage: number) => void;
}

// Memoize TimelineTicks to prevent unnecessary re-renders
export const TimelineTicks = memo(({ totalDurationMs, zoomLevel, timelineWidth, onSeek }: TimelineTicksProps) => {
  const handleClick = useMemo(() => {
    if (!onSeek) return undefined;
    
    return (e: React.MouseEvent<HTMLDivElement>) => {
      // Get click position relative to the ticks container
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      // Calculate percentage based on timeline width
      const percentage = Math.max(0, Math.min(1, clickX / timelineWidth));
      onSeek(percentage);
    };
  }, [onSeek, timelineWidth]);

  // Calculate appropriate tick interval to maintain good density - memoized
  const tickIntervals = useMemo(() => {
    const totalSeconds = totalDurationMs / 1000;
    const targetMinorTicks = 50; // Target more ticks for better granularity
    
    // Calculate ideal interval to get targetMinorTicks across the timeline
    const idealInterval = totalSeconds / targetMinorTicks;
    
    // Define nice intervals in seconds (added more granular options)
    const niceIntervals = [
      0.04167, 0.0833, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600
    ]; // 0.04167 = 1 frame @ 24fps, 0.0833 = 2 frames
    
    // Find the closest nice interval (adjusted by zoom)
    let baseInterval = niceIntervals[0];
    for (const interval of niceIntervals) {
      if (interval / zoomLevel >= idealInterval) {
        baseInterval = interval;
        break;
      }
    }
    
    // Adjust for zoom
    const minorInterval = (baseInterval / zoomLevel) * 1000; // Convert to ms
    const majorInterval = minorInterval * 5; // Major tick every 5 minor ticks
    const labelInterval = majorInterval * 2; // Label every 2 major ticks (10 minor ticks)
    
    return { minor: minorInterval, major: majorInterval, label: labelInterval };
  }, [totalDurationMs, zoomLevel]);

  // Memoize the expensive tick rendering
  const { ticks, labels } = useMemo(() => {
    const tickElements = [];
    const labelElements = [];
    
    // Generate minor ticks
    const minorInterval = tickIntervals.minor;
    const numMinorTicks = Math.ceil(totalDurationMs / minorInterval);

    for (let i = 0; i <= numMinorTicks; i++) {
      const timeMs = i * minorInterval;
      if (timeMs > totalDurationMs) break;

      const percentage = (timeMs / totalDurationMs) * 100;
      const leftPosition = (percentage / 100) * timelineWidth;
      
      // Determine tick type by checking if index is divisible
      // Much more reliable than checking timeMs modulo
      const isLabel = i % 10 === 0; // Every 10th minor tick
      const isMajor = i % 5 === 0 && !isLabel; // Every 5th minor tick (but not labels)
      
      // Render tick with appropriate styling
      let height = 8; // Minor tick height (increased from 6)
      let opacity = 0.6; // More visible (increased from 0.4)
      let color = 'hsl(var(--border))';
      
      if (isLabel) {
        height = 16;
        opacity = 1;
        color = 'hsl(var(--foreground))';
      } else if (isMajor) {
        height = 12;
        opacity = 0.8;
        color = 'hsl(var(--foreground))';
      }
      
      tickElements.push(
        <div
          key={`tick-${i}`}
          style={{
            position: 'absolute',
            left: `${leftPosition}px`,
            bottom: 0,
            height: `${height}px`,
            width: '1px',
            backgroundColor: color,
            opacity: opacity,
            pointerEvents: 'none',
          }}
        />
      );

      // Add timecode labels for label ticks
      if (isLabel) {
        try {
          const frames = msToFrames(timeMs);
          const tc = new Timecode(frames, 24, false);
          labelElements.push(
            <div
              key={`label-${i}`}
              style={{
                position: 'absolute',
                left: `${leftPosition}px`,
                bottom: '18px',
                transform: 'translateX(-50%)',
                fontSize: '9px',
                color: 'hsl(var(--foreground))',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                fontFamily: 'monospace',
                opacity: 0.9,
                pointerEvents: 'none',
              }}
            >
              {tc.toString()}
            </div>
          );
        } catch (error) {
          // Skip invalid timecodes
        }
      }
    }
    return { ticks: tickElements, labels: labelElements };
  }, [totalDurationMs, zoomLevel, timelineWidth, tickIntervals]);

  return (
    <div 
      onClick={handleClick}
      style={{
        position: 'relative',
        width: `${timelineWidth}px`,
        minWidth: `${timelineWidth}px`,
        height: '32px',
        backgroundColor: 'hsl(var(--background))',
        pointerEvents: 'auto',
        overflow: 'visible',
        cursor: 'pointer',
      }}
    >
      {labels}
      {ticks}
      {/* Full-width border line */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${timelineWidth}px`,
          height: '1px',
          backgroundColor: 'hsl(var(--border))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
});

TimelineTicks.displayName = "TimelineTicks";
