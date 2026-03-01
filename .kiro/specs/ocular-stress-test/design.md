# Design Document: Digital Ocular Stress Reading Test

## Overview

The Digital Ocular Stress Reading Test is a React-based single-page application that conducts a 30-second reading assessment with real-time eye tracking. The application uses MediaPipe Face Mesh to analyze webcam input and calculate ocular stress indicators without storing or transmitting any data.

The user flow consists of three main screens:
1. **Landing Screen**: Introduction, privacy statement, dyslexic mode toggle, and start button
2. **Assessment Screen**: 30-second reading test with progressive font size reduction, live eye tracking, camera preview toggle, and countdown timer
3. **Results Screen**: Animated stress score gauge, behavioral insights, and personalized suggestions

All processing occurs client-side using WebAssembly-based MediaPipe models, ensuring privacy and eliminating network latency.

## Architecture

### Component Hierarchy

```
App
├── LandingScreen
│   ├── PrivacyBadge
│   ├── DyslexicModeToggle
│   └── StartButton
├── AssessmentScreen
│   ├── ReadingPassage
│   ├── CountdownTimer
│   ├── CameraPreviewToggle
│   ├── CameraPreview (conditional)
│   ├── PrivacyBadge
│   └── EyeTracker (invisible)
└── ResultsScreen
    ├── StressScoreGauge
    ├── BehavioralInsights
    └── SuggestionsList
```

### State Management

The application uses React Context API for global state management:

```typescript
interface AppState {
  currentScreen: 'landing' | 'assessment' | 'results';
  dyslexicMode: boolean;
  cameraPreviewVisible: boolean;
  assessmentData: AssessmentData | null;
  results: AssessmentResults | null;
}

interface AssessmentData {
  startTime: number;
  blinkEvents: number[];
  earValues: number[];
  faceDistances: number[];
  headMovements: { x: number; y: number }[];
}

interface AssessmentResults {
  stressScore: number;
  insights: string[];
  suggestions: string[];
}
```

### Technology Stack Integration

- **React 18**: Component framework with hooks for state and effects
- **MediaPipe Face Mesh**: WebAssembly-based facial landmark detection (468 landmarks)
- **Chart.js with react-chartjs-2**: Radial gauge visualization
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Vite**: Build tool for fast development and optimized production builds

## Components and Interfaces

### EyeTracker Component

The EyeTracker component is the core of the application's eye tracking functionality. It runs MediaPipe Face Mesh in the background and calculates metrics in real-time.

```typescript
interface EyeTrackerProps {
  onMetricsUpdate: (metrics: MetricsSnapshot) => void;
  isActive: boolean;
}

interface MetricsSnapshot {
  timestamp: number;
  blinkDetected: boolean;
  ear: number;
  faceDistance: number;
  headPosition: { x: number; y: number };
}

// Eye Aspect Ratio calculation
function calculateEAR(landmarks: FaceLandmark[]): number {
  // Using landmarks for left eye: 33, 160, 158, 133, 153, 144
  // Using landmarks for right eye: 362, 385, 387, 263, 373, 380
  const leftEAR = computeEyeAspectRatio(leftEyeLandmarks);
  const rightEAR = computeEyeAspectRatio(rightEyeLandmarks);
  return (leftEAR + rightEAR) / 2;
}

function computeEyeAspectRatio(eyeLandmarks: Point[]): number {
  // Vertical distances
  const v1 = distance(eyeLandmarks[1], eyeLandmarks[5]);
  const v2 = distance(eyeLandmarks[2], eyeLandmarks[4]);
  // Horizontal distance
  const h = distance(eyeLandmarks[0], eyeLandmarks[3]);
  return (v1 + v2) / (2.0 * h);
}

// Blink detection
function detectBlink(ear: number, threshold: number = 0.21): boolean {
  return ear < threshold;
}

// Face distance estimation
function estimateFaceDistance(faceLandmarks: FaceLandmark[]): number {
  // Calculate bounding box diagonal as proxy for distance
  const bbox = calculateBoundingBox(faceLandmarks);
  const diagonal = Math.sqrt(bbox.width ** 2 + bbox.height ** 2);
  // Normalize to 0-1 range (larger = closer)
  return diagonal / Math.sqrt(2);
}

// Head movement tracking
function calculateHeadPosition(faceLandmarks: FaceLandmark[]): { x: number; y: number } {
  // Use nose tip (landmark 1) as reference point
  const noseTip = faceLandmarks[1];
  return { x: noseTip.x, y: noseTip.y };
}
```

