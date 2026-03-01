/**
 * Suggestion Generator
 * Generates personalized suggestions based on stress score and assessment metrics
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.7
 */

import type { AssessmentData } from '../types';
import {
  SUGGESTION_THRESHOLDS,
  VARIANCE_THRESHOLDS,
  DISTANCE_THRESHOLDS,
  BLINK_RATE_THRESHOLDS,
  PHASE_BOUNDARIES
} from '../constants';

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate average of an array of numbers
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Generate personalized suggestions based on assessment results
 * Returns 3-5 practical recommendations
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.7
 */
export function generateSuggestions(data: AssessmentData, score: number): string[] {
  const suggestions: string[] = [];
  
  // Requirement 8.2: High stress → suggest increasing font size
  if (score > SUGGESTION_THRESHOLDS.HIGH_STRESS) {
    suggestions.push("Increase reading font size to reduce visual strain.");
  }
  
  // Requirement 8.3: Inconsistent or too close distance → suggest maintaining proper distance
  const avgDistance = average(data.faceDistances);
  const distanceVariance = calculateVariance(data.faceDistances);
  
  if (avgDistance > DISTANCE_THRESHOLDS.TOO_CLOSE || distanceVariance > VARIANCE_THRESHOLDS.DISTANCE_HIGH) {
    suggestions.push("Maintain 40–60 cm viewing distance for optimal comfort.");
  }
  
  // Requirement 8.4: Low blink frequency → suggest blink breaks
  const blinkRate = data.blinkEvents.length / PHASE_BOUNDARIES.ASSESSMENT_DURATION;
  
  if (blinkRate < BLINK_RATE_THRESHOLDS.LOW) {
    suggestions.push("Use regular blink breaks to prevent dry eyes.");
  }
  
  // Requirement 8.5: Reading difficulty patterns → suggest dyslexic mode
  if (score > SUGGESTION_THRESHOLDS.MODERATE_STRESS) {
    suggestions.push("Enable dyslexic mode if reading difficulty detected.");
  }
  
  // Additional suggestion: Low EAR variance indicates sustained focus
  const earVariance = calculateVariance(data.earValues);
  if (earVariance < VARIANCE_THRESHOLDS.EAR_LOW && data.earValues.length > 0) {
    suggestions.push("Take periodic breaks to reduce sustained visual focus.");
  }
  
  // Ensure we always return at least 3 suggestions by adding general recommendations
  if (suggestions.length < 3) {
    const generalSuggestions = [
      "Ensure adequate lighting to reduce eye strain.",
      "Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
      "Adjust screen brightness to match ambient lighting."
    ];
    
    for (const suggestion of generalSuggestions) {
      if (suggestions.length >= 3) break;
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }
  }
  
  // Requirement 8.7: Return 3-5 practical suggestions
  return suggestions.slice(0, 5);
}
