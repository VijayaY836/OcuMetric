/**
 * Integration tests for EyeTracker component
 * 
 * Tests integration with eye tracking utilities
 */

import { describe, it, expect } from 'vitest';
import type { MetricsSnapshot } from '../types';
import {
  calculateEAR,
  detectBlink,
  estimateFaceDistance,
  calculateHeadPosition,
  type Point
} from '../utils/eyeTracking';

describe('EyeTracker Integration', () => {
  it('should calculate metrics from mock landmarks', () => {
    // Create mock face landmarks (468 points)
    const mockLandmarks: Point[] = Array.from({ length: 468 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }));

    // Calculate metrics (same as EyeTracker does)
    const ear = calculateEAR(mockLandmarks);
    const blinkDetected = detectBlink(ear);
    const faceDistance = estimateFaceDistance(mockLandmarks);
    const headPosition = calculateHeadPosition(mockLandmarks);

    // Verify metrics are calculated
    expect(typeof ear).toBe('number');
    expect(typeof blinkDetected).toBe('boolean');
    expect(typeof faceDistance).toBe('number');
    expect(typeof headPosition.x).toBe('number');
    expect(typeof headPosition.y).toBe('number');

    // Verify ranges
    expect(ear).toBeGreaterThanOrEqual(0);
    expect(faceDistance).toBeGreaterThanOrEqual(0);
    expect(faceDistance).toBeLessThanOrEqual(1);
    expect(headPosition.x).toBeGreaterThanOrEqual(0);
    expect(headPosition.x).toBeLessThanOrEqual(1);
    expect(headPosition.y).toBeGreaterThanOrEqual(0);
    expect(headPosition.y).toBeLessThanOrEqual(1);
  });

  it('should create valid MetricsSnapshot structure', () => {
    const mockLandmarks: Point[] = Array.from({ length: 468 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random()
    }));

    const ear = calculateEAR(mockLandmarks);
    const blinkDetected = detectBlink(ear);
    const faceDistance = estimateFaceDistance(mockLandmarks);
    const headPosition = calculateHeadPosition(mockLandmarks);

    const metrics: MetricsSnapshot = {
      timestamp: Date.now(),
      blinkDetected,
      ear,
      faceDistance,
      headPosition
    };

    // Verify structure matches interface
    expect(metrics).toHaveProperty('timestamp');
    expect(metrics).toHaveProperty('blinkDetected');
    expect(metrics).toHaveProperty('ear');
    expect(metrics).toHaveProperty('faceDistance');
    expect(metrics).toHaveProperty('headPosition');
    expect(metrics.headPosition).toHaveProperty('x');
    expect(metrics.headPosition).toHaveProperty('y');
  });

  it('should detect blinks when EAR is low', () => {
    // Create landmarks with closed eyes (small vertical distances)
    const mockLandmarks: Point[] = Array.from({ length: 468 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0
    }));

    // Set specific eye landmarks to simulate closed eyes
    // Left eye indices: 33, 160, 158, 133, 153, 144
    mockLandmarks[33] = { x: 0.3, y: 0.5, z: 0 };  // outer corner
    mockLandmarks[160] = { x: 0.35, y: 0.5, z: 0 }; // top-outer (very close to bottom)
    mockLandmarks[158] = { x: 0.4, y: 0.5, z: 0 };  // top-inner (very close to bottom)
    mockLandmarks[133] = { x: 0.45, y: 0.5, z: 0 }; // inner corner
    mockLandmarks[153] = { x: 0.4, y: 0.5, z: 0 };  // bottom-inner
    mockLandmarks[144] = { x: 0.35, y: 0.5, z: 0 }; // bottom-outer

    const ear = calculateEAR(mockLandmarks);
    const blinkDetected = detectBlink(ear);

    // With closed eyes, EAR should be very low
    expect(ear).toBeLessThan(0.21);
    expect(blinkDetected).toBe(true);
  });

  it('should not detect blinks when EAR is high', () => {
    // Create landmarks with open eyes (large vertical distances)
    const mockLandmarks: Point[] = Array.from({ length: 468 }, () => ({
      x: 0.5,
      y: 0.5,
      z: 0
    }));

    // Set specific eye landmarks to simulate open eyes
    mockLandmarks[33] = { x: 0.3, y: 0.5, z: 0 };   // outer corner
    mockLandmarks[160] = { x: 0.35, y: 0.4, z: 0 }; // top-outer (far from bottom)
    mockLandmarks[158] = { x: 0.4, y: 0.4, z: 0 };  // top-inner (far from bottom)
    mockLandmarks[133] = { x: 0.45, y: 0.5, z: 0 }; // inner corner
    mockLandmarks[153] = { x: 0.4, y: 0.6, z: 0 };  // bottom-inner (far from top)
    mockLandmarks[144] = { x: 0.35, y: 0.6, z: 0 }; // bottom-outer (far from top)

    const ear = calculateEAR(mockLandmarks);
    const blinkDetected = detectBlink(ear);

    // With open eyes, EAR should be higher
    expect(ear).toBeGreaterThan(0.21);
    expect(blinkDetected).toBe(false);
  });
});
