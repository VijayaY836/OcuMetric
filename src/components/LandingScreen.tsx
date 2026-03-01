import React from 'react';
import { PrivacyBadge } from './PrivacyBadge';
import { DyslexicModeToggle } from './DyslexicModeToggle';

interface LandingScreenProps {
  dyslexicMode: boolean;
  onDyslexicModeChange: (enabled: boolean) => void;
  onStartAssessment: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  dyslexicMode,
  onDyslexicModeChange,
  onStartAssessment
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 space-y-6 md:space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src="/logo.png" alt="OcuMetric Logo" className="h-16 w-16 object-contain" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                OcuMetric
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              A 30-second reading assessment with real-time eye tracking
            </p>
          </div>

          {/* Privacy Badge */}
          <div className="flex justify-center">
            <PrivacyBadge />
          </div>

          {/* Description */}
          <div className="space-y-4 text-gray-700">
            <p>
              This research prototype measures ocular stress indicators during a progressive reading task. 
              The text will gradually decrease in size over 30 seconds while we track your eye behavior.
            </p>
            <p className="text-sm font-medium text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
              OcuMetric first calibrates baseline blink rate and viewing distance using local, real-time facial landmark detection. No data is stored. Everything runs on-device.
            </p>
            <p className="text-sm text-gray-600">
              All processing occurs locally in your browser. No video data is stored or transmitted.
            </p>
          </div>

          {/* Dyslexic Mode Toggle */}
          <div className="flex justify-center py-4">
            <DyslexicModeToggle
              enabled={dyslexicMode}
              onChange={onDyslexicModeChange}
            />
          </div>

          {/* Start Button */}
          <button
            onClick={onStartAssessment}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start Assessment
          </button>

          {/* Requirements */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>Requirements: Webcam access, modern browser (Chrome, Firefox, Edge, Safari)</p>
            <p>Duration: 30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};
