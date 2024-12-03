"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Playhead from "./Playhead";
import Draggable from "react-draggable"; // The default
import Timecode from "smpte-timecode";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutDisplay } from "@/components/editor/KeyboardShortcutDisplay";
import { ScrollContext } from "@/components/editor/ScrollContext";
import { TimelineTicks } from "@/components/editor/TimelineTicks";
import { Play, Pause, FastForward, Rewind } from "lucide-react";
import { ContentRenderer } from "@/components/editor/ContentRenderer";
import { Sequence } from "@/components/editor/Sequence";
import "@/styles/editor.css";
import { SequenceSelector } from "./SequenceSelector";

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

  const timelineDuration = 1 * 60;
  const timelineDurationFrames = timelineDuration * 24;
  const percentagePerSecond = 1 / timelineDuration;

  const verticalSectionRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const timelineContentRef = useRef<HTMLDivElement>(null);

  const getTimecodeFromScroll = useCallback(
    (percentage: number) => {
      try {
        // Calculate current frame based on scroll percentage
        const currentFrame = Math.floor(timelineDurationFrames * percentage);

        // Create timecode from frame count
        const tc = new Timecode(currentFrame, 24, false);

        return tc.toString();
      } catch (error) {
        console.error("Timecode conversion error:", error);
        return "00:00:00;00";
      }
    },
    [timelineDurationFrames]
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

  // Update the scroll sync effect to handle both scrolling containers
  useEffect(() => {
    if (isScrolling) return; // Skip if user is manually scrolling

    const verticalSection = verticalSectionRef.current;
    const horizontalSection = timelineWrapperRef.current;

    if (verticalSection && horizontalSection) {
      // Round the scroll positions to prevent floating point errors
      const verticalScrollMax =
        verticalSection.scrollHeight - verticalSection.clientHeight;
      const roundedVerticalScroll = Math.round(
        scrollPercentage * verticalScrollMax
      );
      verticalSection.scrollTop = roundedVerticalScroll;

      const horizontalScrollMax =
        horizontalSection.scrollWidth - horizontalSection.clientWidth;
      const roundedHorizontalScroll = Math.round(
        scrollPercentage * horizontalScrollMax
      );
      horizontalSection.scrollLeft = roundedHorizontalScroll;
    }
  }, [scrollPercentage, isScrolling]);

  // Update the handleScroll callback to sync both directions
  const handleScroll = useCallback(
    (e: any) => {
      if (isPlaying || ffwState || rewindState) {
        setIsPlaying(false);
        setFfwState(false);
        setRewindState(false);
        return;
      }

      const verticalSection = verticalSectionRef.current;
      const horizontalSection = timelineWrapperRef.current;

      if (verticalSection && horizontalSection) {
        setIsScrolling(true);
        let newScrollPercentage;

        if (e.target === verticalSection) {
          newScrollPercentage =
            verticalSection.scrollTop /
            (verticalSection.scrollHeight - verticalSection.clientHeight);
        } else if (e.target === horizontalSection) {
          newScrollPercentage =
            horizontalSection.scrollLeft /
            (horizontalSection.scrollWidth - horizontalSection.clientWidth);
        }

        if (newScrollPercentage !== undefined) {
          // Clamp the scroll percentage between 0 and 1
          newScrollPercentage = Math.max(0, Math.min(1, newScrollPercentage));
          // Round to 4 decimal places to prevent floating point errors
          newScrollPercentage = Math.round(newScrollPercentage * 10000) / 10000;

          // Only update if the change is significant enough
          // const diff = Math.abs(newScrollPercentage - scrollPercentage);
          // if (diff > 0.0001) {
          //   setScrollPercentage(newScrollPercentage);
          // }
        }
        setIsScrolling(false);
        // setTimeout(() => setIsScrolling(false), 50);
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

  // Update the playhead position calculation
  useEffect(() => {
    const updatePlayheadPosition = () => {
      if (timelineWrapperRef.current) {
        const timelineWidth = timelineWrapperRef.current.scrollWidth;
        // Use raw scrollPercentage for smoother playhead movement
        const position = scrollPercentage * timelineWidth;
        setPlayheadPosition(position);
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
  }, [scrollPercentage]); // Remove isScrolling dependency

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
            <ContentRenderer markdown={markdown} />
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
          <div ref={timelineContainerRef} className="timelineWrapperContainer">
            <div
              id="timelineWrapper"
              ref={timelineWrapperRef}
              className="timelineWrapper"
            >
              {/* <TimelineTicks containerRef={timelineWrapperRef} /> */}
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
                    left: 0,
                    top: 0,
                    height: "100%",
                    zIndex: 10,
                    cursor: "ew-resize",
                  }}
                >
                  <Playhead />
                </div>
              </Draggable>
              <Sequence clips={[]} />
            </div>
          </div>
        </div>
      </ScrollContext.Provider>
    </div>
  );
};

export { EditorialInterfaceComponent };
