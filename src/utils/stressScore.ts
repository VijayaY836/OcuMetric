/**
 * Stress Score Calculator
 * Analyzes collected assessment metrics and computes a 0-100 stress score
 * Requirements: 6.1, 6.2
 */

import type { AssessmentData } from '../types';
import { STRESS_WEIGHTS, BLINK_RATE_THRESHOLDS, PHASE_BOUNDARIES } from '../constants';

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
 * Normalize blink frequency to 0-1 stress score
 * Low blink rate indicates stress (dry eyes, sustained focus)
 * Requirements: 6.2
 */
export function normalizeBlinkFrequency(blinkEvents: number[]): number {
  const blinkRate = blinkEvents.length / PHASE_BOUNDARIES.ASSESSMENT_DURATION;
  
  // Normal: 15-20 blinks/min (0.25-0.33 blinks/sec)
  // Low blink rate indicates stress
  if (blinkRate < BLINK_RATE_THRESHOLDS.LOW) return 0.8; // High stress
  if (blinkRate > BLINK_RATE_THRESHOLDS.HIGH) return 0.3; // Low stress
  
  // Linear interpolation between thresholds
  const range = BLINK_RATE_THRESHOLDS.HIGH - BLINK_RATE_THRESHOLDS.LOW;
  const normalized = (blinkRate - BLINK_RATE_THRESHOLDS.LOW) / range;
  return 0.8 - (normalized * 0.5); // Map 0.25-0.5 to 0.8-0.3
}

/**
 * Normalize EAR (Eye Aspect Ratio) variance to 0-1 stress score
 * Higher variance indicates more blinks and eye movement (lower stress)
 * Lower variance indicates sustained stare (higher stress)
 * Requirements: 6.2
 */
export function normalizeEARVariance(earValues: number[]): number {
  const variance = calculateVariance(earValues);
  
  // Higher variance = more eye activity = lower stress
  // Lower variance = sustained stare = higher stress
  return 1 - Math.min(variance * 10, 1);
}

/**
 * Normalize face distance variance to 0-1 stress score
 * Higher variance indicates distance changes (higher stress/restlessness)
 * Requirements: 6.2
 */
export function normalizeFaceDistanceVariance(distances: number[]): number {
  const variance = calculateVariance(distances);
  
  // Higher variance = more distance changes = higher stress
  return Math.min(variance * 5, 1);
}

/**
 * Normalize head movement to 0-1 stress score
 * Higher movement indicates restlessness (higher stress)
 * Requirements: 6.2
 */
export function normalizeHeadMovement(movements: { x: number; y: number }[]): number {
  if (movements.length < 2) return 0;
  
  let totalMovement = 0;
  for (let i = 1; i < movements.length; i++) {
    const dx = movements[i].x - movements[i - 1].x;
    const dy = movements[i].y - movements[i - 1].y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }
  
  // Average movement per frame
  const avgMovement = totalMovement / (movements.length - 1);
  
  // Higher movement = higher stress
  return Math.min(avgMovement * 100, 1);
}

/**
 * Calculate stress score from assessment data
 * Returns a value between 0 and 100
 * Requirements: 6.1, 6.2
 */
export function calculateStressScore(data: AssessmentData): number {
  // Normalize each metric to 0-1 range
  const blinkScore = normalizeBlinkFrequency(data.blinkEvents);
  const earScore = normalizeEARVariance(data.earValues);
  const distanceScore = normalizeFaceDistanceVariance(data.faceDistances);
  const movementScore = normalizeHeadMovement(data.headMovements);
  
  // Apply weighted combination
  const rawScore = 
    blinkScore * STRESS_WEIGHTS.BLINK +
    earScore * STRESS_WEIGHTS.EAR +
    distanceScore * STRESS_WEIGHTS.DISTANCE +
    movementScore * STRESS_WEIGHTS.MOVEMENT;
  
  // Scale to 0-100 and round
  return Math.round(rawScore * 100);
}
