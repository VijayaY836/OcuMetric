# Digital Ocular Stress Reading Test

A React-based web application that performs a 30-second reading assessment using webcam-based eye tracking to measure ocular stress indicators.

## Features

- Real-time eye tracking using MediaPipe Face Mesh
- Progressive reading test with decreasing font sizes
- Dyslexic mode with OpenDyslexic font
- Privacy-focused: all processing happens locally in the browser
- Stress score calculation with behavioral insights
- Personalized suggestions for reducing eye strain

## Tech Stack

- **React 19** with TypeScript
- **Vite 8** for fast development and optimized builds
- **Tailwind CSS** for styling with medical-tech aesthetic
- **MediaPipe Face Mesh** for eye tracking
- **Chart.js** for data visualization
- **Vitest** for unit and property-based testing
- **fast-check** for property-based testing

## Project Structure

```
src/
├── components/     # React components
├── context/        # React context for state management
├── hooks/          # Custom React hooks
├── utils/          # Utility functions (eye tracking, calculations)
├── types/          # TypeScript type definitions
├── constants/      # Application constants
└── test/           # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Requirements

See `.kiro/specs/ocular-stress-test/requirements.md` for detailed requirements.

## Design

See `.kiro/specs/ocular-stress-test/design.md` for architecture and design details.

## Implementation Plan

See `.kiro/specs/ocular-stress-test/tasks.md` for the implementation task list.
