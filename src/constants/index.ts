/**
 * Configuration constants for OcuMetric Reading Test
 * Defines font sizes, animation durations, thresholds, and color codes
 */

/**
 * Font sizes for progressive reading test phases
 * Requirements: 3.2, 3.3, 3.4
 */
export const FONT_SIZES = {
  PHASE_1: '2rem',      // 0-10 seconds: Large font
  PHASE_2: '1.5rem',    // 10-20 seconds: Medium font
  PHASE_3: '1.125rem'   // 20-30 seconds: Smaller font
} as const;

/**
 * Time boundaries for font size phases (in seconds)
 * Requirements: 3.2, 3.3, 3.4
 */
export const PHASE_BOUNDARIES = {
  PHASE_1_END: 10,
  PHASE_2_END: 20,
  ASSESSMENT_DURATION: 30
} as const;

/**
 * Animation durations (in milliseconds)
 * Requirements: 2.6, 3.5
 */
export const ANIMATION_DURATIONS = {
  FONT_TRANSITION: 400,        // Font size transition (300-500ms)
  CAMERA_FADE: 400,            // Camera preview fade (300-500ms)
  GAUGE_ANIMATION: 1500,       // Stress score gauge animation (1-2s)
  SCREEN_TRANSITION: 300       // Screen fade transitions
} as const;

/**
 * Eye Aspect Ratio (EAR) threshold for blink detection
 * Requirements: 5.3
 */
export const EAR_THRESHOLD = 0.21;

/**
 * Stress score classification thresholds
 * Requirements: 6.3, 6.4, 6.5
 */
export const STRESS_THRESHOLDS = {
  LOW_MAX: 35,      // 0-35: Low stress
  MODERATE_MAX: 70  // 36-70: Moderate stress, 71-100: High stress
} as const;

/**
 * Color codes for stress level visualization
 * Requirements: 6.3, 6.4, 6.5
 */
export const STRESS_COLORS = {
  LOW: '#22c55e',       // Green (Tailwind green-500)
  MODERATE: '#eab308',  // Yellow (Tailwind yellow-500)
  HIGH: '#ef4444'       // Red (Tailwind red-500)
} as const;

/**
 * Stress level classification type
 */
export type StressLevel = 'Low' | 'Moderate' | 'High';

/**
 * Get stress level classification from score
 * Requirements: 6.3, 6.4, 6.5
 */
export function getStressLevel(score: number): StressLevel {
  if (score <= STRESS_THRESHOLDS.LOW_MAX) return 'Low';
  if (score <= STRESS_THRESHOLDS.MODERATE_MAX) return 'Moderate';
  return 'High';
}

/**
 * Get color code for stress score
 * Requirements: 6.3, 6.4, 6.5
 */
export function getStressColor(score: number): string {
  if (score <= STRESS_THRESHOLDS.LOW_MAX) return STRESS_COLORS.LOW;
  if (score <= STRESS_THRESHOLDS.MODERATE_MAX) return STRESS_COLORS.MODERATE;
  return STRESS_COLORS.HIGH;
}

/**
 * Dyslexic mode typography settings
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */
export const DYSLEXIC_TYPOGRAPHY = {
  FONT_FAMILY: 'OpenDyslexic, sans-serif',
  LETTER_SPACING: '0.05em',
  LINE_HEIGHT: '1.8',
  FONT_WEIGHT: '500'
} as const;

/**
 * Normal mode typography settings
 */
export const NORMAL_TYPOGRAPHY = {
  FONT_FAMILY: 'Inter, system-ui, sans-serif',
  LETTER_SPACING: 'normal',
  LINE_HEIGHT: '1.6',
  FONT_WEIGHT: '400'
} as const;

/**
 * Stress score calculation weights
 * Requirements: 6.2
 */
export const STRESS_WEIGHTS = {
  BLINK: 0.3,
  EAR: 0.25,
  DISTANCE: 0.25,
  MOVEMENT: 0.2
} as const;

/**
 * Blink rate thresholds (blinks per second)
 * Normal: 15-20 blinks/min = 0.25-0.33 blinks/sec
 */
export const BLINK_RATE_THRESHOLDS = {
  LOW: 0.25,   // Below this indicates stress
  HIGH: 0.5    // Above this indicates low stress
} as const;

/**
 * Variance thresholds for metrics analysis
 */
export const VARIANCE_THRESHOLDS = {
  EAR_LOW: 0.01,           // Low EAR variance indicates sustained stare
  DISTANCE_HIGH: 0.05,     // High distance variance indicates stress
  HEAD_MOVEMENT_HIGH: 0.05 // High head movement indicates restlessness
} as const;

/**
 * Face distance thresholds (normalized 0-1)
 */
export const DISTANCE_THRESHOLDS = {
  TOO_CLOSE: 0.7  // Above this indicates user is too close
} as const;

/**
 * Insight generation thresholds
 */
export const INSIGHT_THRESHOLDS = {
  BLINK_DECREASE_RATIO: 0.5,  // Phase 3 blinks < 50% of Phase 1
  DISTANCE_INCREASE_RATIO: 1.15 // Phase 3 distance > 115% of Phase 1
} as const;

/**
 * Suggestion generation thresholds
 */
export const SUGGESTION_THRESHOLDS = {
  HIGH_STRESS: 66,      // Suggest font size increase
  MODERATE_STRESS: 50   // Suggest dyslexic mode
} as const;

/**
 * Camera and processing settings
 */
export const CAMERA_SETTINGS = {
  FACE_NOT_DETECTED_TIMEOUT: 5000, // Show notification after 5 seconds
  MIN_FPS: 15,                      // Minimum acceptable frame rate
  TARGET_FPS: 30                    // Target frame rate for processing
} as const;
