'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  PHASES, 
  PHASE_CATEGORIES, 
  getCurrentPhaseFromPath, 
  getJourneyCompletionPercentage,
  getPhasesByCategory,
  type Phase 
} from '@/lib/phases';

export interface PhaseProgressProps {
  currentPhase?: string;
  completedPhases?: string[];
  className?: string;
  variant?: 'full' | 'mini' | 'horizontal' | 'circular';
  showLabels?: boolean;
  showCompletion?: boolean;
  interactive?: boolean;
}

/**
 * PhaseProgress - Shows current phase and completion status in the user journey
 */
export function PhaseProgress({
  currentPhase,
  completedPhases = [],
  className = '',
  variant = 'full',
  showLabels = true,
  showCompletion = true,
  interactive = true
}: PhaseProgressProps) {
  const pathname = usePathname();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Determine current phase from URL if not provided
  const detectedPhase = getCurrentPhaseFromPath(pathname);
  const activePhase = currentPhase || detectedPhase?.id;
  
  const completionPercentage = getJourneyCompletionPercentage(completedPhases);

  const isPhaseCompleted = (phaseId: string) => completedPhases.includes(phaseId);
  const isPhaseActive = (phaseId: string) => phaseId === activePhase;
  const isPhaseAccessible = (phase: Phase) => {
    // First phase is always accessible
    if (phase.order === 1) return true;
    // Phase is accessible if previous phase is completed or it's the current active phase
    const previousPhase = PHASES.find(p => p.order === phase.order - 1);
    return previousPhase ? isPhaseCompleted(previousPhase.id) || isPhaseActive(phase.id) : false;
  };

  if (variant === 'mini') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {PHASES.map((phase, index) => (
          <div key={phase.id} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 transition-colors duration-200 ${
                isPhaseCompleted(phase.id)
                  ? 'bg-green-500 border-green-500'
                  : isPhaseActive(phase.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-gray-200 border-gray-300'
              }`}
              title={phase.title}
            />
            {index < PHASES.length - 1 && (
              <div className={`w-8 h-px ${isPhaseCompleted(phase.id) ? 'bg-green-300' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
        {showCompletion && (
          <span className="text-sm text-gray-600 ml-2">{completionPercentage}%</span>
        )}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`w-full ${className}`}>
        {showCompletion && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Journey Progress</h3>
            <span className="text-sm font-medium text-gray-600">{completionPercentage}% Complete</span>
          </div>
        )}
        
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full transform -translate-y-1/2" />
          
          {/* Progress bar fill */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-bot-green to-bot-blue rounded-full transform -translate-y-1/2 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
          
          {/* Phase indicators */}
          <div className="flex justify-between relative">
            {PHASES.map((phase) => (
              <div key={phase.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-200 ${
                    isPhaseCompleted(phase.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : isPhaseActive(phase.id)
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isPhaseAccessible(phase)
                      ? 'bg-white border-gray-400 text-gray-600 hover:border-gray-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isPhaseCompleted(phase.id) ? '✓' : phase.icon}
                </div>
                {showLabels && (
                  <span className={`text-xs font-medium mt-2 text-center max-w-16 ${
                    isPhaseActive(phase.id) ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {phase.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="text-bot-green transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant with categories
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Your Climate Action Journey</h3>
        {showCompletion && (
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-bot-green to-bot-blue rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{completionPercentage}%</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(PHASE_CATEGORIES).map(([categoryKey, category]) => {
          const categoryPhases = getPhasesByCategory(categoryKey as any);
          const categoryCompleted = categoryPhases.filter(phase => isPhaseCompleted(phase.id)).length;
          const isExpanded = expandedCategory === categoryKey;

          return (
            <div key={categoryKey} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : categoryKey)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${category.bgColor} ${category.color}`} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{categoryCompleted}/{categoryPhases.length}</span>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  {categoryPhases.map((phase) => (
                    <div key={phase.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                            isPhaseCompleted(phase.id)
                              ? 'bg-green-500 border-green-500 text-white'
                              : isPhaseActive(phase.id)
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : isPhaseAccessible(phase)
                              ? `${phase.bgColor} ${phase.borderColor} ${phase.color}`
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }`}
                        >
                          {isPhaseCompleted(phase.id) ? '✓' : phase.icon}
                        </div>
                        <div>
                          <h5 className={`font-medium ${isPhaseActive(phase.id) ? 'text-blue-600' : 'text-gray-900'}`}>
                            {phase.title}
                          </h5>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                      
                      {interactive && isPhaseAccessible(phase) && (
                        <Link
                          href={phase.href}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            isPhaseActive(phase.id)
                              ? 'bg-blue-100 text-blue-700'
                              : isPhaseCompleted(phase.id)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isPhaseCompleted(phase.id) ? 'Review' : isPhaseActive(phase.id) ? 'Continue' : 'Start'}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PhaseProgress;