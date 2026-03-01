# Implementation Plan: Digital Ocular Stress Reading Test

## Overview

This implementation plan breaks down the Digital Ocular Stress Reading Test into discrete coding tasks. The application will be built using React, TypeScript, MediaPipe Face Mesh, Chart.js, and Tailwind CSS. All processing occurs client-side with no backend required.

The implementation follows a bottom-up approach: core utilities and eye tracking first, then UI components, then integration and testing.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize React + TypeScript project with Vite
  - Configure Tailwind CSS with custom theme (medical-tech aesthetic)
  - Install dependencies: @mediapipe/face_mesh, @mediapipe/camera_utils, chart.js, react-chartjs-2, fast-check
  - Set up testing framework (Jest, React Testing Library, fast-check)
  - Create project structure: components/, utils/, hooks/, types/, constants/
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 2. Core types and constants
  - [x] 2.1 Define TypeScript interfaces for assessment data, metrics, and results
    - Create types/index.ts with AppState, AssessmentData, AssessmentResults, MetricsSnapshot interfaces
    - Define ReadingPassageContent type and DEFAULT_PASSAGE constant
    - _Requirements: 3.1_
  
  - [x] 2.2 Create constants file with configuration values
    - Define font sizes for three phases, animation durations, EAR threshold, stress score thresholds
    - Define color codes for stress levels (green, yellow, red)
    - _Requirements: 3.2, 3.3, 3.4, 6.3, 6.4, 6.5_

- [ ] 3. Eye tracking utilities
  - [x] 3.1 Implement EAR (Eye Aspect Ratio) calculation
    - Create utils/eyeTracking.ts with calculateEAR and computeEyeAspectRatio functions
    - Use MediaPipe Face Mesh landmark indices for left and right eyes
    - _Requirements: 5.3_
  
  - [x] 3.2 Implement blink detection
    - Create detectBlink function using EAR threshold (0.21)
    - Track blink events with timestamps
    - _Requirements: 5.2_
  
  - [x] 3.3 Implement face distance estimation
    - Create estimateFaceDistance function using bounding box diagonal
    - Normalize to 0-1 range
    - _Requirements: 5.4_
  
  - [x] 3.4 Implement head movement tracking
    - Create calculateHeadPosition function using nose tip landmark
    - Track x, y coordinates over time
    - _Requirements: 5.5_
  
  - [ ]* 3.5 Write property test for metrics collection
    - **Property 7: Comprehensive Metrics Collection**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.7**

- [ ] 4. Stress score calculation
  - [x] 4.1 Implement stress score calculator
    - Create utils/stressScore.ts with calculateStressScore function
    - Implement normalization functions: normalizeBlinkFrequency, normalizeEARVariance, normalizeFaceDistanceVariance, normalizeHeadMovement
    - Apply weighted combination (blink: 0.3, ear: 0.25, distance: 0.25, movement: 0.2)
    - Scale to 0-100 range
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 4.2 Write property test for stress score range
    - **Property 8: Stress Score Range**
    - **Validates: Requirements 6.1**
  
  - [ ]* 4.3 Write unit tests for score classification
    - Test classification at boundaries: 0, 33, 34, 66, 67, 100
    - Verify color codes: green (0-33), yellow (34-66), red (67-100)
    - _Requirements: 6.3, 6.4, 6.5_

- [ ] 5. Insight and suggestion generation
  - [x] 5.1 Implement insight generator
    - Create utils/insightGenerator.ts with generateInsights function
    - Analyze blink patterns by phase
    - Detect distance changes between phases
    - Detect sustained focus (low EAR variance)
    - Detect head movement patterns
    - Return 2-4 most relevant insights
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [x] 5.2 Implement suggestion generator
    - Create utils/suggestionGenerator.ts with generateSuggestions function
    - Generate suggestions based on stress score and metrics
    - Return 3-5 practical recommendations
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.7_
  
  - [ ]* 5.3 Write property tests for insight generation
    - **Property 9: Insights Generation**
    - **Property 10: Blink Rate Insight**
    - **Property 11: Distance Change Insight**
    - **Property 12: Sustained Focus Insight**
    - **Validates: Requirements 7.4, 7.5, 7.6, 7.7, 7.8**
  
  - [ ]* 5.4 Write property tests for suggestion generation
    - **Property 13: Suggestions Count**
    - **Property 14: High Stress Font Size Suggestion**
    - **Property 15: Distance Inconsistency Suggestion**
    - **Property 16: Low Blink Rate Suggestion**
    - **Property 17: Dyslexic Mode Suggestion**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5, 8.7**

