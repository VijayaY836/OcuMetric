import React from 'react';

export const PrivacyBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 md:px-4 bg-green-50 border border-green-200 rounded-full text-xs md:text-sm text-green-700">
      <svg 
        className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
        />
      </svg>
      <span className="font-medium whitespace-nowrap">Local Processing • No Data Stored</span>
    </div>
  );
};
