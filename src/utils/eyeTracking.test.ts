/**
 * Unit tests for eye tracking utilities
 * Tests EAR calculation with specific examples and edge cases
 */

import { describe, it, expect } from 'vitest';
import { 
  computeEyeAspectRatio, 
  calculateEAR, 
  detectBlink,
  estimateFaceDistance,
  calculateHeadPosition,
  type Point, 
  LEFT_EYE_INDICES, 
  RIGHT_EYE_INDICES 
} from './eyeTracking';

describe('computeEyeAspectRatio', () => {
  it('should calculate EAR for a fully open eye', () => {
    // Simulate a fully open eye with typical proportions
    const eyeLandmarks: Point[] = [
      { x: 0, y: 0.5 },    // outer corner
      { x: 0.25, y: 0.3 }, // top-outer
      { x: 0.5, y: 0.3 },  // top-inner
      { x: 0.75, y: 0.5 }, // inner corner
      { x: 0.5, y: 0.7 },  // bottom-inner
      { x: 0.25, y: 0.7 }  // bottom-outer
    ];
    
    const ear = computeEyeAspectRatio(eyeLandmarks);
    
    // For an open eye, EAR should be around 0.25-0.6
    expect(ear).toBeGreaterThan(0.2);
    expect(ear).toBeLessThan(0.7);
  });

  it('should calculate lower EAR for a partially closed eye', () => {
    // Simulate a partially closed eye (reduced vertical distance)
    const eyeLandmarks: Point[] = [
      { x: 0, y: 0.5 },    // outer corner
      { x: 0.25, y: 0.4 }, // top-outer (closer to center)
      { x: 0.5, y: 0.4 },  // top-inner (closer to center)
      { x: 0.75, y: 0.5 }, // inner corner
      { x: 0.5, y: 0.6 },  // bottom-inner (closer to center)
      { x: 0.25, y: 0.6 }  // bottom-outer (closer to center)
    ];
    
    const ear = computeEyeAspectRatio(eyeLandmarks);
    
    // For a partially closed eye, EAR should be lower
    expect(ear).toBeGreaterThan(0.1);
    expect(ear).toBeLessThan(0.35);
  });

  it('should calculate very low EAR for a closed eye', () => {
    // Simulate a closed eye (minimal vertical distance)
    const eyeLandmarks: Point[] = [
      { x: 0, y: 0.5 },     // outer corner
      { x: 0.25, y: 0.49 }, // top-outer (almost at center)
      { x: 0.5, y: 0.49 },  // top-inner (almost at center)
      { x: 0.75, y: 0.5 },  // inner corner
      { x: 0.5, y: 0.51 },  // bottom-inner (almost at center)
      { x: 0.25, y: 0.51 }  // bottom-outer (almost at center)
    ];
    
    const ear = computeEyeAspectRatio(eyeLandmarks);
    
    // For a closed eye, EAR should be very low (below blink threshold of 0.21)
    expect(ear).toBeLessThan(0.1);
  });

  it('should throw error if not exactly 6 landmarks provided', () => {
    const invalidLandmarks: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
    
    expect(() => computeEyeAspectRatio(invalidLandmarks)).toThrow(
      'computeEyeAspectRatio requires exactly 6 eye landmarks'
    );
  });

  it('should handle zero horizontal distance gracefully', () => {
    // Outer and inner corners at same position (degenerate case)
    const eyeLandmarks: Point[] = [
      { x: 0.5, y: 0.5 },  // outer corner
      { x: 0.5, y: 0.4 },  // top-outer
      { x: 0.5, y: 0.4 },  // top-inner
      { x: 0.5, y: 0.5 },  // inner corner (same as outer)
      { x: 0.5, y: 0.6 },  // bottom-inner
      { x: 0.5, y: 0.6 }   // bottom-outer
    ];
    
    const ear = computeEyeAspectRatio(eyeLandmarks);
    
    // Should return 0 to avoid division by zero
    expect(ear).toBe(0);
  });

  it('should handle 3D points with z coordinate', () => {
    const eyeLandmarks: Point[] = [
      { x: 0, y: 0.5, z: 0 },
      { x: 0.25, y: 0.3, z: 0.1 },
      { x: 0.5, y: 0.3, z: 0.1 },
      { x: 0.75, y: 0.5, z: 0 },
      { x: 0.5, y: 0.7, z: -0.1 },
      { x: 0.25, y: 0.7, z: -0.1 }
    ];
    
    const ear = computeEyeAspectRatio(eyeLandmarks);
    
    // Should calculate distance including z coordinate
    expect(ear).toBeGreaterThan(0);
    expect(ear).toBeLessThan(1);
  });
});