- [x] 6. Checkpoint - Ensure core utilities pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. EyeTracker component
  - [x] 7.1 Create EyeTracker component with MediaPipe integration
    - Create components/EyeTracker.tsx
    - Initialize MediaPipe Face Mesh with camera utils
    - Set up video element and canvas for processing
    - Implement onResults callback to process landmarks
    - Calculate metrics on each frame: EAR, blinks, distance, head position
    - Emit metrics via onMetricsUpdate callback
    - Handle cleanup on unmount (release camera)
    - _Requirements: 1.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 7.2 Write property test for eye tracking continuation when preview hidden
    - **Property 3: Eye Tracking Continues When Preview Hidden**
    - **Validates: Requirements 2.4**
  
  - [ ]* 7.3 Write unit tests for error handling
    - Test permission denied scenario
    - Test no camera available scenario
    - Test camera in use scenario
    - _Requirements: 1.3_

- [ ] 8. Camera preview component
  - [x] 8.1 Create CameraPreview component with drag functionality
    - Create components/CameraPreview.tsx
    - Display circular video preview
    - Implement useDraggable hook for drag-and-drop
    - Constrain position to viewport bounds
    - Apply smooth fade animation on visibility toggle
    - _Requirements: 2.2, 2.3, 2.5, 2.6_
  
  - [ ]* 8.2 Write property test for draggability
    - **Property 4: Camera Preview Draggability**
    - **Validates: Requirements 2.5**

- [ ] 9. Reading passage component
  - [x] 9.1 Create ReadingPassage component with progressive font sizing
    - Create components/ReadingPassage.tsx
    - Accept elapsedTime and dyslexicMode props
    - Calculate font size based on elapsed time (0-10s: 2rem, 10-20s: 1.5rem, 20-30s: 1.125rem)
    - Apply dyslexic typography styles when enabled (OpenDyslexic font, 0.05em spacing, 1.8 line height, 500 weight)
    - Animate font size transitions (300-500ms)
    - Center text without scrolling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 4.2, 4.3, 4.4, 4.5, 4.7_
  
  - [ ]* 9.2 Write property test for dyslexic mode typography
    - **Property 5: Dyslexic Mode Typography**
    - **Property 6: Font Size Progression Maintained in Dyslexic Mode**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.7**

- [ ] 10. UI components
  - [x] 10.1 Create CountdownTimer component
    - Create components/CountdownTimer.tsx
    - Display circular timer in top-right corner
    - Show remaining seconds
    - Update every second
    - _Requirements: 3.6_
  
  - [x] 10.2 Create PrivacyBadge component
    - Create components/PrivacyBadge.tsx
    - Display "Local Processing • No Data Stored" text
    - Style with subtle background and border
    - _Requirements: 1.5_
  
  - [x] 10.3 Create DyslexicModeToggle component
    - Create components/DyslexicModeToggle.tsx
    - Toggle switch with label "Dyslexic Mode"
    - Display "Dyslexic Mode Active" badge when enabled
    - Smooth animation on toggle
    - _Requirements: 4.1, 4.6_
  
  - [x] 10.4 Create CameraPreviewToggle component
    - Create components/CameraPreviewToggle.tsx
    - Toggle switch with label "Show Camera Preview"
    - Smooth animation on toggle
    - _Requirements: 2.1_

- [ ] 11. Results visualization
  - [x] 11.1 Create StressScoreGauge component
    - Create components/StressScoreGauge.tsx
    - Use Chart.js Doughnut chart for radial gauge
    - Animate from 0 to final score over 1-2 seconds
    - Apply color coding based on score (green/yellow/red)
    - Display score number in center
    - _Requirements: 7.2, 7.3_
  
  - [x] 11.2 Create BehavioralInsights component
    - Create components/BehavioralInsights.tsx
    - Display list of 2-4 insights
    - Style with clean typography and spacing
    - _Requirements: 7.4, 7.8_
  
  - [x] 11.3 Create SuggestionsList component
    - Create components/SuggestionsList.tsx
    - Display list of 3-5 suggestions
    - Style with clinical, calm tone
    - _Requirements: 8.1, 8.6, 8.7_

