/**
 * Insight Generator
 * Generates dynamic behavioral insights based on collected assessment metrics
 * Requirements: 7.4, 7.5, 7.6, 7.7, 7.8
 */

import type { AssessmentData } from '../types';
import { PHASE_BOUNDARIES, VARIANCE_THRESHOLDS, INSIGHT_THRESHOLDS } from '../constants';

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
 * Calculate head movement variance
 */
function calculateMovementVariance(movements: { x: number; y: number }[]): number {
  if (movements.length < 2) return 0;
  
  let totalMovement = 0;
  for (let i = 1; i < movements.length; i++) {
    const dx = movements[i].x - movements[i - 1].x;
    const dy = movements[i].y - movements[i - 1].y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }
  
  return totalMovement / (movements.length - 1);
}

/**
 * Generate behavioral insights from assessment data
 * Returns 2-4 most relevant insights based on detected patterns
 * Requirements: 7.4, 7.5, 7.6, 7.7, 7.8
 */
export function generateInsights(data: AssessmentData): string[] {
  const insights: string[] = [];
  
  // Analyze blink patterns by phase
  // Requirement 7.5: Detect decreased blink rate during smaller text
  const blinksByPhase = {
    phase1: data.blinkEvents.filter(t => t < PHASE_BOUNDARIES.PHASE_1_END).length,
    phase2: data.blinkEvents.filter(t => t >= PHASE_BOUNDARIES.PHASE_1_END && t < PHASE_BOUNDARIES.PHASE_2_END).length,
    phase3: data.blinkEvents.filter(t => t >= PHASE_BOUNDARIES.PHASE_2_END).length
  };
  
  if (blinksByPhase.phase3 < blinksByPhase.phase1 * INSIGHT_THRESHOLDS.BLINK_DECREASE_RATIO) {
    insights.push("Blink rate decreased during smaller text exposure.");
  }
  
  // Analyze distance changes between phases
  // Requirement 7.6: Detect viewing distance reduction under visual demand
  // Assuming 30 FPS, each phase has ~300 frames
  const framesPerSecond = data.faceDistances.length / PHASE_BOUNDARIES.ASSESSMENT_DURATION;
  const phase1Frames = Math.floor(PHASE_BOUNDARIES.PHASE_1_END * framesPerSecond);
  const phase3StartFrame = Math.floor(PHASE_BOUNDARIES.PHASE_2_END * framesPerSecond);
  
  const avgDistancePhase1 = average(data.faceDistances.slice(0, phase1Frames));
  const avgDistancePhase3 = average(data.faceDistances.slice(phase3StartFrame));
  
  if (avgDistancePhase3 > avgDistancePhase1 * INSIGHT_THRESHOLDS.DISTANCE_INCREASE_RATIO) {
    insights.push("Viewing distance reduced under increased visual demand.");
  }
  
  // Analyze sustained focus
  // Requirement 7.7: Detect sustained focus without blink recovery
  const earVariance = calculateVariance(data.earValues);
  if (earVariance < VARIANCE_THRESHOLDS.EAR_LOW) {
    insights.push("Sustained focus without blink recovery detected.");
  }
  
  // Analyze head movement patterns
  // Detect increased head movement/restlessness
  const headMovementVariance = calculateMovementVariance(data.headMovements);
  if (headMovementVariance > VARIANCE_THRESHOLDS.HEAD_MOVEMENT_HIGH) {
    insights.push("Increased head movement observed during reading task.");
  }
  
  // Return 2-4 most relevant insights
  // Requirement 7.8: Display 2-4 behavioral insights
  return insights.slice(0, 4);
}
