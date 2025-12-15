import React from "react";

interface PlayheadProps {
  height?: number;
}

// Memoized to prevent unnecessary re-renders
// Removed useScrollPercentage hook - position is handled by parent container
const Playhead = React.memo(({ height = 2000 }: PlayheadProps) => {
  return (
    <div
      className="playhead"
      style={{
        position: "relative",
        marginLeft: "-14px",
        marginTop: "-2px",
        top: 0,
        bottom: 0,
        width: "2px",
        zIndex: 1200,
      }}
    >
      <svg width="37" height={height} xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.25)) drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.4))' }}>
        <defs>
          <filter id="playhead-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="0" result="offsetblur"/>
            <feFlood floodColor="rgba(255, 255, 255, 0.6)"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g>
          <path
            id="svg_6"
            d="m1.82881,3.40205l-0.0114,6.04623l12.27836,11.64757l11.94274,-11.06834c0,-1.95122 0,-4.6676 0,-6.61882l-24.2097,-0.00665z"
            opacity="NaN"
            strokeWidth="1"
            stroke="rgba(0, 0, 0, 0.5)"
            fill="#1473E6"
          />
          <ellipse
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="0.5"
            ry="1.65016"
            rx="1.65016"
            id="svg_7"
            cy="13.72377"
            cx="14.09186"
            fill="#fff"
          />
          <line
            x1="14.09186"
            y1="20"
            x2="14.09186"
            y2={height}
            stroke="#1473E6"
            strokeWidth="2"
          />
          <line
            x1="14.09186"
            y1="20"
            x2="14.09186"
            y2={height}
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="0.5"
            transform="translate(0.5, 0)"
          />
        </g>
      </svg>
    </div>
  );
});

Playhead.displayName = "Playhead";

export default Playhead;
