import React, { useEffect, useRef, useState } from 'react';

interface TimelineTicksProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const TimelineTicks = ({ containerRef }: TimelineTicksProps) => {
  const [width, setWidth] = useState(0);
  const ticksContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        // Get the total width of all content inside the timeline
        const timelineContent = containerRef.current.querySelector(':scope > div:last-child');
        if (timelineContent) {
          const totalWidth = Array.from(timelineContent.children)
            .reduce((acc, child) => acc + child.getBoundingClientRect().width, 0);
          setWidth(Math.max(totalWidth, containerRef.current.scrollWidth));
        } else {
          setWidth(containerRef.current.scrollWidth);
        }
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    // Also observe the timeline content for changes
    const timelineContent = containerRef.current.querySelector(':scope > div:last-child');
    if (timelineContent) {
      resizeObserver.observe(timelineContent);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  const renderTicks = () => {
    const ticks = [];
    const numTicks = 100;

    for (let i = 0; i <= numTicks; i++) {
      const percentage = (i / numTicks) * 100;
      const isMajorTick = i % 5 === 0;
      
      ticks.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${percentage}%`,
            top: 0,
            height: isMajorTick ? '16px' : '8px',
            width: '1px',
            backgroundColor: `hsl(var(--primary))`,
            // transform: 'translateX(-50%)'
          }}
        />
      );
    }
    return ticks;
  };

  return (
    <div 
      ref={ticksContainerRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${width}px`,
        height: '16px',
        backgroundColor: 'transparent',
        borderTop: '2px solid hsl(var(--primary))',
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      {renderTicks()}
    </div>
  );
};
