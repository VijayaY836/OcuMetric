/**
 * Unit tests for Suggestion Generator
 * Tests suggestion generation based on stress score and metrics
 */

import { describe, it, expect } from 'vitest';
import { generateSuggestions } from './suggestionGenerator';
import type { AssessmentData } from '../types';

describe('generateSuggestions', () => {
  // Helper to create mock assessment data
  const createMockData = (overrides?: Partial<AssessmentData>): AssessmentData => ({
    startTime: Date.now(),
    blinkEvents: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], // 10 blinks in 30s = 0.33 blinks/s
    earValues: Array(900).fill(0).map((_, i) => 0.25 + Math.sin(i / 10) * 0.05),
    faceDistances: Array(900).fill(0.5),
    headMovements: Array(900).fill(0).map(() => ({ x: 0.5, y: 0.5 })),
    ...overrides
  });

  it('should return 3-5 suggestions', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions.length).toBeGreaterThanOrEqual(3);
    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it('should suggest increasing font size for high stress (score > 66)', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 70);
    
    expect(suggestions).toContain("Increase reading font size to reduce visual strain.");
  });

  it('should not suggest font size increase for low stress', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 30);
    
    expect(suggestions).not.toContain("Increase reading font size to reduce visual strain.");
  });

  it('should suggest maintaining viewing distance when too close (avgDistance > 0.7)', () => {
    const data = createMockData({
      faceDistances: Array(900).fill(0.8) // Too close
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).toContain("Maintain 40–60 cm viewing distance for optimal comfort.");
  });

  it('should suggest maintaining viewing distance when distance is inconsistent (high variance)', () => {
    const data = createMockData({
      faceDistances: Array(900).fill(0).map((_, i) => 0.5 + (i % 2 === 0 ? 0.3 : -0.3)) // High variance
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).toContain("Maintain 40–60 cm viewing distance for optimal comfort.");
  });

  it('should suggest blink breaks for low blink rate (< 0.25 blinks/s)', () => {
    const data = createMockData({
      blinkEvents: [5, 10, 15, 20, 25] // 5 blinks in 30s = 0.167 blinks/s
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).toContain("Use regular blink breaks to prevent dry eyes.");
  });

  it('should not suggest blink breaks for normal blink rate', () => {
    const data = createMockData({
      blinkEvents: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] // 10 blinks in 30s = 0.33 blinks/s
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).not.toContain("Use regular blink breaks to prevent dry eyes.");
  });

  it('should suggest dyslexic mode for moderate to high stress (score > 50)', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 55);
    
    expect(suggestions).toContain("Enable dyslexic mode if reading difficulty detected.");
  });

  it('should not suggest dyslexic mode for low stress', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 40);
    
    expect(suggestions).not.toContain("Enable dyslexic mode if reading difficulty detected.");
  });

  it('should suggest periodic breaks for low EAR variance (< 0.01)', () => {
    const data = createMockData({
      earValues: Array(900).fill(0.25) // Very low variance (sustained stare)
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).toContain("Take periodic breaks to reduce sustained visual focus.");
  });

  it('should not suggest periodic breaks for high EAR variance (frequent blinking)', () => {
    // Create EAR values with very frequent, large blinks (high variance)
    // Alternate between wide open (0.35) and closed (0.10) frequently
    const earValues = Array(900).fill(0).map((_, i) => {
      // Alternate every 10 frames for high variance
      return i % 20 < 10 ? 0.35 : 0.10;
    });
    
    const data = createMockData({ earValues });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).not.toContain("Take periodic breaks to reduce sustained visual focus.");
  });

  it('should return exactly 5 suggestions when all conditions are met', () => {
    const data = createMockData({
      blinkEvents: [5, 10], // Low blink rate
      earValues: Array(900).fill(0.25), // Low variance
      faceDistances: Array(900).fill(0.8) // Too close
    });
    const suggestions = generateSuggestions(data, 70); // High stress
    
    expect(suggestions).toHaveLength(5);
  });

  it('should return suggestions in clinical, calm tone', () => {
    const data = createMockData();
    const suggestions = generateSuggestions(data, 70);
    
    // All suggestions should be practical and informative
    suggestions.forEach(suggestion => {
      expect(suggestion).toBeTruthy();
      expect(suggestion.length).toBeGreaterThan(20); // Meaningful suggestions
      expect(suggestion.endsWith('.')).toBe(true); // Proper punctuation
    });
  });

  it('should handle edge case with no blinks', () => {
    const data = createMockData({
      blinkEvents: []
    });
    const suggestions = generateSuggestions(data, 50);
    
    expect(suggestions).toContain("Use regular blink breaks to prevent dry eyes.");
  });

  it('should handle edge case with empty arrays', () => {
    const data = createMockData({
      blinkEvents: [],
      earValues: [],
      faceDistances: [],
      headMovements: []
    });
    
    // Should not throw error
    expect(() => generateSuggestions(data, 50)).not.toThrow();
  });
});
