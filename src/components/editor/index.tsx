"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Playhead from "./Playhead";
import Draggable from "react-draggable"; // The default
import Timecode from "smpte-timecode";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutDisplay } from "@/components/editor/KeyboardShortcutDisplay";
import { ScrollContext } from "@/components/editor/ScrollContext";
import { TimelineTicks } from "@/components/editor/TimelineTicks";
import { Play, Pause, FastForward, Rewind, Lock, Monitor, Eye, ZoomIn, ZoomOut } from "lucide-react";
import { ContentRenderer } from "@/components/editor/ContentRenderer";
import { Sequence } from "@/components/editor/Sequence";
import "@/styles/editor.css";
import { SequenceSelector } from "./SequenceSelector";
import { parseMarkdownToClips } from "@/lib/markdown-parser";
import { msToFrames, percentageToMs } from "@/lib/time-utils";

const EditorialInterfaceComponent = ({ markdown }: { markdown: string }) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [ffwState, setFfwState] = useState(false);
  const [rewindState, setRewindState] = useState(false);
  const [screenRefreshRate, setScreenRefreshRate] = useState(60); // Default to 60fps
  const [ffwSpeedLevel, setFfwSpeedLevel] = useState(0);
  const [rewindSpeedLevel, setRewindSpeedLevel] = useState(0);
  const [currentKeyCode, setCurrentKeyCode] = useState("");
  const [currentShiftKey, setCurrentShiftKey] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%, 0.5 = 50%, 2 = 200%
  const [timelineHeight, setTimelineHeight] = useState(2000); // Default playhead height - will be adjusted dynamically
  const [timelineWidth, setTimelineWidth] = useState(2000); // Timeline content width
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0); // Track horizontal scroll position
  const timelineTicksRef = useRef<HTMLDivElement>(null);

  // Parse markdown and generate clips
  const { clips, totalDuration, sections } = useMemo(() => {
    try {
      return parseMarkdownToClips(markdown);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return { clips: [], totalDuration: 60000, sections: [] }; // Default 60s
    }
  }, [markdown]);

  // Convert total duration from milliseconds to seconds for timeline calculations
  const timelineDuration = totalDuration / 1000; // seconds
  const timelineDurationFrames = msToFrames(totalDuration);
  const percentagePerSecond = timelineDuration > 0 ? 1 / timelineDuration : 0;

  const verticalSectionRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);

  const getTimecodeFromScroll = useCallback(
    (percentage: number) => {
      try {
        // Convert percentage to milliseconds, then to frames
        const currentMs = percentageToMs(percentage, totalDuration);
        const currentFrame = msToFrames(currentMs);

        // Create timecode from frame count
        const tc = new Timecode(currentFrame, 24, false);

        return tc.toString();
      } catch (error) {
        console.error("Timecode conversion error:", error);
        return "00:00:00;00";
      }
    },
    [totalDuration]
  );

  const getTimelineDurationTimecode = useCallback(() => {
    try {
      // Create timecode from frame count
      const tc = new Timecode(timelineDurationFrames, 24, false);
      return tc.toString();
    } catch (error) {
      console.error("Timecode conversion error:", error);
      return "00:00:00;00";
    }
  }, [timelineDurationFrames]);

  useEffect(() => {
    let animationId: number;

    if (isPlaying) {
      const animate = () => {
        setScrollPercentage((prev) => {
          const newPercentage = prev + percentagePerSecond / screenRefreshRate; // 60fps approximation
          if (newPercentage >= 1) {
            setIsPlaying(false);
            return 1;
          }
          return newPercentage;
        });
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, percentagePerSecond, screenRefreshRate]);

  // Update the scroll sync effect to handle vertical scrolling only
  useEffect(() => {
    if (isScrolling) return; // Skip if user is manually scrolling

    const verticalSection = verticalSectionRef.current;

    if (verticalSection) {
      // Round the scroll positions to prevent floating point errors
      const verticalScrollMax =
        verticalSection.scrollHeight - verticalSection.clientHeight;
      const roundedVerticalScroll = Math.round(
        scrollPercentage * verticalScrollMax
      );
      verticalSection.scrollTop = roundedVerticalScroll;

      // Disabled: Automatic horizontal timeline scroll
      // const horizontalSection = timelineWrapperRef.current;
      // if (horizontalSection) {
      //   const horizontalScrollMax =
      //     horizontalSection.scrollWidth - horizontalSection.clientWidth;
      //   const roundedHorizontalScroll = Math.round(
      //     scrollPercentage * horizontalScrollMax
      //   );
      //   horizontalSection.scrollLeft = roundedHorizontalScroll;
      // }
    }
  }, [scrollPercentage, isScrolling]);

  // Update the handleScroll callback - vertical scrolling only
  const handleScroll = useCallback(
    (e: any) => {
      if (isPlaying || ffwState || rewindState) {
        setIsPlaying(false);
        setFfwState(false);
        setRewindState(false);
        return;
      }

      const verticalSection = verticalSectionRef.current;

      if (verticalSection && e.target === verticalSection) {
        setIsScrolling(true);
        let newScrollPercentage;

        newScrollPercentage =
          verticalSection.scrollTop /
          (verticalSection.scrollHeight - verticalSection.clientHeight);

        if (newScrollPercentage !== undefined) {
          // Clamp the scroll percentage between 0 and 1
          newScrollPercentage = Math.max(0, Math.min(1, newScrollPercentage));
          // Round to 4 decimal places to prevent floating point errors
          newScrollPercentage = Math.round(newScrollPercentage * 10000) / 10000;
        }
        setIsScrolling(false);
      }
    },
    [isPlaying, ffwState, rewindState]
  );

  // Update scroll event listeners
  // useEffect(() => {
  //   const verticalSection = verticalSectionRef.current;
  //   const horizontalSection = timelineWrapperRef.current;

  //   if (verticalSection && horizontalSection) {
  //     verticalSection.addEventListener('scroll', handleScroll);
  //     horizontalSection.addEventListener('scroll', handleScroll);
  //   }

  //   return () => {
  //     if (verticalSection) {
  //       verticalSection.removeEventListener('scroll', handleScroll);
  //     }
  //     if (horizontalSection) {
  //       horizontalSection.removeEventListener('scroll', handleScroll);
  //     }
  //   };
  // }, [handleScroll]);

  // Update the playhead position and height calculation
  useEffect(() => {
    const updatePlayheadPosition = () => {
      if (timelineWrapperRef.current) {
        const width = timelineWrapperRef.current.scrollWidth;
        // Position playhead within the timeline
        const position = scrollPercentage * width;
        setPlayheadPosition(position);
        setTimelineWidth(width);
        
        // Calculate playhead height: ticks (32px) + tracks (5 × 32px = 160px) = 192px
        const ticksHeight = 32;
        const tracksHeight = 5 * 32; // 5 tracks, each 32px
        const totalHeight = ticksHeight + tracksHeight;
        setTimelineHeight(totalHeight);
      }
    };

    // Don't skip updates when scrolling
    updatePlayheadPosition();

    const resizeObserver = new ResizeObserver(updatePlayheadPosition);
    if (timelineWrapperRef.current) {
      resizeObserver.observe(timelineWrapperRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [scrollPercentage, zoomLevel]);

  const handlePlayheadDrag = useCallback((e: any, data: { x: number }) => {
    setIsPlaying(false);
    setFfwState(false);
    setRewindState(false);

    if (!timelineWrapperRef.current) return;

    const timelineWidth = timelineWrapperRef.current.scrollWidth;
    const maxX = timelineWidth - 2;
    const clampedX = Math.max(0, Math.min(maxX, data.x));
    const newPercentage = clampedX / timelineWidth;

    setPlayheadPosition(clampedX);
    setScrollPercentage(newPercentage);
  }, []);

  // Update keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      // Update shortcut display state
      setCurrentKeyCode(e.code);
      setCurrentShiftKey(e.shiftKey);

      // Reset after a short delay
      setTimeout(() => {
        setCurrentKeyCode("");
        setCurrentShiftKey(false);
      }, 150);

      // Handle zoom shortcuts (Cmd/Ctrl + = for zoom in, Cmd/Ctrl - for zoom out)
      if ((e.metaKey || e.ctrlKey) && (e.code === "Equal" || e.code === "Minus")) {
        e.preventDefault();
        if (e.code === "Equal") {
          // Zoom in
          setZoomLevel((prev) => Math.min(4, prev + 0.25));
        } else if (e.code === "Minus") {
          // Zoom out
          setZoomLevel((prev) => Math.max(0.25, prev - 0.25));
        }
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (document.activeElement === playButtonRef.current) {
          playButtonRef.current?.blur();
        }
      }

      switch (e.code) {
        case "KeyK":
        case "Space":
          if (ffwState || rewindState) {
            setIsPlaying(true);
            setFfwState(false);
            setRewindState(false);
            setFfwSpeedLevel(0);
            setRewindSpeedLevel(0);
          } else {
            setIsPlaying((prev) => !prev);
          }
          if (playButtonRef.current) {
            playButtonRef.current.blur();
          }
          break;
        case "KeyL":
          setIsPlaying(false);
          setRewindState(false);
          setRewindSpeedLevel(0);
          if (ffwState) {
            setFfwSpeedLevel((prev) => Math.min(prev + 1, 4));
          } else {
            setFfwState(true);
            setFfwSpeedLevel(1);
          }
          break;
        case "KeyJ":
          setIsPlaying(false);
          setFfwState(false);
          setFfwSpeedLevel(0);
          if (rewindState) {
            setRewindSpeedLevel((prev) => Math.min(prev + 1, 4));
          } else {
            setRewindState(true);
            setRewindSpeedLevel(1);
          }
          break;
        case "KeyI":
          if (e.shiftKey) {
            setIsPlaying(false);
            setFfwState(false);
            setRewindState(false);
            setScrollPercentage(0);
          }
          break;
        case "KeyO":
          if (e.shiftKey) {
            setIsPlaying(false);
            setFfwState(false);
            setRewindState(false);
            setScrollPercentage(1);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          setScrollPercentage((prev) => {
            const framesPerJump = e.shiftKey ? 24 : 1;
            const percentPerFrame = 1 / timelineDurationFrames;
            const increment = percentPerFrame * framesPerJump;
            return Math.min(1, prev + increment);
          });
          break;
        case "ArrowLeft":
          e.preventDefault();
          setScrollPercentage((prev) => {
            const framesPerJump = e.shiftKey ? 24 : 1;
            const percentPerFrame = 1 / timelineDurationFrames;
            const increment = percentPerFrame * framesPerJump;
            return Math.max(0, prev - increment);
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setIsPlaying(false);
          setFfwState(false);
          setRewindState(false);
          setScrollPercentage(0);
          break;
        case "ArrowDown":
          e.preventDefault();
          setIsPlaying(false);
          setFfwState(false);
          setRewindState(false);
          setScrollPercentage(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ffwState, rewindState, timelineDurationFrames]);

  // Update playback animation
  useEffect(() => {
    let animationId: number | null = null;
    const getSpeedMultiplier = () => {
      if (ffwState) {
        return Math.pow(2, ffwSpeedLevel + 1); // 2x, 4x, 8x
      }
      if (rewindState) {
        return Math.pow(2, rewindSpeedLevel + 1); // 2x, 4x, 8x
      }
      return 1;
    };

    const animate = () => {
      setScrollPercentage((prev) => {
        let newPercentage = prev;
        const speedMultiplier = getSpeedMultiplier();

        if (isPlaying) {
          newPercentage += percentagePerSecond / 60;
        } else if (ffwState) {
          newPercentage += (percentagePerSecond * speedMultiplier) / 60;
        } else if (rewindState) {
          newPercentage -= (percentagePerSecond * speedMultiplier) / 60;
        } else {
          return prev;
        }

        // Clamp between 0 and 1
        newPercentage = Math.max(0, Math.min(1, newPercentage));

        // Stop playing if we hit the bounds
        if (newPercentage >= 1 || newPercentage <= 0) {
          setIsPlaying(false);
          setFfwState(false);
          setRewindState(false);
        }

        return newPercentage;
      });

      animationId = requestAnimationFrame(animate);
    };

    if (isPlaying || ffwState || rewindState) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    isPlaying,
    ffwState,
    rewindState,
    percentagePerSecond,
    ffwSpeedLevel,
    rewindSpeedLevel,
  ]);

  const sequences = [
    { id: "introduction", name: "OTIO_Introduction_v01.otio" },
    { id: "for-editors", name: "OTIO_for_editors_v01.otio" },
    { id: "for-developers", name: "OTIO_for_developers_v01.otio" },
  ];

  return (
    <div className="editorContainer">
      <ScrollContext.Provider value={scrollPercentage}>
        <div className="uiContainer">
          <div ref={verticalSectionRef} className="programMonitor">
            <div className="programMonitorHeader">
              <SequenceSelector
                sequences={sequences}
                activeSequenceId={"introduction"}
                onSequenceChange={function (sequenceId: string): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
            <KeyboardShortcutDisplay
              keyCode={currentKeyCode}
              shiftKey={currentShiftKey}
              isPlaying={isPlaying}
              ffwSpeedLevel={ffwSpeedLevel}
              rewindSpeedLevel={rewindSpeedLevel}
              ffwState={ffwState}
              rewindState={rewindState}
            />
            <ContentRenderer 
              markdown={markdown} 
              sections={sections}
              currentTimeMs={percentageToMs(scrollPercentage, totalDuration)}
              syncWithPlayhead={false}
            />
            {/* <BodyContent /> */}
          </div>
          <div className="transportControls">
            <div className="font-mono text-sm">
              {getTimecodeFromScroll(scrollPercentage)}
            </div>
            <div className="playbackControlsButtonWrapper">
              <Button
                className="playbackControlButton"
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsPlaying(false);
                  setFfwState(false);
                  setFfwSpeedLevel(0);
                  if (rewindState) {
                    setRewindSpeedLevel((prev) => Math.min(prev + 1, 4));
                  } else {
                    setRewindState(true);
                    setRewindSpeedLevel(1);
                  }
                }}
                style={{
                  outline: 0,
                  backgroundColor: rewindState
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                }}
              >
                {/* {rewindState ? `Rewind ${Math.pow(2, rewindSpeedLevel)}x` : 'Rewind'} */}
                <Rewind />
              </Button>
              <Button
                ref={playButtonRef}
                className="playbackControlButton"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (ffwState || rewindState) {
                    setIsPlaying(false);
                    setFfwState(false);
                    setRewindState(false);
                  } else {
                    setIsPlaying((prev) => !prev);
                  }
                }}
                style={{
                  outline: 0,
                  backgroundColor: isPlaying
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                }}
              >
                {/* {isPlaying ? 'Pause' : 'Play'} */}
                {isPlaying ? <Pause /> : <Play />}
              </Button>
              <Button
                className="playbackControlButton"
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsPlaying(false);
                  setRewindState(false);
                  setRewindSpeedLevel(0);
                  if (ffwState) {
                    setFfwSpeedLevel((prev) => Math.min(prev + 1, 4));
                  } else {
                    setFfwState(true);
                    setFfwSpeedLevel(1);
                  }
                }}
                style={{
                  outline: 0,
                  backgroundColor: ffwState
                    ? "rgba(59, 130, 246, 0.2)"
                    : "transparent",
                }}
              >
                {/* {ffwState ? `Fast Forward ${Math.pow(2, ffwSpeedLevel)}x` : 'Fast Forward'} */}
                <FastForward />
              </Button>
            </div>
            <div className="font-mono text-sm text-right">
              {getTimelineDurationTimecode()}
            </div>
          </div>
          <div className="timelineControlsBar">
            <div className="zoomControls">
              <span className="text-xs text-muted-foreground mr-2">Zoom:</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((prev) => Math.max(0.25, prev - 0.25))}
                disabled={zoomLevel <= 0.25}
                title="Zoom Out (Cmd/Ctrl + -)"
              >
                <ZoomOut size={14} />
              </Button>
              <button
                className="text-xs mx-2 min-w-12 text-center hover:underline cursor-pointer"
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom (100%)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setZoomLevel((prev) => Math.min(4, prev + 0.25))}
                disabled={zoomLevel >= 4}
                title="Zoom In (Cmd/Ctrl + +)"
              >
                <ZoomIn size={14} />
              </Button>
            </div>
          </div>
          <div ref={timelineContainerRef} className="timelineWrapperContainer">
            {/* Ticks ruler row */}
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              {/* Spacer for track headers */}
              <div style={{ width: '250px', minWidth: '250px', height: '32px', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border))' }} />
              
              {/* Timeline ticks ruler */}
              <div
                ref={timelineTicksRef}
                className="timelineTicksWrapper"
                style={{
                  overflowX: 'scroll',
                  overflowY: 'hidden',
                  height: '32px',
                  flex: 1,
                  backgroundColor: 'hsl(var(--background))',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
                onScroll={(e) => {
                  // Sync ticks scroll with timeline
                  if (timelineWrapperRef.current) {
                    timelineWrapperRef.current.scrollLeft = e.currentTarget.scrollLeft;
                  }
                }}
              >
                <TimelineTicks 
                  totalDurationMs={totalDuration} 
                  zoomLevel={zoomLevel}
                  timelineWidth={timelineWidth}
                />
              </div>
            </div>

            {/* Track headers and timeline row */}
            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              {/* Fixed track headers column */}
              <div className="track-headers-fixed">
                <div className="track-header">
                  <div className="track-locked">
                    <Lock size={16} />
                  </div>
                  <div className="track-label">{"<h1>"}</div>
                  <div className="track-name">Header 1</div>
                  <div className="track-controls">
                    <button>
                      <Monitor size={16} />
                    </button>
                    <button>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="track-header">
                  <div className="track-locked">
                    <Lock size={16} />
                  </div>
                  <div className="track-label">{"<h2>"}</div>
                  <div className="track-name">Header 2</div>
                  <div className="track-controls">
                    <button>
                      <Monitor size={16} />
                    </button>
                    <button>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="track-header">
                  <div className="track-locked">
                    <Lock size={16} />
                  </div>
                  <div className="track-label">{"<h3>"}</div>
                  <div className="track-name">Header 3</div>
                  <div className="track-controls">
                    <button>
                      <Monitor size={16} />
                    </button>
                    <button>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="track-header">
                  <div className="track-locked">
                    <Lock size={16} />
                  </div>
                  <div className="track-label">{"<img>"}</div>
                  <div className="track-name">Image</div>
                  <div className="track-controls">
                    <button>
                      <Monitor size={16} />
                    </button>
                    <button>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <div className="track-header">
                  <div className="track-locked">
                    <Lock size={16} />
                  </div>
                  <div className="track-label">{"<p>"}</div>
                  <div className="track-name">Paragraph</div>
                  <div className="track-controls">
                    <button>
                      <Monitor size={16} />
                    </button>
                    <button>
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            
              {/* Scrollable timeline area */}
              <div
                id="timelineWrapper"
                ref={timelineWrapperRef}
                className="timelineWrapper"
                onScroll={(e) => {
                  // Sync timeline scroll with ticks
                  if (timelineTicksRef.current) {
                    timelineTicksRef.current.scrollLeft = e.currentTarget.scrollLeft;
                  }
                  // Track scroll position for playhead
                  setTimelineScrollLeft(e.currentTarget.scrollLeft);
                }}
              >
                <Sequence clips={clips} totalDurationMs={totalDuration} zoomLevel={zoomLevel} />
              </div>
            </div>

            {/* Playhead - positioned absolutely over the entire timeline */}
            <Draggable
              nodeRef={playheadRef}
              axis="x"
              position={{ x: playheadPosition, y: 0 }}
              onDrag={handlePlayheadDrag}
              bounds={{
                left: 0,
                right: timelineWrapperRef.current
                  ? timelineWrapperRef.current.scrollWidth - 2
                  : 0,
              }}
            >
              <div
                ref={playheadRef}
                className="playheadContainer"
                style={{
                  position: "absolute",
                  left: `${250 - timelineScrollLeft}px`, // Offset for track headers and account for scroll
                  top: 0, // Start at the top of ticks
                  height: "100%",
                  zIndex: 1000,
                  cursor: "ew-resize",
                  pointerEvents: "auto",
                }}
              >
                <Playhead height={timelineHeight} />
              </div>
            </Draggable>
          </div>
        </div>
      </ScrollContext.Provider>
    </div>
  );
};

export { EditorialInterfaceComponent };