describe('calculateEAR', () => {
  // Helper to create mock face landmarks (468 points)
  function createMockFaceLandmarks(): Point[] {
    const landmarks: Point[] = [];
    for (let i = 0; i < 468; i++) {
      landmarks.push({ x: Math.random(), y: Math.random() });
    }
    return landmarks;
  }

  it('should calculate average EAR from face landmarks', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Set specific values for left eye landmarks (open eye)
    LEFT_EYE_INDICES.forEach((idx, i) => {
      const openEyePositions = [
        { x: 0.3, y: 0.4 },   // outer corner
        { x: 0.35, y: 0.35 }, // top-outer
        { x: 0.4, y: 0.35 },  // top-inner
        { x: 0.45, y: 0.4 },  // inner corner
        { x: 0.4, y: 0.45 },  // bottom-inner
        { x: 0.35, y: 0.45 }  // bottom-outer
      ];
      landmarks[idx] = openEyePositions[i];
    });
    
    // Set specific values for right eye landmarks (open eye)
    RIGHT_EYE_INDICES.forEach((idx, i) => {
      const openEyePositions = [
        { x: 0.55, y: 0.4 },  // outer corner
        { x: 0.6, y: 0.35 },  // top-outer
        { x: 0.65, y: 0.35 }, // top-inner
        { x: 0.7, y: 0.4 },   // inner corner
        { x: 0.65, y: 0.45 }, // bottom-inner
        { x: 0.6, y: 0.45 }   // bottom-outer
      ];
      landmarks[idx] = openEyePositions[i];
    });
    
    const ear = calculateEAR(landmarks);
    
    // Should return average EAR for both eyes
    expect(ear).toBeGreaterThan(0.2);
    expect(ear).toBeLessThan(0.8);
  });

  it('should detect blink when both eyes are closed', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Set left eye to closed position
    LEFT_EYE_INDICES.forEach((idx, i) => {
      const closedEyePositions = [
        { x: 0.3, y: 0.4 },    // outer corner
        { x: 0.35, y: 0.399 }, // top-outer (almost closed)
        { x: 0.4, y: 0.399 },  // top-inner (almost closed)
        { x: 0.45, y: 0.4 },   // inner corner
        { x: 0.4, y: 0.401 },  // bottom-inner (almost closed)
        { x: 0.35, y: 0.401 }  // bottom-outer (almost closed)
      ];
      landmarks[idx] = closedEyePositions[i];
    });
    
    // Set right eye to closed position
    RIGHT_EYE_INDICES.forEach((idx, i) => {
      const closedEyePositions = [
        { x: 0.55, y: 0.4 },   // outer corner
        { x: 0.6, y: 0.399 },  // top-outer (almost closed)
        { x: 0.65, y: 0.399 }, // top-inner (almost closed)
        { x: 0.7, y: 0.4 },    // inner corner
        { x: 0.65, y: 0.401 }, // bottom-inner (almost closed)
        { x: 0.6, y: 0.401 }   // bottom-outer (almost closed)
      ];
      landmarks[idx] = closedEyePositions[i];
    });
    
    const ear = calculateEAR(landmarks);
    
    // EAR should be below blink threshold (0.21)
    expect(ear).toBeLessThan(0.21);
  });

  it('should throw error if less than 468 landmarks provided', () => {
    const invalidLandmarks: Point[] = Array(100).fill({ x: 0, y: 0 });
    
    expect(() => calculateEAR(invalidLandmarks)).toThrow(
      'calculateEAR requires 468 face landmarks from MediaPipe Face Mesh'
    );
  });

  it('should handle asymmetric eyes (one open, one closed)', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Set left eye to open position
    LEFT_EYE_INDICES.forEach((idx, i) => {
      const openEyePositions = [
        { x: 0.3, y: 0.4 },
        { x: 0.35, y: 0.35 },
        { x: 0.4, y: 0.35 },
        { x: 0.45, y: 0.4 },
        { x: 0.4, y: 0.45 },
        { x: 0.35, y: 0.45 }
      ];
      landmarks[idx] = openEyePositions[i];
    });
    
    // Set right eye to closed position
    RIGHT_EYE_INDICES.forEach((idx, i) => {
      const closedEyePositions = [
        { x: 0.55, y: 0.4 },
        { x: 0.6, y: 0.399 },
        { x: 0.65, y: 0.399 },
        { x: 0.7, y: 0.4 },
        { x: 0.65, y: 0.401 },
        { x: 0.6, y: 0.401 }
      ];
      landmarks[idx] = closedEyePositions[i];
    });
    
    const ear = calculateEAR(landmarks);
    
    // Average should be between open and closed values
    expect(ear).toBeGreaterThan(0.05);
    expect(ear).toBeLessThan(0.4);
  });
});

