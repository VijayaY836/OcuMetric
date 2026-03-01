# Requirements Document

## Introduction

The Digital Ocular Stress Reading Test is a web-based prototype application that performs a 30-second reading assessment using webcam-based eye tracking to measure ocular stress indicators. This is a functional prototype designed for research and demonstration purposes, not a medical diagnostic device. The application processes all data locally in the browser with no data storage or transmission, providing users with immediate feedback on their reading stress patterns.

## Glossary

- **Application**: The Digital Ocular Stress Reading Test web application
- **User**: A person using the application to perform the reading assessment
- **Assessment**: The 30-second reading test session with eye tracking
- **Eye_Tracker**: The MediaPipe Face Mesh component that analyzes webcam input
- **Stress_Score**: A 0-100 numerical value representing calculated ocular stress
- **Camera_Preview**: The live webcam video display shown to the user
- **Dyslexic_Mode**: An accessibility feature that adjusts typography for dyslexic readers
- **EAR**: Eye Aspect Ratio, a metric for detecting blinks and eye openness
- **Local_Processing**: All computation occurs in the browser without server communication

## Requirements

### Requirement 1: Webcam Access and Local Processing

**User Story:** As a user, I want the application to access my webcam for eye tracking while ensuring all processing happens locally, so that I can trust my privacy is protected.

#### Acceptance Criteria

1. WHEN the user clicks "Start Assessment", THE Application SHALL request webcam permission from the browser
2. WHEN webcam permission is granted, THE Application SHALL initialize the camera feed for eye tracking
3. WHEN webcam permission is denied, THE Application SHALL display an error message explaining that camera access is required
4. THE Application SHALL process all video data locally in the browser without uploading or storing any frames
5. THE Application SHALL display a visible badge stating "Local Processing • No Data Stored" during the assessment
6. WHEN the assessment ends, THE Application SHALL release the webcam resource immediately

### Requirement 2: Camera Preview Display and Toggle

**User Story:** As a user, I want to control whether I see my camera preview during the test, so that I can minimize distractions while still having the option to verify camera positioning.

#### Acceptance Criteria

1. THE Application SHALL display a toggle switch labeled "Show Camera Preview" on the assessment screen
2. WHEN the toggle is enabled, THE Application SHALL display a small circular camera preview in the bottom-right corner
3. WHEN the toggle is disabled, THE Application SHALL hide the camera preview with a smooth fade animation
4. WHILE the camera preview is hidden, THE Eye_Tracker SHALL continue processing video data in the background
5. THE Application SHALL allow the camera preview to be draggable to different screen positions
6. WHEN the toggle state changes, THE Application SHALL animate the transition over 300-500 milliseconds

### Requirement 3: Progressive Reading Test

**User Story:** As a user, I want to read a passage that progressively decreases in font size over 30 seconds, so that the application can measure my reading stress under increasing visual demand.

#### Acceptance Criteria

1. WHEN the assessment starts, THE Application SHALL display a 100-120 word passage with neutral academic content
2. WHILE 0-10 seconds have elapsed, THE Application SHALL display the text in large font size
3. WHILE 10-20 seconds have elapsed, THE Application SHALL display the text in medium font size
4. WHILE 20-30 seconds have elapsed, THE Application SHALL display the text in smaller font size
5. WHEN transitioning between font sizes, THE Application SHALL animate the change smoothly over 300-500 milliseconds
6. THE Application SHALL display a circular countdown timer in the top-right corner showing remaining time
7. THE Application SHALL center the text content without requiring scrolling
8. WHEN 30 seconds have elapsed, THE Application SHALL automatically transition to the results screen

### Requirement 4: Dyslexic Mode Accessibility

**User Story:** As a user with dyslexia, I want to enable a dyslexic-friendly reading mode, so that I can complete the assessment with appropriate typographic accommodations.

#### Acceptance Criteria

1. THE Application SHALL display a "Dyslexic Mode" toggle on the landing screen
2. WHEN Dyslexic Mode is enabled, THE Application SHALL use the OpenDyslexic font family for all reading text
3. WHEN Dyslexic Mode is enabled, THE Application SHALL increase letter spacing by at least 0.05em
4. WHEN Dyslexic Mode is enabled, THE Application SHALL increase line height by at least 1.8
5. WHEN Dyslexic Mode is enabled, THE Application SHALL apply slightly heavier font weight
6. WHEN Dyslexic Mode is enabled, THE Application SHALL display a subtle badge stating "Dyslexic Mode Active"
7. WHILE Dyslexic Mode is enabled, THE Application SHALL maintain the progressive font size reduction behavior

### Requirement 5: Eye Tracking Metrics Collection

**User Story:** As a user, I want the application to track my eye behavior during reading, so that it can provide meaningful feedback about my reading stress patterns.

#### Acceptance Criteria

