/**
 * Time conversion utilities for timeline operations
 * Assumes 24fps for frame calculations
 */

const FPS = 24;

/**
 * Convert milliseconds to frames at 24fps
 */
export function msToFrames(ms: number): number {
  return Math.floor((ms / 1000) * FPS);
}

/**
 * Convert frames to milliseconds at 24fps
 */
export function framesToMs(frames: number): number {
  return (frames / FPS) * 1000;
}

/**
 * Convert milliseconds to timeline percentage (0-1)
 * @param ms - Time in milliseconds
 * @param totalDurationMs - Total timeline duration in milliseconds
 */
export function msToPercentage(ms: number, totalDurationMs: number): number {
  if (totalDurationMs === 0) return 0;
  return Math.max(0, Math.min(1, ms / totalDurationMs));
}

/**
 * Convert timeline percentage to milliseconds
 * @param percentage - Timeline position (0-1)
 * @param totalDurationMs - Total timeline duration in milliseconds
 */
export function percentageToMs(percentage: number, totalDurationMs: number): number {
  return percentage * totalDurationMs;
}

/**
 * Convert frames to timeline percentage
 * @param frames - Frame count
 * @param totalDurationFrames - Total timeline duration in frames
 */
export function framesToPercentage(frames: number, totalDurationFrames: number): number {
  if (totalDurationFrames === 0) return 0;
  return Math.max(0, Math.min(1, frames / totalDurationFrames));
}

/**
 * Convert timeline percentage to frames
 * @param percentage - Timeline position (0-1)
 * @param totalDurationFrames - Total timeline duration in frames
 */
export function percentageToFrames(percentage: number, totalDurationFrames: number): number {
  return Math.floor(percentage * totalDurationFrames);
}

/**
 * Convert milliseconds to frames, then to percentage
 * @param ms - Time in milliseconds
 * @param totalDurationMs - Total timeline duration in milliseconds
 */
export function msToFramesToPercentage(ms: number, totalDurationMs: number): number {
  const frames = msToFrames(ms);
  const totalFrames = msToFrames(totalDurationMs);
  return framesToPercentage(frames, totalFrames);
}

