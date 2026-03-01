import React, { useState, useEffect, useRef } from 'react';
import { ReadingPassage } from './ReadingPassage';
import { CountdownTimer } from './CountdownTimer';
import { CameraPreviewToggle } from './CameraPreviewToggle';
import { CameraPreview } from './CameraPreview';
import { PrivacyBadge } from './PrivacyBadge';
import { EyeTracker } from './EyeTracker';
import { CameraErrorHandler } from './CameraErrorHandler';
import type { CameraErrorType } from './CameraErrorHandler';
import type { MetricsSnapshot, AssessmentData } from '../types';
import { PHASE_BOUNDARIES } from '../constants';

interface AssessmentScreenProps {
  dyslexicMode: boolean;
  cameraPreviewVisible: boolean;
  onCameraPreviewChange: (visible: boolean) => void;
  onAssessmentComplete: (data: AssessmentData) => void;
}

export const AssessmentScreen: React.FC<AssessmentScreenProps> = ({
  dyslexicMode,
  cameraPreviewVisible,
  onCameraPreviewChange,
  onAssessmentComplete
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [cameraError, setCameraError] = useState<CameraErrorType | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const assessmentDataRef = useRef<AssessmentData>({
    startTime: Date.now(),
    blinkEvents: [],
    earValues: [],
    faceDistances: [],
    headMovements: []
  });

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= PHASE_BOUNDARIES.ASSESSMENT_DURATION) {
          setIsActive(false);
          onAssessmentComplete(assessmentDataRef.current);
          return PHASE_BOUNDARIES.ASSESSMENT_DURATION;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, onAssessmentComplete]);

  const handleMetricsUpdate = (metrics: MetricsSnapshot) => {
    const data = assessmentDataRef.current;
    
    if (metrics.blinkDetected) {
      data.blinkEvents.push(metrics.timestamp);
    }
    
    data.earValues.push(metrics.ear);
    data.faceDistances.push(metrics.faceDistance);
    data.headMovements.push(metrics.headPosition);
  };

  const handleCameraError = (errorType: string) => {
    setCameraError(errorType as CameraErrorType);
    setIsActive(false);
  };

  const handleRetry = () => {
    setCameraError(null);
    setIsActive(true);
    window.location.reload();
  };

  const handleDismissWarning = () => {
    setCameraError(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Privacy Badge */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
        <PrivacyBadge />
      </div>

      {/* Countdown Timer */}
      <CountdownTimer elapsedTime={elapsedTime} />

      {/* Camera Preview Toggle */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10">
        <CameraPreviewToggle
          enabled={cameraPreviewVisible}
          onChange={onCameraPreviewChange}
        />
      </div>

      {/* Reading Passage */}
      <ReadingPassage elapsedTime={elapsedTime} dyslexicMode={dyslexicMode} />

      {/* Camera Preview */}
      <CameraPreview videoRef={videoRef} visible={cameraPreviewVisible} />

      {/* Eye Tracker (invisible) */}
      <EyeTracker
        onMetricsUpdate={handleMetricsUpdate}
        isActive={isActive}
        videoRef={videoRef}
        onError={handleCameraError}
      />

      {/* Camera Error Handler */}
      <CameraErrorHandler
        errorType={cameraError}
        onRetry={handleRetry}
        onDismiss={handleDismissWarning}
      />
    </div>
  );
};
