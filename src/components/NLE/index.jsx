'use client'

import React, { useRef, useEffect } from 'react';
import Playhead from './Playhead';
import Draggable from 'react-draggable'; // The default
import styles from '../../styles/editor.css';
import Timecode from 'react-timecode';


const ContentSections = [
  {
    name: 'Title',
    backgroundColor: '#1662BF',
    borderColor: 'hsl(0, 50%, 90%)',
    track: 0
  },
  {
    name: 'Paragraph',
    backgroundColor: '#3f0db2',
    borderColor: 'hsl(0, 50%, 90%)',
    track: 1
  },
  {
    name: 'Graphic',
    backgroundColor: '#00422b',
    borderColor: 'hsl(0, 50%, 90%)',
    track: 2
  }
]

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Horizontal + vertical scroll
const EditorIndex = () => {
  const verticalSectionRef = useRef(null);
  const horizontalSectionRef = useRef(null);

  useEffect(() => {
    const verticalSection = verticalSectionRef.current;
    const horizontalSection = horizontalSectionRef.current;

    const handleScroll = () => {
      if (verticalSection && horizontalSection) {
        const scrollPercentage = verticalSection.scrollTop / (verticalSection.scrollHeight - verticalSection.clientHeight);
        horizontalSection.scrollLeft = scrollPercentage * (horizontalSection.scrollWidth - horizontalSection.clientWidth);
      }
    };

    if (verticalSection) {
      verticalSection.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (verticalSection) {
        verticalSection.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    // In order for this to work, the size of the components in the timeline needs to be calculated based on their 
    // rendered sized within the DOM, otherwise the scroll scaling will be all wrong. 
    <div className='uiContainer'>
      <div ref={verticalSectionRef} className='verticalSection'>
        {/* Your vertically scrolling content here */}
        {[...Array(50).keys()].map(i => (
          <div key={i} className='verticalItem'>Text section {i + 1}</div>
        ))}
      </div>
      <div ref={horizontalSectionRef} className='trackWrapper'>
        {/* <div className='playhead'> */}
          <Draggable
            axis='x'
            defaultPosition={{x: 10, y: 10}}
          >
            <Playhead />
          </Draggable>
        {/* </div> */}
        {/* Your horizontally scrolling content here */}
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
                color: clipSettings.borderColor
              }}>
              {clipSettings.name} {i + 1}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export { EditorIndex };
