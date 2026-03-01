import React from 'react';
import { PHASE_BOUNDARIES } from '../constants';

interface CountdownTimerProps {
  elapsedTime: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ elapsedTime }) => {
  const remainingTime = Math.max(0, PHASE_BOUNDARIES.ASSESSMENT_DURATION - elapsedTime);
  const seconds = Math.ceil(remainingTime);

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center border-2 border-gray-200 z-10">
      <div className="text-center">
        <div className="text-xl md:text-2xl font-bold text-gray-800">{seconds}</div>
        <div className="text-xs text-gray-500">sec</div>
      </div>
    </div>
  );
};