1. THE Eye_Tracker SHALL use MediaPipe Face Mesh for facial landmark detection
2. WHEN the assessment is active, THE Eye_Tracker SHALL calculate blink frequency in real-time
3. WHEN the assessment is active, THE Eye_Tracker SHALL calculate Eye Aspect Ratio (EAR) for each frame
4. WHEN the assessment is active, THE Eye_Tracker SHALL estimate face distance based on bounding box size
5. WHEN the assessment is active, THE Eye_Tracker SHALL measure head movement variance
6. THE Eye_Tracker SHALL perform all calculations in real-time without blocking the UI thread
7. THE Eye_Tracker SHALL aggregate metrics over the 30-second assessment period

### Requirement 6: Stress Score Calculation

**User Story:** As a user, I want to receive a numerical stress score based on my eye tracking data, so that I can understand my overall reading stress level.

#### Acceptance Criteria

1. WHEN the assessment completes, THE Application SHALL calculate a Stress_Score between 0 and 100
2. THE Application SHALL derive the Stress_Score from blink frequency, EAR variance, distance changes, and head movement
3. WHEN the Stress_Score is 0-33, THE Application SHALL classify it as "Low" stress with green color coding
4. WHEN the Stress_Score is 34-66, THE Application SHALL classify it as "Moderate" stress with yellow color coding
5. WHEN the Stress_Score is 67-100, THE Application SHALL classify it as "High" stress with red color coding

### Requirement 7: Results Display and Insights

**User Story:** As a user, I want to see detailed results and behavioral insights after the assessment, so that I can understand what the data reveals about my reading patterns.

#### Acceptance Criteria

1. WHEN the assessment completes, THE Application SHALL transition to the results screen with a smooth fade animation
2. THE Application SHALL display the Stress_Score using an animated radial gauge
3. THE Application SHALL animate the gauge from 0 to the final score over 1-2 seconds
4. THE Application SHALL generate dynamic behavioral insights based on collected metrics
5. WHEN blink rate decreased during smaller text, THE Application SHALL include this observation in the behavioral summary
6. WHEN viewing distance changed significantly, THE Application SHALL include this observation in the behavioral summary
7. WHEN sustained focus without blink recovery was detected, THE Application SHALL include this observation in the behavioral summary
8. THE Application SHALL display 2-4 behavioral insights in clear, concise language

### Requirement 8: Personalized Suggestions

**User Story:** As a user, I want to receive practical suggestions based on my assessment results, so that I can improve my reading comfort and reduce eye strain.

#### Acceptance Criteria

1. THE Application SHALL display a suggestions section on the results screen
2. WHEN the Stress_Score indicates high stress, THE Application SHALL suggest increasing reading font size
3. WHEN face distance was inconsistent or too close, THE Application SHALL suggest maintaining 40-60 cm viewing distance
4. WHEN blink frequency was low, THE Application SHALL suggest using regular blink breaks
5. WHEN reading difficulty patterns were detected, THE Application SHALL suggest enabling dyslexic mode
6. THE Application SHALL present suggestions in a clinical, calm, and informative tone
7. THE Application SHALL display 3-5 practical suggestions relevant to the user's metrics

### Requirement 9: User Interface Design

**User Story:** As a user, I want a clean, modern, and professional interface, so that the application feels like a serious research prototype.

#### Acceptance Criteria

1. THE Application SHALL use a minimal medical-tech aesthetic throughout
2. THE Application SHALL apply soft gradient backgrounds to main screens
3. THE Application SHALL use rounded cards for content containers
4. THE Application SHALL use clean, readable typography with appropriate hierarchy
5. THE Application SHALL implement smooth transitions between all screen states
6. THE Application SHALL apply subtle shadows to elevated UI elements
7. THE Application SHALL maintain a clutter-free layout with appropriate whitespace
8. THE Application SHALL be fully responsive across desktop, tablet, and mobile devices

### Requirement 10: Privacy and Data Handling

**User Story:** As a user, I want explicit assurance that my video data is not stored or transmitted, so that I can use the application with confidence in my privacy.

#### Acceptance Criteria

1. THE Application SHALL display the statement "All processing occurs locally" on the landing screen
2. THE Application SHALL not persist any video frames, eye tracking data, or assessment results
3. WHEN the user navigates away or closes the browser, THE Application SHALL lose all session data
4. WHEN a new assessment starts, THE Application SHALL reset all previous state and metrics
5. THE Application SHALL not make any network requests during the assessment
6. THE Application SHALL not use cookies or local storage for tracking data

### Requirement 11: Technology Stack Implementation

**User Story:** As a developer, I want the application built with modern web technologies, so that it is maintainable, performant, and fully client-side.

#### Acceptance Criteria

1. THE Application SHALL be built using React for UI components
2. THE Application SHALL use MediaPipe Face Mesh for eye tracking functionality
3. THE Application SHALL use Chart.js for rendering the radial gauge visualization
4. THE Application SHALL use Tailwind CSS for styling and responsive design
5. THE Application SHALL run entirely client-side without requiring a backend server
6. THE Application SHALL bundle all dependencies for offline capability after initial load
