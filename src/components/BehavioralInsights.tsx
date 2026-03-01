import React from 'react';

interface BehavioralInsightsProps {
  insights: string[];
}

export const BehavioralInsights: React.FC<BehavioralInsightsProps> = ({ insights }) => {
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Behavioral Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