describe('detectBlink', () => {
  it('should detect blink when EAR is below default threshold (0.21)', () => {
    expect(detectBlink(0.20)).toBe(true);
    expect(detectBlink(0.15)).toBe(true);
    expect(detectBlink(0.10)).toBe(true);
    expect(detectBlink(0.05)).toBe(true);
  });

  it('should not detect blink when EAR is at or above default threshold (0.21)', () => {
    expect(detectBlink(0.21)).toBe(false);
    expect(detectBlink(0.25)).toBe(false);
    expect(detectBlink(0.30)).toBe(false);
    expect(detectBlink(0.35)).toBe(false);
  });

  it('should use custom threshold when provided', () => {
    const customThreshold = 0.25;
    
    // Below custom threshold
    expect(detectBlink(0.24, customThreshold)).toBe(true);
    expect(detectBlink(0.20, customThreshold)).toBe(true);
    
    // At or above custom threshold
    expect(detectBlink(0.25, customThreshold)).toBe(false);
    expect(detectBlink(0.30, customThreshold)).toBe(false);
  });

  it('should handle edge case of EAR exactly at threshold', () => {
    const threshold = 0.21;
    expect(detectBlink(threshold, threshold)).toBe(false);
  });

  it('should handle very low EAR values (fully closed eye)', () => {
    expect(detectBlink(0.01)).toBe(true);
    expect(detectBlink(0.001)).toBe(true);
    expect(detectBlink(0)).toBe(true);
  });

  it('should handle very high EAR values (wide open eye)', () => {
    expect(detectBlink(0.5)).toBe(false);
    expect(detectBlink(0.8)).toBe(false);
    expect(detectBlink(1.0)).toBe(false);
  });

  it('should work with EAR values from calculateEAR', () => {
    const landmarks = Array(468).fill(null).map(() => ({ x: Math.random(), y: Math.random() }));
    
    // Set eyes to closed position (low EAR)
    LEFT_EYE_INDICES.forEach((idx, i) => {
      const closedPositions = [
        { x: 0.3, y: 0.4 },
        { x: 0.35, y: 0.399 },
        { x: 0.4, y: 0.399 },
        { x: 0.45, y: 0.4 },
        { x: 0.4, y: 0.401 },
        { x: 0.35, y: 0.401 }
      ];
      landmarks[idx] = closedPositions[i];
    });
    
    RIGHT_EYE_INDICES.forEach((idx, i) => {
      const closedPositions = [
        { x: 0.55, y: 0.4 },
        { x: 0.6, y: 0.399 },
        { x: 0.65, y: 0.399 },
        { x: 0.7, y: 0.4 },
        { x: 0.65, y: 0.401 },
        { x: 0.6, y: 0.401 }
      ];
      landmarks[idx] = closedPositions[i];
    });
    
    const ear = calculateEAR(landmarks);
    expect(detectBlink(ear)).toBe(true);
  });
});

