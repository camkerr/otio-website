'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Playhead from './Playhead';
import Draggable from 'react-draggable'; // The default
import styles from '../../styles/editor.css';
import Timecode from 'smpte-timecode';
import { randInt } from 'three/src/math/MathUtils.js';
import { Button } from '@/components/ui/button';
import { ScrollContext } from './ScrollContext';

const ContentSections = [
  {
    name: 'Title',
    width: randInt(125, 300),
    backgroundColor: '#1662BF',
    borderColor: 'hsl(0, 50%, 90%)',
    track: 0
  },
  {
    name: 'Paragraph',
    width: randInt(125, 300),
    backgroundColor: '#3f0db2',
    borderColor: 'hsl(0, 50%, 90%)',
    track: 1
  },
  {
    name: 'Graphic',
    width: randInt(125, 300),
    backgroundColor: '#00422b',
    borderColor: 'hsl(0, 50%, 90%)',
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
              borderColor: clipSettings.borderColor,
              backgroundColor: clipSettings.backgroundColor,
              marginTop: `${clipSettings.track * 48}px`,
              color: clipSettings.borderColor,
              width: `${clipSettings.width}px`,
            }}>
            {clipSettings.name} {i + 1}
          </div>
        )
      })}
    </>
  )
});
TimelineContent.displayName = 'TimelineContent';

// Horizontal + vertical scroll
const EditorIndex = () => {
  const verticalSectionRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const timelineDuration = 2 * 60; // 2 minutes in seconds
  const timelineDurationFrames = timelineDuration * 24;
  const percentagePerSecond = 1 / timelineDuration;

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

  const handleScroll = useCallback(() => {
    const verticalSection = verticalSectionRef.current;
    const horizontalSection = horizontalSectionRef.current;

    if (verticalSection && horizontalSection) {
      const newScrollPercentage = verticalSection.scrollTop / (verticalSection.scrollHeight - verticalSection.clientHeight);
      setScrollPercentage(newScrollPercentage);
      horizontalSection.scrollLeft = newScrollPercentage * (horizontalSection.scrollWidth - horizontalSection.clientWidth);
    }
  }, []);

  useEffect(() => {
    const verticalSection = verticalSectionRef.current;

    if (verticalSection) {
      verticalSection.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (verticalSection) {
        verticalSection.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <ScrollContext.Provider value={scrollPercentage}>
      <div className='uiContainer'>
        <div ref={verticalSectionRef} className='previewWindow'>
          <BodyContent />
        </div>
        <div className='transportControls'>
          {/* <div>{(scrollPercentage * 100).toFixed(2)}%</div> */}
          <div>
            {getTimecodeFromScroll(scrollPercentage)}
          </div>
          <div className='playbackControlsButtonWrapper'>
            <Button className='playbackControlButton' variant='outline' size='icon'>Rewind</Button>
            <Button className='playbackControlButton' variant='outline' size='icon'>Play/Pause</Button>
            <Button className='playbackControlButton' variant='outline' size='icon'>Fast Forward</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {getTimelineDurationTimecode()}
          </div>
        </div>
        <div ref={horizontalSectionRef} className='timelineWrapper'>
          <Playhead />
          <TimelineContent />
        </div>
      </div>
    </ScrollContext.Provider>
  );
};

export { EditorIndex };