### ReadingPassage Component

Displays the reading text with progressive font size reduction and dyslexic mode support.

```typescript
interface ReadingPassageProps {
  elapsedTime: number;
  dyslexicMode: boolean;
}

function getFontSize(elapsedTime: number): string {
  if (elapsedTime < 10) return '2rem';      // Large
  if (elapsedTime < 20) return '1.5rem';    // Medium
  return '1.125rem';                         // Smaller
}

function getTypographyStyles(dyslexicMode: boolean) {
  if (dyslexicMode) {
    return {
      fontFamily: 'OpenDyslexic, sans-serif',
      letterSpacing: '0.05em',
      lineHeight: '1.8',
      fontWeight: '500'
    };
  }
  return {
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: 'normal',
    lineHeight: '1.6',
    fontWeight: '400'
  };
}
```

### CameraPreview Component

Displays the live webcam feed in a draggable circular container.

```typescript
interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  visible: boolean;
}

// Draggable implementation using React hooks
function useDraggable(elementRef: React.RefObject<HTMLElement>) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Mouse event handlers for drag functionality
  // Constrain position to viewport bounds
  
  return { position, isDragging };
}
```

### StressScoreCalculator

Analyzes collected metrics and computes the final stress score.

```typescript
interface StressScoreCalculator {
  calculate(data: AssessmentData): number;
}

function calculateStressScore(data: AssessmentData): number {
  // Normalize metrics to 0-1 range
  const blinkScore = normalizeBlinkFrequency(data.blinkEvents);
  const earScore = normalizeEARVariance(data.earValues);
  const distanceScore = normalizeFaceDistanceVariance(data.faceDistances);
  const movementScore = normalizeHeadMovement(data.headMovements);
  
  // Weighted combination
  const weights = {
    blink: 0.3,
    ear: 0.25,
    distance: 0.25,
    movement: 0.2
  };
  
  const rawScore = 
    blinkScore * weights.blink +
    earScore * weights.ear +
    distanceScore * weights.distance +
    movementScore * weights.movement;
  
  // Scale to 0-100
  return Math.round(rawScore * 100);
}

function normalizeBlinkFrequency(blinkEvents: number[]): number {
  const blinkRate = blinkEvents.length / 30; // blinks per second
  // Normal: 15-20 blinks/min (0.25-0.33 blinks/sec)
  // Low blink rate indicates stress
  if (blinkRate < 0.25) return 0.8; // High stress
  if (blinkRate > 0.5) return 0.3;  // Low stress
  return 0.5; // Moderate
}

function normalizeEARVariance(earValues: number[]): number {
  const variance = calculateVariance(earValues);
  // Higher variance indicates more blinks and eye movement (lower stress)
  // Lower variance indicates sustained stare (higher stress)
  return 1 - Math.min(variance * 10, 1);
}

function normalizeFaceDistanceVariance(distances: number[]): number {
  const variance = calculateVariance(distances);
  // Higher variance indicates distance changes (higher stress)
  return Math.min(variance * 5, 1);
}

function normalizeHeadMovement(movements: { x: number; y: number }[]): number {
  let totalMovement = 0;
  for (let i = 1; i < movements.length; i++) {
    const dx = movements[i].x - movements[i - 1].x;
    const dy = movements[i].y - movements[i - 1].y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }
  // Higher movement indicates restlessness (higher stress)
  return Math.min(totalMovement / movements.length * 100, 1);
}
```

### InsightGenerator

Generates dynamic behavioral insights based on collected metrics.

