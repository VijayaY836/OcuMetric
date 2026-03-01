/**
 * Eye tracking utilities for calculating Eye Aspect Ratio (EAR) and related metrics
 * Uses MediaPipe Face Mesh landmark indices for eye tracking
 * Requirements: 5.3
 */

/**
 * 3D point from MediaPipe Face Mesh
 */
export interface Point {
  x: number;
  y: number;
  z?: number;
}

/**
 * MediaPipe Face Mesh landmark indices for left eye
 * Indices: [outer corner, top-outer, top-inner, inner corner, bottom-inner, bottom-outer]
 */
export const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144] as const;

/**
 * MediaPipe Face Mesh landmark indices for right eye
 * Indices: [outer corner, top-outer, top-inner, inner corner, bottom-inner, bottom-outer]
 */
export const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380] as const;

/**
 * Calculate Euclidean distance between two points
 */
function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = (p2.z ?? 0) - (p1.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Compute Eye Aspect Ratio for a single eye
 * 
 * EAR formula: (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * where p1-p6 are the 6 eye landmarks in order:
 * - p1, p4: horizontal corners (outer, inner)
 * - p2, p3, p5, p6: vertical landmarks (top-outer, top-inner, bottom-inner, bottom-outer)
 * 
 * @param eyeLandmarks Array of 6 eye landmarks in order
 * @returns Eye Aspect Ratio value (typically 0.1-0.4, lower values indicate closed eye)
 */
export function computeEyeAspectRatio(eyeLandmarks: Point[]): number {
  if (eyeLandmarks.length !== 6) {
    throw new Error('computeEyeAspectRatio requires exactly 6 eye landmarks');
  }

  // Vertical distances
  const v1 = distance(eyeLandmarks[1], eyeLandmarks[5]); // top-outer to bottom-outer
  const v2 = distance(eyeLandmarks[2], eyeLandmarks[4]); // top-inner to bottom-inner
  
  // Horizontal distance
  const h = distance(eyeLandmarks[0], eyeLandmarks[3]); // outer corner to inner corner
  
  // Avoid division by zero
  if (h === 0) {
    return 0;
  }
  
  // EAR formula
  return (v1 + v2) / (2.0 * h);
}

/**
 * Calculate average Eye Aspect Ratio from face landmarks
 * 
 * Extracts left and right eye landmarks from MediaPipe Face Mesh output
 * and computes the average EAR across both eyes.
 * 
 * @param landmarks Array of 468 face landmarks from MediaPipe Face Mesh
 * @returns Average EAR value for both eyes
 */
export function calculateEAR(landmarks: Point[]): number {
  if (landmarks.length < 468) {
    throw new Error('calculateEAR requires 468 face landmarks from MediaPipe Face Mesh');
  }

  // Extract left eye landmarks
  const leftEyeLandmarks = LEFT_EYE_INDICES.map(idx => landmarks[idx]);
  
  // Extract right eye landmarks
  const rightEyeLandmarks = RIGHT_EYE_INDICES.map(idx => landmarks[idx]);
  
  // Calculate EAR for each eye
  const leftEAR = computeEyeAspectRatio(leftEyeLandmarks);
  const rightEAR = computeEyeAspectRatio(rightEyeLandmarks);
  
  // Return average
  return (leftEAR + rightEAR) / 2;
}

/**
 * Blink event with timestamp
 */
export interface BlinkEvent {
  timestamp: number;
}

/**
 * Detect blink based on Eye Aspect Ratio threshold
 * 
 * A blink is detected when the EAR falls below the threshold (default 0.21).
 * This threshold is based on research showing that EAR drops significantly
 * during eye closure.
 * 
 * Requirements: 5.2
 * 
 * @param ear Current Eye Aspect Ratio value
 * @param threshold EAR threshold for blink detection (default 0.21)
 * @returns true if blink detected, false otherwise
 */
export function detectBlink(ear: number, threshold: number = 0.21): boolean {
  return ear < threshold;
}

/**
 * Bounding box for face landmarks
 */
interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculate bounding box from face landmarks
 * 
 * @param landmarks Array of face landmarks
 * @returns Bounding box with min/max coordinates and dimensions
 */
function calculateBoundingBox(landmarks: Point[]): BoundingBox {
  if (landmarks.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = landmarks[0].x;
  let maxX = landmarks[0].x;
  let minY = landmarks[0].y;
  let maxY = landmarks[0].y;

  for (const point of landmarks) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return { minX, maxX, minY, maxY, width, height };
}

/**
 * Estimate face distance based on bounding box size
 * 
 * Uses the diagonal of the face bounding box as a proxy for distance.
 * Larger bounding box diagonal indicates the face is closer to the camera.
 * The value is normalized to 0-1 range where larger values mean closer distance.
 * 
 * Requirements: 5.4
 * 
 * @param faceLandmarks Array of face landmarks from MediaPipe Face Mesh
 * @returns Normalized distance value (0-1, larger = closer)
 */
export function estimateFaceDistance(faceLandmarks: Point[]): number {
  if (faceLandmarks.length === 0) {
    return 0;
  }

  // Calculate bounding box
  const bbox = calculateBoundingBox(faceLandmarks);

  // Calculate diagonal as proxy for distance
  const diagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2);

  // Normalize to 0-1 range
  // The maximum possible diagonal in normalized coordinates (0-1) is sqrt(2)
  // Larger diagonal = closer to camera
  return diagonal / Math.sqrt(2);
}

/**
 * MediaPipe Face Mesh landmark index for nose tip
 * The nose tip is used as a stable reference point for head position tracking
 */
export const NOSE_TIP_INDEX = 1;

/**
 * Calculate head position using nose tip landmark
 * 
 * Tracks the x, y coordinates of the nose tip over time to measure head movement.
 * The nose tip (landmark 1) is a stable reference point that moves with head position.
 * Coordinates are in normalized space (0-1) relative to the video frame.
 * 
 * Requirements: 5.5
 * 
 * @param faceLandmarks Array of face landmarks from MediaPipe Face Mesh
 * @returns Head position as {x, y} coordinates in normalized space (0-1)
 */
export function calculateHeadPosition(faceLandmarks: Point[]): { x: number; y: number } {
  if (faceLandmarks.length < 468) {
    throw new Error('calculateHeadPosition requires 468 face landmarks from MediaPipe Face Mesh');
  }

  // Use nose tip (landmark 1) as reference point
  const noseTip = faceLandmarks[NOSE_TIP_INDEX];

  return {
    x: noseTip.x,
    y: noseTip.y
  };
}
