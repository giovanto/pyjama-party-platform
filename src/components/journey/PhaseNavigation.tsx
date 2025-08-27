'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  PHASES, 
  getCurrentPhaseFromPath, 
  getNextPhase, 
  getPreviousPhase,
  type Phase 
} from '@/lib/phases';

export interface PhaseNavigationProps {
  currentPhase?: string;
  completedPhases?: string[];
  previousPhase?: { name: string; href: string };
  nextPhase?: { name: string; href: string };
  className?: string;
  variant?: 'full' | 'arrows' | 'breadcrumb' | 'floating';
  showAllPhases?: boolean;
  showNextSteps?: boolean;
}

/**
 * PhaseNavigation - Provides cross-phase navigation between all routes
 */
export function PhaseNavigation({
  currentPhase,
  completedPhases = [],
  previousPhase,
  nextPhase,
  className = '',
  variant = 'full',
  showAllPhases = false,
  showNextSteps = true
}: PhaseNavigationProps) {
  const pathname = usePathname() || '/';
  
  // Auto-detect current phase if not provided
  const detectedPhase = getCurrentPhaseFromPath(pathname);
  const activePhaseId = currentPhase || detectedPhase?.id;
  const activePhase = PHASES.find(phase => phase.id === activePhaseId);
  
  // Auto-detect previous and next phases if not provided
  const autoPreviousPhase = activePhaseId ? getPreviousPhase(activePhaseId) : undefined;
  const autoNextPhase = activePhaseId ? getNextPhase(activePhaseId) : undefined;
  
  const prevPhase = previousPhase ? { 
    name: previousPhase.name, 
    href: previousPhase.href,
    phase: PHASES.find(p => p.href === previousPhase.href)
  } : autoPreviousPhase ? {
    name: autoPreviousPhase.name,
    href: autoPreviousPhase.href,
    phase: autoPreviousPhase
  } : null;
  
  const next = nextPhase ? { 
    name: nextPhase.name, 
    href: nextPhase.href,
    phase: PHASES.find(p => p.href === nextPhase.href)
  } : autoNextPhase ? {
    name: autoNextPhase.name,
    href: autoNextPhase.href,
    phase: autoNextPhase
  } : null;

  const isPhaseCompleted = (phaseId: string) => completedPhases.includes(phaseId);
  const isPhaseActive = (phaseId: string) => phaseId === activePhaseId;

  if (variant === 'arrows') {
    return (
      <div className={`flex justify-between items-center ${className}`}>
        {prevPhase ? (
          <Link
            href={prevPhase.href}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">{prevPhase.name}</span>
          </Link>
        ) : (
          <div />
        )}

        {activePhase && (
          <div className={`flex items-center space-x-2 px-4 py-2 ${activePhase.bgColor} ${activePhase.color} rounded-full border ${activePhase.borderColor}`}>
            <span>{activePhase.icon}</span>
            <span className="font-medium">{activePhase.name}</span>
          </div>
        )}

        {next ? (
          <Link
            href={next.href}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <span className="font-medium">{next.name}</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    );
  }

  if (variant === 'breadcrumb') {
    return (
      <nav className={`flex ${className}`} aria-label="Phase breadcrumb">
        <ol className="flex items-center space-x-1 md:space-x-3">
          {PHASES.slice(0, activePhase ? activePhase.order : 1).map((phase, index) => (
            <li key={phase.id}>
              <div className="flex items-center">
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400 mr-1 md:mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <Link
                  href={phase.href}
                  className={`text-sm font-medium transition-colors ${
                    isPhaseActive(phase.id)
                      ? `${phase.color}`
                      : isPhaseCompleted(phase.id)
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1">{phase.icon}</span>
                  {phase.name}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {prevPhase && (
              <Link
                href={prevPhase.href}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                title={`Previous: ${prevPhase.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            
            {activePhase && (
              <div className={`px-3 py-2 ${activePhase.bgColor} ${activePhase.color} rounded-lg border ${activePhase.borderColor}`}>
                <div className="flex items-center space-x-2">
                  <span>{activePhase.icon}</span>
                  <span className="text-sm font-medium">{activePhase.name}</span>
                </div>
              </div>
            )}
            
            {next && (
              <Link
                href={next.href}
                className="w-10 h-10 rounded-lg bg-bot-green hover:bg-bot-dark-green text-white flex items-center justify-center transition-colors"
                title={`Next: ${next.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="space-y-6">
        {/* Current Phase Header */}
        {activePhase && (
          <div className="text-center">
            <div className={`inline-flex items-center px-6 py-3 ${activePhase.bgColor} ${activePhase.color} rounded-full border-2 ${activePhase.borderColor} shadow-sm`}>
              <span className="text-2xl mr-3">{activePhase.icon}</span>
              <div className="text-left">
                <h3 className="font-bold text-lg">{activePhase.title}</h3>
                <p className="text-sm opacity-90">{activePhase.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          {prevPhase ? (
            <Link
              href={prevPhase.href}
              className="group flex items-center space-x-3 bg-white hover:bg-gray-50 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors shadow-sm"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Previous</p>
                <p className="font-semibold text-gray-900">{prevPhase.name}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={next.href}
              className="group flex items-center space-x-3 bg-gradient-to-r from-bot-green to-bot-blue hover:from-bot-dark-green hover:to-bot-blue text-white px-4 py-3 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <div>
                <p className="text-sm text-white/80">Next</p>
                <p className="font-semibold">{next.name}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* All Phases Overview */}
        {showAllPhases && (
          <div className="pt-4 border-t border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Complete Journey</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PHASES.map((phase) => (
                <Link
                  key={phase.id}
                  href={phase.href}
                  className={`flex items-center space-x-2 p-2 rounded-lg text-sm font-medium transition-colors ${
                    isPhaseActive(phase.id)
                      ? `${phase.bgColor} ${phase.color} border ${phase.borderColor}`
                      : isPhaseCompleted(phase.id)
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{phase.icon}</span>
                  <span className="truncate">{phase.name}</span>
                  {isPhaseCompleted(phase.id) && (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps Guidance */}
        {showNextSteps && next && (
          <div className="bg-gradient-to-r from-bot-light-green/20 to-bot-green/20 rounded-lg p-4 border border-bot-green/30">
            <h4 className="font-semibold text-bot-dark-green mb-2">Next Step</h4>
            <p className="text-sm text-gray-700">
              Ready to move forward? Your next phase is <strong>{next.name}</strong> where you'll {next.phase?.description?.toLowerCase()}.
            </p>
            <Link
              href={next.href}
              className="inline-flex items-center text-bot-green hover:text-bot-dark-green font-medium text-sm mt-2 transition-colors"
            >
              Continue to {next.name}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseNavigation;
