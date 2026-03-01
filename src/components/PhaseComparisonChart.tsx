import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PhaseComparisonChartProps {
  phase1Blinks: number;
  phase2Blinks: number;
  phase3Blinks: number;
}

export const PhaseComparisonChart: React.FC<PhaseComparisonChartProps> = ({
  phase1Blinks,
  phase2Blinks,
  phase3Blinks
}) => {
  const chartData = {
    labels: ['Phase 1\n(Large Font)', 'Phase 2\n(Medium Font)', 'Phase 3\n(Small Font)'],
    datasets: [
      {
        label: 'Blinks',
        data: [phase1Blinks, phase2Blinks, phase3Blinks],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context: any) {
            return `Blinks: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Blink Count',
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    }
  };

  return (
    <div className="h-48">
      <Bar data={chartData} options={options} />
    </div>
  );
};
