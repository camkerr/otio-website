'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Playhead from './Playhead';
import Draggable from 'react-draggable'; // The default
import styles from '../../styles/editor.css';
import Timecode from 'smpte-timecode';
import { randInt } from 'three/src/math/MathUtils.js';
import { Button } from '@/components/ui/button';
import { KeyboardShortcutDisplay } from '@/components/NLE/KeyboardShortcutDisplay';
import { ScrollContext } from '@/components/NLE/ScrollContext';


const ContentSections = [
  {
    name: 'Title',
    width: randInt(125, 300),
    backgroundColor: 'hsl(var(--secondary-foreground))',
    borderColor: 'hsl(var(--border))',
    track: 0
  },
  {
    name: 'Paragraph',
    width: randInt(125, 300),
    backgroundColor: 'hsl(var(--secondary-foreground))',
    borderColor: 'hsl(var(--border))',
    track: 1
  },
  {
    name: 'Graphic',
    width: randInt(125, 300),
    backgroundColor: 'hsl(var(--secondary-foreground))',
    borderColor: 'hsl(var(--border))',
    track: 2
  }
]

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const BodyContent = React.memo(() => {
  return (
    <>
      {[...Array(50).keys()].map(i => (
        <div key={i} className='verticalItem'>Text section {i + 1}</div>
      ))}
    </>
  )
});
BodyContent.displayName = 'BodyContent';

const TimelineContent = React.memo(() => {
  return (
    <>
      {[...Array(50).keys()].map(i => {
        const clipSettings = ContentSections[randomIntFromInterval(0, 2)]
        return (
          <div
            key={i}
            className='itemHorizontal'
            style={{
              border: "2px solid",
              boxShadow: "0 0 4px hsl(var(--primary) / 0.5)",
              borderColor: clipSettings.borderColor,
              backgroundColor: clipSettings.backgroundColor,
              marginTop: `${clipSettings.track * 48}px`,
              width: `${clipSettings.width}px`,
            }}>
            <p className="text-primary-foreground">{clipSettings.name} {i + 1}</p>
          </div>
        )
      })}
    </>
  )
});
TimelineContent.displayName = 'TimelineContent';