- [ ] 12. Main screen components
  - [x] 12.1 Create LandingScreen component
    - Create components/LandingScreen.tsx
    - Display app title and description
    - Include PrivacyBadge
    - Include DyslexicModeToggle
    - Include "Start Assessment" button
    - Display privacy statement: "All processing occurs locally"
    - _Requirements: 10.1_
  
  - [x] 12.2 Create AssessmentScreen component
    - Create components/AssessmentScreen.tsx
    - Display ReadingPassage with elapsed time
    - Display CountdownTimer
    - Display CameraPreviewToggle
    - Conditionally display CameraPreview
    - Display PrivacyBadge
    - Include hidden EyeTracker component
    - Collect metrics for 30 seconds
    - Transition to results after 30 seconds
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 3.8_
  
  - [x] 12.3 Create ResultsScreen component
    - Create components/ResultsScreen.tsx
    - Display StressScoreGauge
    - Display BehavioralInsights
    - Display SuggestionsList
    - Include "Start New Assessment" button
    - Smooth fade-in transition
    - _Requirements: 7.1, 8.1_

- [ ] 13. State management and app integration
  - [x] 13.1 Create AppContext for global state
    - Create context/AppContext.tsx
    - Define AppState interface
    - Provide currentScreen, dyslexicMode, cameraPreviewVisible, assessmentData, results
    - Implement state transitions and updates
    - _Requirements: All_
  
  - [x] 13.2 Create main App component
    - Create App.tsx
    - Wrap with AppContext provider
    - Conditionally render LandingScreen, AssessmentScreen, or ResultsScreen
    - Handle screen transitions
    - _Requirements: All_
  
  - [ ]* 13.3 Write property test for state reset
    - **Property 19: State Reset on New Assessment**
    - **Validates: Requirements 10.4**

- [ ] 14. Privacy and security implementation
  - [x] 14.1 Implement local processing guarantees
    - Ensure no network requests during assessment
    - Ensure no data persistence (no localStorage, sessionStorage, cookies)
    - Ensure webcam cleanup on unmount
    - _Requirements: 1.4, 1.6, 10.2, 10.3, 10.5, 10.6_
  
  - [ ]* 14.2 Write property test for local processing
    - **Property 1: Webcam Resource Cleanup**
    - **Property 2: Local Processing Guarantee**
    - **Validates: Requirements 1.4, 1.6, 10.2, 10.5, 10.6**

- [ ] 15. Responsive design and styling
  - [x] 15.1 Implement responsive layout with Tailwind
    - Configure Tailwind with custom theme (soft gradients, rounded cards, subtle shadows)
    - Apply responsive classes to all components
    - Test at breakpoints: mobile (320px), tablet (768px), desktop (1024px+)
    - Ensure no horizontal scrolling at any viewport size
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ]* 15.2 Write property test for responsive layout
    - **Property 18: Responsive Layout**
    - **Validates: Requirements 9.8**

- [ ] 16. Offline functionality
  - [x] 16.1 Configure Vite for offline capability
    - Set up service worker or configure build for bundling all dependencies
    - Test that app works after initial load with network disabled
    - _Requirements: 11.5, 11.6_
  
  - [ ]* 16.2 Write property test for offline functionality
    - **Property 20: Offline Functionality**
    - **Validates: Requirements 11.5, 11.6**

- [ ] 17. Error handling and edge cases
  - [x] 17.1 Implement error boundaries and fallbacks
    - Add error boundary component for React errors
    - Handle MediaPipe loading errors
    - Handle face not detected scenario (show subtle notification after 5 seconds)
    - Implement graceful degradation (Chart.js fallback, font fallback, drag fallback)
    - _Requirements: All error handling requirements_
  
  - [ ]* 17.2 Write unit tests for error scenarios
    - Test permission denied error message
    - Test no camera error message
    - Test model load failure error message
    - Test face not detected notification
    - Test calculation error fallback (score = 50)
    - _Requirements: 1.3_

- [x] 18. Final checkpoint - Integration testing
  - [ ]* 18.1 Write integration tests for complete flows
    - Test landing → assessment → results flow
    - Test dyslexic mode affecting all components
    - Test camera preview toggle during assessment
    - Test state reset on new assessment
  
  - [x] 18.2 Manual testing checklist
    - Test on Chrome, Firefox, Safari, Edge
    - Test on desktop, tablet, mobile
    - Test with different webcams and lighting
    - Verify all animations are smooth
    - Verify privacy badges are visible
    - Test keyboard navigation
    - Test offline after initial load
  
  - [x] 18.3 Ensure all tests pass
    - Run all unit tests
    - Run all property tests (100+ iterations each)
    - Run all integration tests
    - Fix any failing tests
    - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- Manual testing ensures cross-browser and cross-device compatibility