```typescript
interface InsightGenerator {
  generate(data: AssessmentData, score: number): string[];
}

function generateInsights(data: AssessmentData, score: number): string[] {
  const insights: string[] = [];
  
  // Analyze blink patterns
  const blinksByPhase = {
    phase1: data.blinkEvents.filter(t => t < 10).length,
    phase2: data.blinkEvents.filter(t => t >= 10 && t < 20).length,
    phase3: data.blinkEvents.filter(t => t >= 20).length
  };
  
  if (blinksByPhase.phase3 < blinksByPhase.phase1 * 0.5) {
    insights.push("Blink rate decreased during smaller text exposure.");
  }
  
  // Analyze distance changes
  const avgDistancePhase1 = average(data.faceDistances.slice(0, 300));
  const avgDistancePhase3 = average(data.faceDistances.slice(600));
  
  if (avgDistancePhase3 > avgDistancePhase1 * 1.15) {
    insights.push("Viewing distance reduced under increased visual demand.");
  }
  
  // Analyze sustained focus
  const earVariance = calculateVariance(data.earValues);
  if (earVariance < 0.01) {
    insights.push("Sustained focus without blink recovery detected.");
  }
  
  // Analyze head stability
  const headMovementVariance = calculateMovementVariance(data.headMovements);
  if (headMovementVariance > 0.05) {
    insights.push("Increased head movement observed during reading task.");
  }
  
  return insights.slice(0, 4); // Return top 4 insights
}
```

### SuggestionGenerator

Generates personalized suggestions based on stress score and metrics.

```typescript
function generateSuggestions(data: AssessmentData, score: number): string[] {
  const suggestions: string[] = [];
  
  if (score > 66) {
    suggestions.push("Increase reading font size to reduce visual strain.");
  }
  
  const avgDistance = average(data.faceDistances);
  if (avgDistance > 0.7 || calculateVariance(data.faceDistances) > 0.05) {
    suggestions.push("Maintain 40–60 cm viewing distance for optimal comfort.");
  }
  
  const blinkRate = data.blinkEvents.length / 30;
  if (blinkRate < 0.25) {
    suggestions.push("Use regular blink breaks to prevent dry eyes.");
  }
  
  if (score > 50) {
    suggestions.push("Enable dyslexic mode if reading difficulty detected.");
  }
  
  const earVariance = calculateVariance(data.earValues);
  if (earVariance < 0.01) {
    suggestions.push("Take periodic breaks to reduce sustained visual focus.");
  }
  
  return suggestions.slice(0, 5);
}
```

## Data Models

### Assessment Metrics

```typescript
// Raw metrics collected during assessment
interface RawMetrics {
  timestamps: number[];
  earValues: number[];
  blinkEvents: number[];
  faceDistances: number[];
  headPositions: { x: number; y: number }[];
}

// Processed results
interface ProcessedResults {
  stressScore: number;
  classification: 'Low' | 'Moderate' | 'High';
  colorCode: 'green' | 'yellow' | 'red';
  insights: string[];
  suggestions: string[];
  metrics: {
    avgBlinkRate: number;
    avgEAR: number;
    avgDistance: number;
    headMovementScore: number;
  };
}
```

### Reading Content

```typescript
interface ReadingPassageContent {
  text: string;
  wordCount: number;
  difficulty: 'neutral-academic';
}

const DEFAULT_PASSAGE: ReadingPassageContent = {
  text: `The human visual system is remarkably adaptive, capable of processing complex information across varying conditions. Research indicates that reading comprehension depends on multiple factors including font size, contrast, and viewing distance. Studies have shown that optimal reading occurs when text is presented at appropriate sizes with sufficient spacing. The eye's ability to focus and track text involves coordinated movements of multiple muscles. Environmental factors such as lighting and screen brightness also play significant roles in reading comfort. Understanding these variables helps optimize digital reading experiences for diverse user populations.`,
  wordCount: 103,
  difficulty: 'neutral-academic'
};
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Webcam Resource Cleanup

*For any* assessment session, when the assessment ends (either by completion or cancellation), the webcam stream should be stopped and all media tracks should be released.

**Validates: Requirements 1.6**

### Property 2: Local Processing Guarantee

*For any* assessment session, no network requests should be made during eye tracking, no video frames should be uploaded, and no data should be persisted to localStorage, sessionStorage, or cookies.

**Validates: Requirements 1.4, 10.2, 10.5, 10.6**

### Property 3: Eye Tracking Continues When Preview Hidden

