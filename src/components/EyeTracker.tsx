/**
 * EyeTracker Component
 * 
 * Invisible component that runs MediaPipe Face Mesh in the background
 * to track eye metrics during the assessment.
 * 
 * Requirements: 1.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { useEffect, useRef } from 'react';
import type { MetricsSnapshot } from '../types';
import {
  calculateEAR,
  detectBlink,
  estimateFaceDistance,
  calculateHeadPosition
} from '../utils/eyeTracking';
import type { Point } from '../utils/eyeTracking';
import { EAR_THRESHOLD } from '../constants';

// MediaPipe types (we'll load the actual library dynamically)
interface FaceMeshResults {
  multiFaceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
}

interface FaceMeshInstance {
  setOptions: (options: any) => void;
  onResults: (callback: (results: FaceMeshResults) => void) => void;
  send: (data: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

interface CameraInstance {
  start: () => Promise<void>;
  stop: () => void;
}

declare global {
  interface Window {
    FaceMesh: new (config: any) => FaceMeshInstance;
    Camera: new (video: HTMLVideoElement, config: any) => CameraInstance;
  }
}

interface EyeTrackerProps {
  /**
   * Callback invoked on each frame with calculated metrics
   */
  onMetricsUpdate: (metrics: MetricsSnapshot) => void;
  
  /**
   * Whether eye tracking is currently active
   */
  isActive: boolean;

  /**
   * Optional external video ref for camera preview
   */
  videoRef?: React.RefObject<HTMLVideoElement | null>;

  /**
   * Optional error callback
   */
  onError?: (errorType: string) => void;
}

/**
 * EyeTracker component
 * 
 * Initializes MediaPipe Face Mesh with webcam access and processes
 * each frame to calculate eye tracking metrics (EAR, blinks, distance, head position).
 * All processing happens locally in the browser.
 */
export function EyeTracker({ onMetricsUpdate, isActive, videoRef: externalVideoRef, onError }: EyeTrackerProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMeshInstance | null>(null);
  const cameraRef = useRef<CameraInstance | null>(null);
  const isActiveRef = useRef(isActive);
  const scriptsLoadedRef = useRef(false);

  // Keep isActive ref in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Load MediaPipe scripts dynamically
  useEffect(() => {
    if (scriptsLoadedRef.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    const loadMediaPipe = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        scriptsLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load MediaPipe scripts:', error);
        onError?.('mediapipe-load-failed');
      }
    };

    loadMediaPipe();
  }, [onError]);

  useEffect(() => {
    let mounted = true;

    const initializeMediaPipe = async () => {
      if (!videoRef.current || !canvasRef.current) {
        return;
      }

      // Wait for scripts to load
      const waitForScripts = () => {
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (window.FaceMesh && window.Camera) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      };

      try {
        await waitForScripts();

        // Initialize MediaPipe Face Mesh
        const faceMesh = new window.FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });

        // Configure Face Mesh
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // Set up results callback
        faceMesh.onResults((results: FaceMeshResults) => {
          if (!mounted || !isActiveRef.current) {
            return;
          }

          // Process landmarks if face detected
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            
            // Convert landmarks to Point array
            const points: Point[] = landmarks.map(lm => ({
              x: lm.x,
              y: lm.y,
              z: lm.z
            }));

            // Calculate metrics
            const ear = calculateEAR(points);
            const blinkDetected = detectBlink(ear, EAR_THRESHOLD);
            const faceDistance = estimateFaceDistance(points);
            const headPosition = calculateHeadPosition(points);

            // Create metrics snapshot
            const metrics: MetricsSnapshot = {
              timestamp: Date.now(),
              blinkDetected,
              ear,
              faceDistance,
              headPosition
            };

            // Emit metrics
            onMetricsUpdate(metrics);
          }
        });

        faceMeshRef.current = faceMesh;

        // Initialize camera
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoRef.current && mounted) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;

        // Start camera
        await camera.start();

      } catch (error) {
        console.error('Failed to initialize MediaPipe Face Mesh:', error);
        
        // Determine error type and emit to parent
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            onError?.('permission-denied');
          } else if (error.name === 'NotFoundError') {
            onError?.('no-camera');
          } else if (error.name === 'NotReadableError') {
            onError?.('camera-in-use');
          } else {
            onError?.('mediapipe-load-failed');
          }
        } else {
          onError?.('mediapipe-load-failed');
        }
      }
    };

    initializeMediaPipe();

    // Cleanup function
    return () => {
      mounted = false;

      // Stop camera
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }

      // Close Face Mesh
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }

      // Release video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []); // Empty dependency array - initialize once on mount

  // Hidden video and canvas elements for MediaPipe processing
  // Only render internal video if no external ref provided
  return (
    <div style={{ display: 'none' }}>
      {!externalVideoRef && <video ref={internalVideoRef} />}
      <canvas ref={canvasRef} />
    </div>
  );
}
