import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  SkipForward, 
  SkipBack,
} from 'lucide-react';

export interface KeyboardShortcutDisplayProps {
  keyCode: string;
  shiftKey: boolean;
  isPlaying: boolean;
  ffwSpeedLevel: number;
  rewindSpeedLevel: number;
  ffwState: boolean;
  rewindState: boolean;
}

const SpeedIndicator = ({ 
  icon: Icon, 
  speedLevel, 
  active 
}: { 
  icon: React.ElementType; 
  speedLevel: number;
  active: boolean;
}) => {
  const iconSize = 48;
  const iconProps = { 
    size: iconSize,
    strokeWidth: 1.5,
    color: "white"
  };

  const isRewind = Icon === Rewind;
  const speedText = active && speedLevel > 0 && (
    <span className="text-white font-mono text-lg font-bold">
      {Math.pow(2, speedLevel)}x
    </span>
  );

  return (
    <div className="flex items-center gap-2">
      {!isRewind && speedText}
      <Icon {...iconProps} />
      {isRewind && speedText}
    </div>
  );
};

export const KeyboardShortcutDisplay = ({ 
  keyCode, 
  shiftKey, 
  isPlaying,
  ffwSpeedLevel,
  rewindSpeedLevel,
  ffwState,
  rewindState
}: KeyboardShortcutDisplayProps) => {
    const [shortcut, setShortcut] = useState<React.ReactNode | null>(null);
    const [isVisible, setIsVisible] = useState(false);
  
    useEffect(() => {
      let icon = null;
      const iconProps = { 
        size: 48,
        strokeWidth: 1.5,
        color: "white"
      };

      switch (keyCode) {
        case 'Space':
        case 'KeyK':
          icon = isPlaying ? <Pause {...iconProps} /> : <Play {...iconProps} />;
          break;
        case 'KeyL':
          icon = (
            <SpeedIndicator 
              icon={FastForward} 
              speedLevel={ffwSpeedLevel} 
              active={ffwState}
            />
          );
          break;
        case 'KeyJ':
          icon = (
            <SpeedIndicator 
              icon={Rewind} 
              speedLevel={rewindSpeedLevel} 
              active={rewindState}
            />
          );
          break;
        case 'KeyI':
          if (shiftKey) icon = <SkipBack {...iconProps} />;
          break;
        case 'KeyO':
          if (shiftKey) icon = <SkipForward {...iconProps} />;
          break;
        default:
          return;
      }
  
      if (icon) {
        setShortcut(icon);
        setIsVisible(true);
  
        // Hide after animation
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    }, [keyCode, shiftKey, isPlaying, ffwSpeedLevel, rewindSpeedLevel, ffwState, rewindState]);
  
    if (!shortcut) return null;
  
    return (
      <div className={`
        fixed top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2
        ${isVisible ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}
        transition-all duration-200 ease-in-out
        pointer-events-none z-[9999]
        bg-black/50 p-4 rounded-lg
        flex items-center justify-center
        min-w-[120px]
      `}>
        {shortcut}
      </div>
    );
};
  