// Horizontal + vertical scroll
const EditorIndex = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [ffwState, setFfwState] = useState(false);
  const [rewindState, setRewindState] = useState(false);
  const [screenRefreshRate, setScreenRefreshRate] = useState(60); // Default to 60fps
  const [ffwSpeedLevel, setFfwSpeedLevel] = useState(0);
  const [rewindSpeedLevel, setRewindSpeedLevel] = useState(0);
  const [currentKeyCode, setCurrentKeyCode] = useState('');
  const [currentShiftKey, setCurrentShiftKey] = useState(false);

  const timelineDuration = 4 * 60;
  const timelineDurationFrames = timelineDuration * 24;
  const percentagePerSecond = 1 / timelineDuration;

  const verticalSectionRef = useRef(null);
  const playButtonRef = useRef(null);
  const timelineWrapperRef = useRef(null);


  useEffect(() => {
    const getScreenRefreshRate = () => {
      if (window.screen.frameRate) {
        // For browsers that support screen.frameRate
        setScreenRefreshRate(window.screen.frameRate);
      } else if (window.requestAnimationFrame) {
        // Fallback method using requestAnimationFrame
        let frames = 0;
        let prevTime = performance.now();

        const countFrames = (currentTime) => {
          frames++;
          if (currentTime - prevTime >= 1000) {
            // More than 1 second has passed
            setScreenRefreshRate(Math.round(frames * 1000 / (currentTime - prevTime)));
            return;
          }
          requestAnimationFrame(countFrames);
        };

        requestAnimationFrame(countFrames);
      }
    };

    getScreenRefreshRate();
  }, []);

  const getTimecodeFromScroll = useCallback((percentage) => {
    try {
      // Calculate current frame based on scroll percentage
      const currentFrame = Math.floor(timelineDurationFrames * percentage);

      // Create timecode from frame count
      const tc = new Timecode(currentFrame, 24, false);

      return tc.toString();
    } catch (error) {
      console.error('Timecode conversion error:', error);
      return '00:00:00;00';
    }
  }, [timelineDurationFrames]);

  const getTimelineDurationTimecode = useCallback(() => {
    try {
      // Create timecode from frame count
      const tc = new Timecode(timelineDurationFrames, 24, false);
      return tc.toString();
    } catch (error) {
      console.error('Timecode conversion error:', error);
      return '00:00:00;00';
    }
  }, [timelineDurationFrames])

  useEffect(() => {
    let animationId;

    if (isPlaying) {
      const animate = () => {
        setScrollPercentage(prev => {
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
  }, [isPlaying, percentagePerSecond]);

  // Update the scroll sync effect to handle both scrolling containers
  useEffect(() => {
    if (isScrolling) return; // Skip if user is manually scrolling

    const verticalSection = verticalSectionRef.current;
    const horizontalSection = timelineWrapperRef.current;

    if (verticalSection && horizontalSection) {
      // Round the scroll positions to prevent floating point errors
      const verticalScrollMax = verticalSection.scrollHeight - verticalSection.clientHeight;
      const roundedVerticalScroll = Math.round(scrollPercentage * verticalScrollMax);
      verticalSection.scrollTop = roundedVerticalScroll;

      const horizontalScrollMax = horizontalSection.scrollWidth - horizontalSection.clientWidth;
      const roundedHorizontalScroll = Math.round(scrollPercentage * horizontalScrollMax);
      horizontalSection.scrollLeft = roundedHorizontalScroll;
    }
  }, [scrollPercentage, isScrolling]);

  // Update the handleScroll callback to sync both directions
  const handleScroll = useCallback((e) => {
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
        newScrollPercentage = verticalSection.scrollTop / (verticalSection.scrollHeight - verticalSection.clientHeight);
      } else if (e.target === horizontalSection) {
        newScrollPercentage = horizontalSection.scrollLeft / (horizontalSection.scrollWidth - horizontalSection.clientWidth);
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
      setIsScrolling(false)
      // setTimeout(() => setIsScrolling(false), 50);
    }
  }, [isPlaying, ffwState, rewindState]);

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

  const handlePlayheadDrag = useCallback((e, data) => {
    setIsPlaying(false);
    setFfwState(false);
    setRewindState(false);

    if (!timelineWrapperRef.current) return;

    const timelineWidth = timelineWrapperRef.current.scrollWidth;
    // Add a small buffer (2px) from the right edge to prevent overflow
    const maxX = timelineWidth - 2;

    // Clamp x position first
    const clampedX = Math.max(0, Math.min(maxX, data.x));
    let newPercentage = clampedX / timelineWidth;

    // Extra boundary checks
    if (newPercentage > 0.995) {
      newPercentage = 1;
    } else if (newPercentage < 0.005) {
      newPercentage = 0;
    }

    setPlayheadPosition(clampedX); // Update playhead position immediately
    setScrollPercentage(newPercentage);
  }, []);

  // Update keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Update shortcut display state
      setCurrentKeyCode(e.code);
      setCurrentShiftKey(e.shiftKey);
      
      // Reset after a short delay
      setTimeout(() => {
        setCurrentKeyCode('');
        setCurrentShiftKey(false);
      }, 150);

      if (e.code === 'Space') {
        e.preventDefault();
        if (document.activeElement === playButtonRef.current) {
          playButtonRef.current.blur();
        }
      }

      switch (e.code) {
        case 'KeyK':
        case 'Space':
          if (ffwState || rewindState) {
            setIsPlaying(true);
            setFfwState(false);
            setRewindState(false);
            setFfwSpeedLevel(0);
            setRewindSpeedLevel(0);
          } else {
            setIsPlaying(prev => !prev);
          }
          if (playButtonRef.current) {
            playButtonRef.current.blur();
          }
          break;
        case 'KeyL':
          setIsPlaying(false);
          setRewindState(false);
          setRewindSpeedLevel(0);
          if (ffwState) {
            setFfwSpeedLevel(prev => Math.min(prev + 1, 4));
          } else {
            setFfwState(true);
            setFfwSpeedLevel(1);
          }
          break;
        case 'KeyJ':
          setIsPlaying(false);
          setFfwState(false);
          setFfwSpeedLevel(0);
          if (rewindState) {
            setRewindSpeedLevel(prev => Math.min(prev + 1, 4));
          } else {
            setRewindState(true);
            setRewindSpeedLevel(1);
          }
          break;
        case 'KeyI':
          if (e.shiftKey) {
            setIsPlaying(false);
            setFfwState(false);
            setRewindState(false);
            setScrollPercentage(0);
          }
          break;
        case 'KeyO':
          if (e.shiftKey) {
            setIsPlaying(false);
            setFfwState(false);
            setRewindState(false);
            setScrollPercentage(1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ffwState, rewindState]);

  // Update playback animation
  useEffect(() => {
    let animationId;
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
      setScrollPercentage(prev => {
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
  }, [isPlaying, ffwState, rewindState, percentagePerSecond, ffwSpeedLevel, rewindSpeedLevel]);

  return (
    <ScrollContext.Provider value={scrollPercentage}>
      <div className='uiContainer'>
        <div ref={verticalSectionRef} className='previewWindow'>
          <KeyboardShortcutDisplay 
            keyCode={currentKeyCode} 
            shiftKey={currentShiftKey} 
            isPlaying={isPlaying}
            ffwSpeedLevel={ffwSpeedLevel}
            rewindSpeedLevel={rewindSpeedLevel}
            ffwState={ffwState}
            rewindState={rewindState}
          />
          <BodyContent />
        </div>
        <div className='transportControls'>
          <div className="font-mono text-sm">
            {getTimecodeFromScroll(scrollPercentage)}
          </div>
          <div className='playbackControlsButtonWrapper'>
            <Button
              className='playbackControlButton'
              variant='outline'
              tabIndex={-1}
              size='icon'
              onClick={() => {
                setIsPlaying(false);
                setFfwState(false);
                setFfwSpeedLevel(0);
                if (rewindState) {
                  setRewindSpeedLevel(prev => Math.min(prev + 1, 4));
                } else {
                  setRewindState(true);
                  setRewindSpeedLevel(1);
                }
              }}
              style={{
                backgroundColor: rewindState ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
              }}
            >
              {rewindState ? `Rewind ${Math.pow(2, rewindSpeedLevel)}x` : 'Rewind'}
            </Button>
            <Button
              ref={playButtonRef}
              className='playbackControlButton'
              variant='outline'
              size='icon'
              tabIndex={-1}
              onClick={() => {
                if (ffwState || rewindState) {
                  setIsPlaying(false);
                  setFfwState(false);
                  setRewindState(false);
                } else {
                  setIsPlaying(prev => !prev);
                }
              }}
              style={{
                backgroundColor: isPlaying ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              className='playbackControlButton'
              variant='outline'
              size='icon'
              tabIndex={-1}
              onClick={() => {
                setIsPlaying(false);
                setRewindState(false);
                setRewindSpeedLevel(0);
                if (ffwState) {
                  setFfwSpeedLevel(prev => Math.min(prev + 1, 4));
                } else {
                  setFfwState(true);
                  setFfwSpeedLevel(1);
                }
              }}
              style={{
                backgroundColor: ffwState ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
              }}
            >
              {ffwState ? `Fast Forward ${Math.pow(2, ffwSpeedLevel)}x` : 'Fast Forward'}
            </Button>
          </div>
          <div className="font-mono text-sm text-right">
            {getTimelineDurationTimecode()}
          </div>
        </div>
        <div className='timelineWrapperContainer'>
          <div
            id='timelineWrapper'
            ref={timelineWrapperRef}
            className='timelineWrapper'
          >
            <Draggable
              axis="x"
              position={{ x: playheadPosition, y: 0 }}
              onDrag={handlePlayheadDrag}
              bounds={{
                left: 0,
                right: timelineWrapperRef.current ? timelineWrapperRef.current.scrollWidth - 2 : 0
              }}
              onStop={(e, data) => {
                if (!timelineWrapperRef.current) return;

                const timelineWidth = timelineWrapperRef.current.scrollWidth;
                const maxX = timelineWidth - 2;

                // Clamp x position first
                const clampedX = Math.max(0, Math.min(maxX, data.x));
                let finalPercentage = clampedX / timelineWidth;

                // Extra boundary checks
                if (finalPercentage > 0.995) {
                  finalPercentage = 1;
                  setPlayheadPosition(timelineWidth - 2);
                } else if (finalPercentage < 0.005) {
                  finalPercentage = 0;
                  setPlayheadPosition(0);
                } else {
                  setPlayheadPosition(clampedX);
                }

                setScrollPercentage(finalPercentage);
              }}
            >
              <div
                className='playheadContainer'
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  zIndex: 10,
                  cursor: 'ew-resize',
                }}
              >
                <Playhead />
              </div>
            </Draggable>
            <TimelineContent />
          </div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
};

export { EditorIndex };
