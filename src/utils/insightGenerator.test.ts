/**
 * Unit tests for Insight Generator
 * Tests insight generation logic for various assessment patterns
 */

import { describe, it, expect } from 'vitest';
import { generateInsights } from './insightGenerator';
import type { AssessmentData } from '../types';

describe('generateInsights', () => {
  // Helper to create assessment data with specific patterns
  const createAssessmentData = (overrides?: Partial<AssessmentData>): AssessmentData => {
    return {
      startTime: Date.now(),
      blinkEvents: [],
      earValues: Array(900).fill(0.25), // 30 seconds at 30 FPS
      faceDistances: Array(900).fill(0.5),
      headMovements: Array(900).fill({ x: 0.5, y: 0.5 }),
      ...overrides
    };
  };

  it('should return an array of insights', () => {
    const data = createAssessmentData();
    const insights = generateInsights(data);
    
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should return 2-4 insights maximum', () => {
    const data = createAssessmentData({
      blinkEvents: [1, 2, 3, 4, 5, 6, 7, 8, 9], // 9 blinks in phase 1, 0 in phase 3
      earValues: Array(900).fill(0.25), // Low variance
      faceDistances: Array(900).fill(0.5).map((_, i) => i < 300 ? 0.4 : 0.6), // Distance change
      headMovements: Array(900).fill(0).map((_, i) => ({ x: i * 0.001, y: i * 0.001 })) // High movement
    });
    
    const insights = generateInsights(data);
    
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(insights.length).toBeLessThanOrEqual(4);
  });

  it('should detect decreased blink rate during smaller text (phase 3 < 50% of phase 1)', () => {
    const data = createAssessmentData({
      blinkEvents: [1, 2, 3, 4, 5, 6, 7, 8] // 8 blinks in phase 1 (0-10s), 0 in phase 3 (20-30s)
    });
    
    const insights = generateInsights(data);
    
    expect(insights).toContain("Blink rate decreased during smaller text exposure.");
  });

  it('should not detect blink decrease when phase 3 has sufficient blinks', () => {
    const data = createAssessmentData({
      blinkEvents: [1, 2, 3, 4, 21, 22, 23, 24] // 4 blinks in phase 1, 4 in phase 3
    });
    
    const insights = generateInsights(data);
    
    expect(insights).not.toContain("Blink rate decreased during smaller text exposure.");
  });

  it('should detect viewing distance reduction (phase 3 > 115% of phase 1)', () => {
    // Create distance array where phase 3 is significantly higher than phase 1
    const distances = Array(900).fill(0).map((_, i) => {
      if (i < 300) return 0.4; // Phase 1: closer (lower value)
      if (i >= 600) return 0.5; // Phase 3: farther (higher value = closer to camera)
      return 0.45; // Phase 2: transition
    });
    
    const data = createAssessmentData({
      faceDistances: distances
    });
    
    const insights = generateInsights(data);
    
    expect(insights).toContain("Viewing distance reduced under increased visual demand.");
  });

  it('should not detect distance change when distance is stable', () => {
    const data = createAssessmentData({
      faceDistances: Array(900).fill(0.5) // Constant distance
    });
    
    const insights = generateInsights(data);
    
    expect(insights).not.toContain("Viewing distance reduced under increased visual demand.");
  });

  it('should detect sustained focus without blink recovery (EAR variance < 0.01)', () => {
    const data = createAssessmentData({
      earValues: Array(900).fill(0.25) // Very low variance
    });
    
    const insights = generateInsights(data);
    
    expect(insights).toContain("Sustained focus without blink recovery detected.");
  });

  it('should not detect sustained focus when EAR variance is high', () => {
    // Create EAR values with high variance (simulating frequent blinks)
    const earValues = Array(900).fill(0).map((_, i) => {
      return i % 50 < 10 ? 0.05 : 0.4; // More frequent, larger blinks
    });
    
    const data = createAssessmentData({
      earValues
    });
    
    const insights = generateInsights(data);
    
    expect(insights).not.toContain("Sustained focus without blink recovery detected.");
  });

  it('should detect increased head movement during reading', () => {
    // Create head movements with high variance (very large movements)
    const headMovements = Array(900).fill(0).map((_, i) => ({
      x: 0.5 + (i % 2 === 0 ? 0.3 : -0.3), // Large alternating movements
      y: 0.5 + (i % 3 === 0 ? 0.3 : -0.3)
    }));
    
    const data = createAssessmentData({
      headMovements
    });
    
    const insights = generateInsights(data);
    
    expect(insights).toContain("Increased head movement observed during reading task.");
  });

  it('should not detect head movement when head is stable', () => {
    const data = createAssessmentData({
      headMovements: Array(900).fill({ x: 0.5, y: 0.5 }) // Stable head position
    });
    
    const insights = generateInsights(data);
    
    expect(insights).not.toContain("Increased head movement observed during reading task.");
  });

  it('should handle empty blink events', () => {
    const data = createAssessmentData({
      blinkEvents: []
    });
    
    const insights = generateInsights(data);
    
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should handle edge case with minimal data', () => {
    const data = createAssessmentData({
      earValues: [0.25],
      faceDistances: [0.5],
      headMovements: [{ x: 0.5, y: 0.5 }]
    });
    
    const insights = generateInsights(data);
    
    expect(Array.isArray(insights)).toBe(true);
  });

  it('should generate multiple insights when multiple patterns are detected', () => {
    const data = createAssessmentData({
      blinkEvents: [1, 2, 3, 4, 5, 6, 7, 8], // Blinks only in phase 1
      earValues: Array(900).fill(0.25), // Low variance
      faceDistances: Array(900).fill(0).map((_, i) => i < 300 ? 0.4 : 0.5), // Distance change
      headMovements: Array(900).fill(0).map((_, i) => ({
        x: 0.5 + (i % 2 === 0 ? 0.3 : -0.3),
        y: 0.5 + (i % 3 === 0 ? 0.3 : -0.3)
      })) // High movement
    });
    
    const insights = generateInsights(data);
    
    expect(insights.length).toBeGreaterThan(1);
    expect(insights.length).toBeLessThanOrEqual(4);
  });
});
