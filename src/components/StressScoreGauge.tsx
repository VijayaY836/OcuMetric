import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getStressLevel, getStressColor, ANIMATION_DURATIONS } from '../constants';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StressScoreGaugeProps {
  score: number;
}

export const StressScoreGauge: React.FC<StressScoreGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    const duration = ANIMATION_DURATIONS.GAUGE_ANIMATION;
    const steps = 60;
    const increment = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [score]);

  const stressLevel = getStressLevel(score);
  const color = getStressColor(score);

  // Fallback UI if Chart.js fails
  if (chartError) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-center">
          <div className="text-7xl font-bold mb-2" style={{ color }}>
            {animatedScore}
          </div>
          <div className="text-xl text-gray-600 uppercase tracking-wide">
            {stressLevel} Stress
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Score: 0-100
          </div>
        </div>
      </div>
    );
  }

  const data = {
    datasets: [
      {
        data: [animatedScore, 100 - animatedScore],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  try {
    return (
      <div className="flex items-center justify-center gap-8">
        <div className="relative w-96 h-48">
          <Doughnut data={data} options={options} />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="text-8xl font-bold leading-none" style={{ color }}>
            {animatedScore}
          </div>
          <div className="text-lg text-gray-500 uppercase tracking-wider font-semibold">
            {stressLevel} Stress
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Chart.js rendering error:', error);
    setChartError(true);
    return null;
  }
};
