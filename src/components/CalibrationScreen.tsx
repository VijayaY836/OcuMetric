import React, { useEffect, useState } from 'react';
import { PrivacyBadge } from './PrivacyBadge';

interface CalibrationScreenProps {
  onCalibrationComplete: () => void;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({ onCalibrationComplete }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onCalibrationComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onCalibrationComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative">
      {/* Privacy Badge */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <PrivacyBadge />
      </div>

      <div className="max-w-2xl w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-blue-100 flex items-center justify-center">
                  <span className="text-6xl font-bold text-blue-600">{countdown}</span>
                </div>
                <div className="absolute inset-0 rounded-full border-8 border-blue-600 animate-ping opacity-20"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Calibrating...
            </h2>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              OcuMetric first calibrates baseline blink rate and viewing distance using local, 
              real-time facial landmark detection. No data is stored. Everything runs on-device.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Please:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Look directly at the screen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Maintain a comfortable viewing distance (40-60 cm)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Blink naturally</span>
              </li>
            </ul>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Calibration Progress</span>
              <span>{((5 - countdown) / 5 * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${(5 - countdown) / 5 * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
