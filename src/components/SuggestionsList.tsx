import React from 'react';

interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions }) => {
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