*For any* assessment with camera preview toggled off, the eye tracker should continue collecting metrics (blinks, EAR, distance, head movement) at the same rate as when preview is visible.

**Validates: Requirements 2.4**

### Property 4: Camera Preview Draggability

*For any* drag operation on the camera preview, the preview position should update to follow the cursor while remaining within viewport bounds.

**Validates: Requirements 2.5**

### Property 5: Dyslexic Mode Typography

*For any* reading passage rendered with dyslexic mode enabled, the text should have OpenDyslexic font family, letter spacing ≥ 0.05em, line height ≥ 1.8, and font weight ≥ 500.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 6: Font Size Progression Maintained in Dyslexic Mode

*For any* assessment running in dyslexic mode, the font size should still progress through three distinct phases (large → medium → small) at the 10-second and 20-second marks.

**Validates: Requirements 4.7**

### Property 7: Comprehensive Metrics Collection

*For any* completed assessment, the collected data should contain blink events, EAR values, face distance measurements, and head position coordinates spanning the full 30-second duration.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.7**

### Property 8: Stress Score Range

*For any* assessment data, the calculated stress score should be a number between 0 and 100 (inclusive).

**Validates: Requirements 6.1**

### Property 9: Insights Generation

*For any* completed assessment, the generated insights array should contain 2-4 entries, each describing an observed behavioral pattern based on the collected metrics.

**Validates: Requirements 7.4, 7.8**

### Property 10: Blink Rate Insight

*For any* assessment where blink count in phase 3 (20-30s) is less than 50% of blink count in phase 1 (0-10s), the insights should include an observation about decreased blink rate during smaller text.

**Validates: Requirements 7.5**

### Property 11: Distance Change Insight

*For any* assessment where average face distance in phase 3 is more than 15% greater than phase 1, the insights should include an observation about viewing distance reduction under visual demand.

**Validates: Requirements 7.6**

### Property 12: Sustained Focus Insight

*For any* assessment where EAR variance is less than 0.01, the insights should include an observation about sustained focus without blink recovery.

**Validates: Requirements 7.7**

### Property 13: Suggestions Count

*For any* completed assessment, the generated suggestions array should contain 3-5 practical recommendations.

**Validates: Requirements 8.7**

### Property 14: High Stress Font Size Suggestion

*For any* assessment with stress score > 66, the suggestions should include a recommendation to increase reading font size.

**Validates: Requirements 8.2**

### Property 15: Distance Inconsistency Suggestion

*For any* assessment where face distance variance > 0.05 or average distance > 0.7, the suggestions should include a recommendation to maintain 40-60 cm viewing distance.

**Validates: Requirements 8.3**

### Property 16: Low Blink Rate Suggestion

*For any* assessment where blink rate < 0.25 blinks per second, the suggestions should include a recommendation to use regular blink breaks.

**Validates: Requirements 8.4**

### Property 17: Dyslexic Mode Suggestion

*For any* assessment with stress score > 50, the suggestions should include a recommendation to enable dyslexic mode.

**Validates: Requirements 8.5**

### Property 18: Responsive Layout

*For any* viewport width (320px to 2560px), all UI elements should remain visible, readable, and functional without horizontal scrolling.

**Validates: Requirements 9.8**

### Property 19: State Reset on New Assessment

*For any* new assessment started after a previous assessment, all previous metrics, results, insights, and suggestions should be cleared before the new assessment begins.

**Validates: Requirements 10.4**

### Property 20: Offline Functionality

*For any* user session after initial page load, the application should remain fully functional when network connectivity is disabled.

**Validates: Requirements 11.5, 11.6**

## Error Handling

### Webcam Permission Errors

- **Permission Denied**: Display clear error message: "Camera access is required for eye tracking. Please enable camera permissions and refresh the page."
- **No Camera Available**: Display error message: "No camera detected. Please connect a webcam and refresh the page."
- **Camera In Use**: Display error message: "Camera is being used by another application. Please close other applications and try again."

### MediaPipe Loading Errors

- **Model Load Failure**: Display error message: "Failed to load eye tracking model. Please check your internet connection and refresh the page."
- **WebAssembly Not Supported**: Display error message: "Your browser does not support required features. Please use a modern browser like Chrome, Firefox, or Edge."

