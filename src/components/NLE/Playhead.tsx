import React from "react";
import { useScrollPercentage } from "./ScrollContext";

const Playhead = () => {
  const scrollPercentage = useScrollPercentage();

  return (
    <div
      className="playhead"
      style={{
        position: "relative",
        left: `clamp(0%, ${scrollPercentage * 100}%, 100%)`,
        marginLeft: "-14px",
        top: 0,
        bottom: 0,
        width: "2px",
        // backgroundColor: 'red',
        zIndex: 1000,
      }}
    >
      <svg width="37" height="200" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path
            id="svg_6"
            d="m1.82881,3.40205l-0.0114,6.04623l12.27836,11.64757l11.94274,-11.06834c0,-1.95122 0,-4.6676 0,-6.61882l-24.2097,-0.00665z"
            opacity="NaN"
            strokeWidth="3"
            stroke="#1473E6"
            fill="#1473E6"
          />
          <ellipse
            stroke="#FFF"
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
            y2="180"
            stroke="#1473E6"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
};

export default Playhead;