describe('estimateFaceDistance', () => {
  it('should return 0 for empty landmarks array', () => {
    const distance = estimateFaceDistance([]);
    expect(distance).toBe(0);
  });

  it('should calculate distance for a small face (far from camera)', () => {
    // Small bounding box (0.2 x 0.2)
    const landmarks: Point[] = [
      { x: 0.4, y: 0.4 },  // min corner
      { x: 0.6, y: 0.4 },  // max x
      { x: 0.4, y: 0.6 },  // max y
      { x: 0.6, y: 0.6 }   // max corner
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Small face = far away = lower distance value
    // Diagonal = sqrt(0.2^2 + 0.2^2) = sqrt(0.08) ≈ 0.283
    // Normalized = 0.283 / sqrt(2) ≈ 0.2
    expect(distance).toBeGreaterThan(0.15);
    expect(distance).toBeLessThan(0.25);
  });

  it('should calculate distance for a large face (close to camera)', () => {
    // Large bounding box (0.8 x 0.8)
    const landmarks: Point[] = [
      { x: 0.1, y: 0.1 },  // min corner
      { x: 0.9, y: 0.1 },  // max x
      { x: 0.1, y: 0.9 },  // max y
      { x: 0.9, y: 0.9 }   // max corner
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Large face = close = higher distance value
    // Diagonal = sqrt(0.8^2 + 0.8^2) = sqrt(1.28) ≈ 1.131
    // Normalized = 1.131 / sqrt(2) ≈ 0.8
    expect(distance).toBeGreaterThan(0.75);
    expect(distance).toBeLessThan(0.85);
  });

  it('should calculate distance for a medium face', () => {
    // Medium bounding box (0.5 x 0.5)
    const landmarks: Point[] = [
      { x: 0.25, y: 0.25 },
      { x: 0.75, y: 0.25 },
      { x: 0.25, y: 0.75 },
      { x: 0.75, y: 0.75 }
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Medium face = medium distance
    // Diagonal = sqrt(0.5^2 + 0.5^2) = sqrt(0.5) ≈ 0.707
    // Normalized = 0.707 / sqrt(2) = 0.5
    expect(distance).toBeGreaterThan(0.45);
    expect(distance).toBeLessThan(0.55);
  });

  it('should return maximum value (1.0) for full frame face', () => {
    // Face fills entire frame (1.0 x 1.0)
    const landmarks: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Maximum diagonal = sqrt(2)
    // Normalized = sqrt(2) / sqrt(2) = 1.0
    expect(distance).toBeCloseTo(1.0, 5);
  });

  it('should handle single point (zero-size bounding box)', () => {
    const landmarks: Point[] = [
      { x: 0.5, y: 0.5 }
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Zero-size bounding box = 0 distance
    expect(distance).toBe(0);
  });

  it('should handle rectangular bounding box (non-square)', () => {
    // Wide but short face (0.8 x 0.3)
    const landmarks: Point[] = [
      { x: 0.1, y: 0.35 },
      { x: 0.9, y: 0.35 },
      { x: 0.1, y: 0.65 },
      { x: 0.9, y: 0.65 }
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Diagonal = sqrt(0.8^2 + 0.3^2) = sqrt(0.73) ≈ 0.854
    // Normalized = 0.854 / sqrt(2) ≈ 0.604
    expect(distance).toBeGreaterThan(0.55);
    expect(distance).toBeLessThan(0.65);
  });

  it('should handle landmarks with z coordinate', () => {
    // Z coordinate should be ignored for bounding box calculation
    const landmarks: Point[] = [
      { x: 0.3, y: 0.3, z: 0.5 },
      { x: 0.7, y: 0.3, z: -0.5 },
      { x: 0.3, y: 0.7, z: 0.2 },
      { x: 0.7, y: 0.7, z: -0.2 }
    ];
    
    const distance = estimateFaceDistance(landmarks);
    
    // Should only use x and y for bounding box
    // Diagonal = sqrt(0.4^2 + 0.4^2) ≈ 0.566
    // Normalized ≈ 0.4
    expect(distance).toBeGreaterThan(0.35);
    expect(distance).toBeLessThan(0.45);
  });

  it('should handle realistic MediaPipe face landmarks', () => {
    // Create mock face landmarks with realistic distribution
    const landmarks: Point[] = [];
    
    // Simulate a face centered at (0.5, 0.5) with size 0.6 x 0.6
    for (let i = 0; i < 468; i++) {
      // Random points within face region
      landmarks.push({
        x: 0.2 + Math.random() * 0.6,
        y: 0.2 + Math.random() * 0.6
      });
    }
    
    const distance = estimateFaceDistance(landmarks);
    
    // Should return a reasonable distance value
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(1);
  });

  it('should return larger value for closer face compared to farther face', () => {
    // Close face (large bounding box)
    const closeLandmarks: Point[] = [
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.9 }
    ];
    
    // Far face (small bounding box)
    const farLandmarks: Point[] = [
      { x: 0.4, y: 0.4 },
      { x: 0.6, y: 0.6 }
    ];
    
    const closeDistance = estimateFaceDistance(closeLandmarks);
    const farDistance = estimateFaceDistance(farLandmarks);
    
    // Closer face should have larger distance value
    expect(closeDistance).toBeGreaterThan(farDistance);
  });
});

describe('calculateHeadPosition', () => {
  // Helper to create mock face landmarks (468 points)
  function createMockFaceLandmarks(): Point[] {
    const landmarks: Point[] = [];
    for (let i = 0; i < 468; i++) {
      landmarks.push({ x: Math.random(), y: Math.random() });
    }
    return landmarks;
  }

  it('should return nose tip coordinates (landmark 1)', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Set nose tip to specific position
    landmarks[1] = { x: 0.5, y: 0.6 };
    
    const headPosition = calculateHeadPosition(landmarks);
    
    expect(headPosition.x).toBe(0.5);
    expect(headPosition.y).toBe(0.6);
  });

  it('should track head movement when nose tip moves', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Initial position
    landmarks[1] = { x: 0.5, y: 0.5 };
    const position1 = calculateHeadPosition(landmarks);
    
    // Move head to the right
    landmarks[1] = { x: 0.6, y: 0.5 };
    const position2 = calculateHeadPosition(landmarks);
    
    // Move head up
    landmarks[1] = { x: 0.6, y: 0.4 };
    const position3 = calculateHeadPosition(landmarks);
    
    expect(position1.x).toBe(0.5);
    expect(position1.y).toBe(0.5);
    
    expect(position2.x).toBe(0.6);
    expect(position2.y).toBe(0.5);
    
    expect(position3.x).toBe(0.6);
    expect(position3.y).toBe(0.4);
  });

  it('should handle nose tip at frame boundaries', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Top-left corner
    landmarks[1] = { x: 0, y: 0 };
    const topLeft = calculateHeadPosition(landmarks);
    expect(topLeft.x).toBe(0);
    expect(topLeft.y).toBe(0);
    
    // Bottom-right corner
    landmarks[1] = { x: 1, y: 1 };
    const bottomRight = calculateHeadPosition(landmarks);
    expect(bottomRight.x).toBe(1);
    expect(bottomRight.y).toBe(1);
    
    // Center
    landmarks[1] = { x: 0.5, y: 0.5 };
    const center = calculateHeadPosition(landmarks);
    expect(center.x).toBe(0.5);
    expect(center.y).toBe(0.5);
  });

  it('should handle nose tip with z coordinate', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Set nose tip with z coordinate
    landmarks[1] = { x: 0.5, y: 0.6, z: 0.2 };
    
    const headPosition = calculateHeadPosition(landmarks);
    
    // Should only return x and y coordinates
    expect(headPosition.x).toBe(0.5);
    expect(headPosition.y).toBe(0.6);
    expect(headPosition).not.toHaveProperty('z');
  });

  it('should throw error if less than 468 landmarks provided', () => {
    const invalidLandmarks: Point[] = Array(100).fill({ x: 0, y: 0 });
    
    expect(() => calculateHeadPosition(invalidLandmarks)).toThrow(
      'calculateHeadPosition requires 468 face landmarks from MediaPipe Face Mesh'
    );
  });

  it('should work with exactly 468 landmarks', () => {
    const landmarks = createMockFaceLandmarks();
    landmarks[1] = { x: 0.45, y: 0.55 };
    
    expect(() => calculateHeadPosition(landmarks)).not.toThrow();
    
    const position = calculateHeadPosition(landmarks);
    expect(position.x).toBe(0.45);
    expect(position.y).toBe(0.55);
  });

  it('should calculate head movement distance between frames', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Frame 1: head at center
    landmarks[1] = { x: 0.5, y: 0.5 };
    const pos1 = calculateHeadPosition(landmarks);
    
    // Frame 2: head moved slightly
    landmarks[1] = { x: 0.52, y: 0.51 };
    const pos2 = calculateHeadPosition(landmarks);
    
    // Calculate movement distance
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeCloseTo(Math.sqrt(0.02 * 0.02 + 0.01 * 0.01), 5);
  });

  it('should handle rapid head movements', () => {
    const landmarks = createMockFaceLandmarks();
    const positions: { x: number; y: number }[] = [];
    
    // Simulate rapid head movements
    const movements = [
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.5 },
      { x: 0.6, y: 0.6 },
      { x: 0.4, y: 0.6 },
      { x: 0.4, y: 0.4 },
      { x: 0.5, y: 0.5 }
    ];
    
    movements.forEach(movement => {
      landmarks[1] = movement;
      positions.push(calculateHeadPosition(landmarks));
    });
    
    // Verify all positions were tracked correctly
    expect(positions).toHaveLength(6);
    positions.forEach((pos, i) => {
      expect(pos.x).toBe(movements[i].x);
      expect(pos.y).toBe(movements[i].y);
    });
  });

  it('should return normalized coordinates (0-1 range)', () => {
    const landmarks = createMockFaceLandmarks();
    
    // Test various positions
    const testPositions = [
      { x: 0, y: 0 },
      { x: 0.25, y: 0.25 },
      { x: 0.5, y: 0.5 },
      { x: 0.75, y: 0.75 },
      { x: 1, y: 1 }
    ];
    
    testPositions.forEach(testPos => {
      landmarks[1] = testPos;
      const position = calculateHeadPosition(landmarks);
      
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThanOrEqual(1);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThanOrEqual(1);
    });
  });

  it('should be independent of other landmarks', () => {
    const landmarks1 = createMockFaceLandmarks();
    const landmarks2 = createMockFaceLandmarks();
    
    // Set same nose tip position but different other landmarks
    landmarks1[1] = { x: 0.5, y: 0.6 };
    landmarks2[1] = { x: 0.5, y: 0.6 };
    
    const pos1 = calculateHeadPosition(landmarks1);
    const pos2 = calculateHeadPosition(landmarks2);
    
    // Should return same position regardless of other landmarks
    expect(pos1.x).toBe(pos2.x);
    expect(pos1.y).toBe(pos2.y);
  });
});