### Runtime Errors

- **Face Not Detected**: Continue assessment but log warning. If face is not detected for > 5 seconds, display subtle notification: "Please ensure your face is visible to the camera."
- **Low Frame Rate**: If processing drops below 15 FPS, log warning but continue assessment.
- **Calculation Errors**: If stress score calculation fails, default to score of 50 with generic insights and suggestions.

### Graceful Degradation

- If Chart.js fails to load, display stress score as large text instead of gauge
- If OpenDyslexic font fails to load, fall back to system sans-serif with increased spacing
- If drag functionality fails, camera preview remains in default position

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions using Jest and React Testing Library:

- **Component Rendering**: Test that each component renders correctly with various props
- **State Management**: Test state transitions and context updates
- **Error Boundaries**: Test error handling for permission denied, no camera, model load failures
- **Edge Cases**: Test with empty data, extreme values, boundary conditions
- **UI Interactions**: Test button clicks, toggle switches, drag operations
- **Classification Logic**: Test stress score classification at boundaries (33, 34, 66, 67)

### Property-Based Testing

Property tests will verify universal properties across all inputs using fast-check library. Each test will run a minimum of 100 iterations with randomized inputs.

**Configuration**:
```typescript
import fc from 'fast-check';

// Each property test runs 100+ iterations
const testConfig = { numRuns: 100 };
```

**Test Tagging Format**:
```typescript
// Feature: ocular-stress-test, Property 8: Stress Score Range
test('stress score is always between 0 and 100', () => {
  fc.assert(
    fc.property(
      assessmentDataArbitrary(),
      (data) => {
        const score = calculateStressScore(data);
        return score >= 0 && score <= 100;
      }
    ),
    testConfig
  );
});
```

**Property Test Coverage**:

1. **Property 1**: Test webcam cleanup with various session end scenarios
2. **Property 2**: Monitor network activity and storage APIs during random assessments
3. **Property 3**: Generate random toggle sequences and verify metrics collection continues
4. **Property 7**: Generate random assessment durations and verify all metric arrays are populated
5. **Property 8**: Generate random assessment data and verify score range
6. **Property 9**: Generate random assessment data and verify insights count
7. **Property 10-12**: Generate assessment data with specific patterns and verify insights
8. **Property 13**: Generate random assessment data and verify suggestions count
9. **Property 14-17**: Generate assessment data with specific conditions and verify suggestions
10. **Property 18**: Test at random viewport widths and verify layout integrity
11. **Property 19**: Generate random assessment sequences and verify state reset
12. **Property 20**: Test random user interactions with network disabled

**Generators (Arbitraries)**:

```typescript
// Generate random assessment data
function assessmentDataArbitrary(): fc.Arbitrary<AssessmentData> {
  return fc.record({
    startTime: fc.integer({ min: 0, max: Date.now() }),
    blinkEvents: fc.array(fc.float({ min: 0, max: 30 }), { minLength: 0, maxLength: 50 }),
    earValues: fc.array(fc.float({ min: 0.1, max: 0.4 }), { minLength: 900, maxLength: 900 }),
    faceDistances: fc.array(fc.float({ min: 0.3, max: 1.0 }), { minLength: 900, maxLength: 900 }),
    headMovements: fc.array(
      fc.record({ x: fc.float({ min: 0, max: 1 }), y: fc.float({ min: 0, max: 1 }) }),
      { minLength: 900, maxLength: 900 }
    )
  });
}

// Generate random viewport dimensions
function viewportArbitrary(): fc.Arbitrary<{ width: number; height: number }> {
  return fc.record({
    width: fc.integer({ min: 320, max: 2560 }),
    height: fc.integer({ min: 568, max: 1440 })
  });
}
```

### Integration Testing

Integration tests will verify end-to-end flows:

- Complete assessment flow from landing to results
- Camera permission flow with mocked browser APIs
- Dyslexic mode affecting all relevant components
- State persistence across component lifecycle

### Manual Testing Checklist

- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (desktop, tablet, mobile)
- Test with different webcams and lighting conditions
- Verify privacy badge visibility
- Verify smooth animations and transitions
- Verify accessibility with keyboard navigation
- Test offline functionality after initial load

