import React from 'react';

interface DyslexicModeToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const DyslexicModeToggle: React.FC<DyslexicModeToggleProps> = ({ enabled, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Dyslexic Mode</span>
        <button
          onClick={() => onChange(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
            enabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      {enabled && (
        <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-medium animate-fade-in">
          Dyslexic Mode Active
        </div>
      )}
    </div>
  );
};
