import React from 'react';
import { AppContextProvider, useAppContext } from './context/AppContext';
import { LandingScreen } from './components/LandingScreen';
import { CalibrationScreen } from './components/CalibrationScreen';
import { AssessmentScreen } from './components/AssessmentScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const {
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
  } = useAppContext();

  return (
    <>
      {currentScreen === 'landing' && (
        <LandingScreen
          dyslexicMode={dyslexicMode}
          onDyslexicModeChange={setDyslexicMode}
          onStartAssessment={startAssessment}
        />
      )}

      {currentScreen === 'calibration' && (
        <CalibrationScreen
          onCalibrationComplete={() => setCurrentScreen('assessment')}
        />
      )}

      {currentScreen === 'assessment' && (
        <AssessmentScreen
          dyslexicMode={dyslexicMode}
          cameraPreviewVisible={cameraPreviewVisible}
          onCameraPreviewChange={setCameraPreviewVisible}
          onAssessmentComplete={completeAssessment}
          onBack={resetAssessment}
        />
      )}

      {currentScreen === 'results' && results && assessmentData && (
        <ResultsScreen
          results={results}
          assessmentData={assessmentData}
          onStartNewAssessment={resetAssessment}
        />
      )}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;
