import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AssessmentData, AssessmentResults } from '../types';
import { calculateStressScore } from '../utils/stressScore';
import { generateInsights } from '../utils/insightGenerator';
import { generateSuggestions } from '../utils/suggestionGenerator';

interface AppContextType extends AppState {
  setCurrentScreen: (screen: AppState['currentScreen']) => void;
  setDyslexicMode: (enabled: boolean) => void;
  setCameraPreviewVisible: (visible: boolean) => void;
  startAssessment: () => void;
  completeAssessment: (data: AssessmentData) => void;
  resetAssessment: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppState['currentScreen']>('landing');
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [cameraPreviewVisible, setCameraPreviewVisible] = useState(true);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [results, setResults] = useState<AssessmentResults | null>(null);

  const startAssessment = () => {
    // Reset previous data
    setAssessmentData(null);
    setResults(null);
    setCurrentScreen('calibration');
  };

  const completeAssessment = (data: AssessmentData) => {
    setAssessmentData(data);
    
    // Calculate results
    const stressScore = calculateStressScore(data);
    const insights = generateInsights(data);
    const suggestions = generateSuggestions(data, stressScore);
    
    // Calculate enhanced metrics
    const phase1Blinks = data.blinkEvents.filter(t => t - data.startTime < 10000).length;
    const phase3Blinks = data.blinkEvents.filter(t => t - data.startTime >= 20000).length;
    
    const baselineBlinkRate = (phase1Blinks / 10) * 60; // Blinks per minute
    const testBlinkRate = (data.blinkEvents.length / 30) * 60; // Blinks per minute
    const blinkChangePercent = phase1Blinks > 0 
      ? ((phase3Blinks - phase1Blinks) / phase1Blinks) * 100 
      : 0;
    
    const avgDistance = data.faceDistances.reduce((a, b) => a + b, 0) / data.faceDistances.length;
    const distanceVariance = calculateVariance(data.faceDistances);
    
    let distanceTrend: 'Stable' | 'Reduced' | 'Inconsistent' = 'Stable';
    if (distanceVariance > 0.05) distanceTrend = 'Inconsistent';
    else if (avgDistance > 0.7) distanceTrend = 'Reduced';
    
    const earVariance = calculateVariance(data.earValues);
    let focusStability: 'Stable' | 'Moderate' | 'Rigid' = 'Stable';
    if (earVariance < 0.01) focusStability = 'Rigid';
    else if (earVariance < 0.05) focusStability = 'Moderate';
    
    const headMovementVariance = calculateMovementVariance(data.headMovements);
    
    // Determine classification
    let classification: 'Low' | 'Moderate' | 'High' = 'Low';
    if (stressScore > 66) classification = 'High';
    else if (stressScore > 33) classification = 'Moderate';
    
    const assessmentResults: AssessmentResults = {
      stressScore,
      classification,
      insights,
      suggestions,
      metrics: {
        baselineBlinkRate,
        testBlinkRate,
        blinkChangePercent,
        avgDistance,
        distanceTrend,
        focusStability,
        headMovementVariance
      },
      timestamp: new Date().toISOString()
    };
    
    setResults(assessmentResults);
    setCurrentScreen('results');
  };

  // Helper functions
  const calculateVariance = (values: number[]): number => {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  };

  const calculateMovementVariance = (movements: { x: number; y: number }[]): number => {
    if (movements.length < 2) return 0;
    let totalMovement = 0;
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
    }
    return totalMovement / (movements.length - 1);
  };

  const resetAssessment = () => {
    setAssessmentData(null);
    setResults(null);
    setCurrentScreen('landing');
  };

  const value: AppContextType = {
    currentScreen,
    dyslexicMode,
    cameraPreviewVisible,
    assessmentData,
    results,
    setCurrentScreen,
    setDyslexicMode,
    setCameraPreviewVisible,
    startAssessment,
    completeAssessment,
    resetAssessment
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
