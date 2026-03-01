import React from 'react';

export type CameraErrorType = 
  | 'permission-denied'
  | 'no-camera'
  | 'camera-in-use'
  | 'mediapipe-load-failed'
  | 'webassembly-not-supported'
  | 'face-not-detected';

interface CameraErrorHandlerProps {
  errorType: CameraErrorType | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_MESSAGES: Record<CameraErrorType, { title: string; message: string; canRetry: boolean }> = {
  'permission-denied': {
    title: 'Camera Access Required',
    message: 'Camera access is required for eye tracking. Please enable camera permissions in your browser settings and refresh the page.',
    canRetry: true
  },
  'no-camera': {
    title: 'No Camera Detected',
    message: 'No camera detected. Please connect a webcam and refresh the page.',
    canRetry: true
  },
  'camera-in-use': {
    title: 'Camera In Use',
    message: 'Camera is being used by another application. Please close other applications and try again.',
    canRetry: true
  },
  'mediapipe-load-failed': {
    title: 'Failed to Load Eye Tracking',
    message: 'Failed to load eye tracking model. Please check your internet connection and refresh the page.',
    canRetry: true
  },
  'webassembly-not-supported': {
    title: 'Browser Not Supported',
    message: 'Your browser does not support required features. Please use a modern browser like Chrome, Firefox, or Edge.',
    canRetry: false
  },
  'face-not-detected': {
    title: 'Face Not Visible',
    message: 'Please ensure your face is visible to the camera.',
    canRetry: false
  }
};

/**
 * CameraErrorHandler Component
 * 
 * Displays user-friendly error messages for camera and MediaPipe errors.
 */
export const CameraErrorHandler: React.FC<CameraErrorHandlerProps> = ({
  errorType,
  onRetry,
  onDismiss
}) => {
  if (!errorType) return null;

  const errorInfo = ERROR_MESSAGES[errorType];
  const isWarning = errorType === 'face-not-detected';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isWarning ? 'bg-black/20' : 'bg-black/50'
    }`}>
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-fade-in ${
        isWarning ? 'border-2 border-yellow-400' : ''
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isWarning ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <svg
              className={`w-6 h-6 ${isWarning ? 'text-yellow-600' : 'text-red-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isWarning ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {errorInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {errorInfo.message}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {isWarning && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              Dismiss
            </button>
          )}
          {errorInfo.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          )}
          {!errorInfo.canRetry && !isWarning && (
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
