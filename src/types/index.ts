/**
 * Core TypeScript interfaces for OcuMetric Reading Test
 * Defines data structures for application state, assessment data, metrics, and results
 */

/**
 * Main application state managed by AppContext
 */
export interface AppState {
  currentScreen: 'landing' | 'calibration' | 'assessment' | 'results';
  dyslexicMode: boolean;
  cameraPreviewVisible: boolean;
  assessmentData: AssessmentData | null;
  results: AssessmentResults | null;
}

/**
 * Raw metrics collected during a 30-second assessment
 */
export interface AssessmentData {
  startTime: number;
  blinkEvents: number[]; // Timestamps of blink events
  earValues: number[]; // Eye Aspect Ratio values per frame
  faceDistances: number[]; // Face distance values per frame
  headMovements: { x: number; y: number }[]; // Head position per frame
}

/**
 * Processed results after assessment completion
 */
export interface AssessmentResults {
  stressScore: number;
  classification: 'Low' | 'Moderate' | 'High';
  insights: string[];
  suggestions: string[];
  metrics: {
    baselineBlinkRate: number; // Blinks per minute in phase 1
    testBlinkRate: number; // Blinks per minute overall
    blinkChangePercent: number; // % change during smaller text
    avgDistance: number; // Average viewing distance (0-1)
    distanceTrend: 'Stable' | 'Reduced' | 'Inconsistent';
    focusStability: 'Stable' | 'Moderate' | 'Rigid';
    headMovementVariance: number;
  };
  timestamp: string; // ISO timestamp of completion
}

/**
 * Real-time metrics snapshot from a single frame
 */
export interface MetricsSnapshot {
  timestamp: number;
  blinkDetected: boolean;
  ear: number;
  faceDistance: number;
  headPosition: { x: number; y: number };
}

/**
 * Reading passage content structure
 */
export interface ReadingPassageContent {
  text: string;
  wordCount: number;
  difficulty: 'neutral-academic';
}

/**
 * Default reading passage (100-120 words, neutral academic content)
 * Validates: Requirements 3.1
 */
export const DEFAULT_PASSAGE: ReadingPassageContent = {
  text: `The human visual system is remarkably adaptive, capable of processing complex information across varying conditions. Research indicates that reading comprehension depends on multiple factors including font size, contrast, and viewing distance. Studies have shown that optimal reading occurs when text is presented at appropriate sizes with sufficient spacing. The eye's ability to focus and track text involves coordinated movements of multiple muscles. Environmental factors such as lighting and screen brightness also play significant roles in reading comfort. Understanding these variables helps optimize digital reading experiences for diverse user populations.`,
  wordCount: 103,
  difficulty: 'neutral-academic'
};
