import React from 'react';
import { StressScoreGauge } from './StressScoreGauge';
import { MetricsChart } from './MetricsChart';
import { PhaseComparisonChart } from './PhaseComparisonChart';
import type { AssessmentResults, AssessmentData } from '../types';

interface ResultsScreenProps {
  results: AssessmentResults;
  assessmentData: AssessmentData;
  onStartNewAssessment: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  results,
  assessmentData,
  onStartNewAssessment
}) => {
  const getInterpretation = (classification: string): string => {
    if (classification === 'Low') {
      return 'Mild visual fatigue detected.';
    } else if (classification === 'Moderate') {
      return 'Moderate strain response under increased visual demand.';
    } else {
      return 'High strain indicators observed during reduced font phase.';
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate phase blinks
  const phase1Blinks = assessmentData.blinkEvents.filter(t => t - assessmentData.startTime < 10000).length;
  const phase2Blinks = assessmentData.blinkEvents.filter(t => {
    const elapsed = t - assessmentData.startTime;
    return elapsed >= 10000 && elapsed < 20000;
  }).length;
  const phase3Blinks = assessmentData.blinkEvents.filter(t => t - assessmentData.startTime >= 20000).length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Session Summary</h1>
              <p className="text-base text-gray-600">30-Second Structured Reading Assessment</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <p className="text-sm font-medium text-gray-700">{formatDate(results.timestamp)}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-emerald-700">Local Processing Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Result - Enhanced with gradient background */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">OcuMetric Stress Score</h2>
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <StressScoreGauge score={results.stressScore} />
              </div>
            </div>
            <p className="text-xl text-gray-700 mt-8 text-center max-w-md font-medium">
              {getInterpretation(results.classification)}
            </p>
          </div>
        </div>

        {/* Metric Breakdown - Enhanced cards with icons and better spacing */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Metric Breakdown</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blink Behavior - Enhanced */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👁</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Blink Behavior</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600 font-medium">Baseline Rate:</span>
                  <span className="font-bold text-gray-900">{results.metrics.baselineBlinkRate.toFixed(1)} /min</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600 font-medium">Test Rate:</span>
                  <span className="font-bold text-gray-900">{results.metrics.testBlinkRate.toFixed(1)} /min</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Change:</span>
                  <span className={`font-bold text-lg ${results.metrics.blinkChangePercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {results.metrics.blinkChangePercent > 0 ? '+' : ''}{results.metrics.blinkChangePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  {results.metrics.blinkChangePercent < -30 
                    ? "Blink suppression increased as font size decreased."
                    : "Blink rate remained relatively stable."}
                </p>
              </div>
            </div>

            {/* Viewing Distance - Enhanced */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📏</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Viewing Distance</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                  <span className="text-gray-600 font-medium">Category:</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                    results.metrics.avgDistance > 0.7 ? 'bg-red-100 text-red-700' :
                    results.metrics.avgDistance > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {results.metrics.avgDistance > 0.7 ? 'Close' : results.metrics.avgDistance > 0.4 ? 'Moderate' : 'Safe'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Trend:</span>
                  <span className="font-bold text-gray-900">{results.metrics.distanceTrend}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100">
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  {results.metrics.distanceTrend === 'Reduced' 
                    ? "User moved closer during high-demand phase."
                    : results.metrics.distanceTrend === 'Inconsistent'
                    ? "Distance varied throughout assessment."
                    : "Viewing distance remained stable."}
                </p>
              </div>
            </div>

            {/* Focus Stability - Enhanced */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Focus Stability</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                  <span className="text-gray-600 font-medium">Head Movement:</span>
                  <span className="font-bold text-gray-900">
                    {results.metrics.headMovementVariance > 0.05 ? 'High' : results.metrics.headMovementVariance > 0.02 ? 'Moderate' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Focus Pattern:</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-xs ${
                    results.metrics.focusStability === 'Rigid' ? 'bg-red-100 text-red-700' :
                    results.metrics.focusStability === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {results.metrics.focusStability}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-100">
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  {results.metrics.focusStability === 'Rigid'
                    ? "Sustained fixation without micro-breaks detected."
                    : "Focus pattern within normal range."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Analytics - NEW SECTION WITH GRAPHS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Analytics</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Blink Rate Over Time */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Eye Aspect Ratio Over Time
              </h3>
              <MetricsChart 
                data={assessmentData.earValues}
                label="EAR"
                color="rgb(59, 130, 246)"
                yAxisLabel="Eye Aspect Ratio"
              />
              <p className="text-xs text-gray-600 mt-3 italic">
                Lower values indicate blinks or eye closure
              </p>
            </div>

            {/* Phase Comparison */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Blink Count by Font Size Phase
              </h3>
              <PhaseComparisonChart 
                phase1Blinks={phase1Blinks}
                phase2Blinks={phase2Blinks}
                phase3Blinks={phase3Blinks}
              />
              <p className="text-xs text-gray-600 mt-3 italic">
                Comparison across progressive font size reduction
              </p>
            </div>
          </div>
        </div>

        {/* Risk Indicator Summary - Enhanced table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Indicator Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-bold text-gray-700 text-sm uppercase tracking-wide">Indicator</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 text-sm uppercase tracking-wide">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 text-sm uppercase tracking-wide">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-700 font-medium">Blink Suppression</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold ${
                      results.metrics.blinkChangePercent < -50 ? 'bg-red-100 text-red-700 border border-red-200' :
                      results.metrics.blinkChangePercent < -20 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {results.metrics.blinkChangePercent < -50 ? 'Elevated' :
                       results.metrics.blinkChangePercent < -20 ? 'Mild' : 'Normal'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{results.metrics.blinkChangePercent.toFixed(1)}% change</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-700 font-medium">Distance Compression</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold ${
                      results.metrics.avgDistance > 0.7 ? 'bg-red-100 text-red-700 border border-red-200' :
                      results.metrics.avgDistance > 0.5 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {results.metrics.avgDistance > 0.7 ? 'Elevated' :
                       results.metrics.avgDistance > 0.5 ? 'Mild' : 'Normal'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{results.metrics.distanceTrend}</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 text-gray-700 font-medium">Focus Rigidity</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold ${
                      results.metrics.focusStability === 'Rigid' ? 'bg-red-100 text-red-700 border border-red-200' :
                      results.metrics.focusStability === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {results.metrics.focusStability === 'Rigid' ? 'Elevated' :
                       results.metrics.focusStability === 'Moderate' ? 'Moderate' : 'Normal'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">{results.metrics.focusStability} pattern</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavioral Insights - Enhanced */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border border-blue-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Behavioral Observations</h2>
          <div className="space-y-3">
            {results.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations - Enhanced */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg border border-purple-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommendations</h2>
          <div className="space-y-3">
            {results.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold">→</span>
                </div>
                <span className="text-gray-700 text-sm leading-relaxed">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button - Enhanced */}
        <div className="flex justify-center pt-6">
          <button
            onClick={onStartNewAssessment}
            className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Start New Assessment
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Ethical Disclaimer - Enhanced */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full border border-gray-200">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 font-medium">Prototype screening tool. Not a diagnostic medical device.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
