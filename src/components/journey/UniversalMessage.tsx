'use client';

import { usePathname } from 'next/navigation';
import { getCurrentPhaseFromPath, getContextualMessage } from '@/lib/phases';

export interface UniversalMessageProps {
  className?: string;
  variant?: 'hero' | 'banner' | 'inline' | 'floating';
  customMessage?: string;
  showIcon?: boolean;
  animated?: boolean;
}

/**
 * UniversalMessage - Prominent messaging component that appears across all pages
 * Adapts message based on current phase and provides consistent call-to-action
 */
export function UniversalMessage({ 
  className = '', 
  variant = 'banner',
  customMessage,
  showIcon = true,
  animated = true
}: UniversalMessageProps) {
  const pathname = usePathname();
  const currentPhase = getCurrentPhaseFromPath(pathname);
  const message = customMessage || getContextualMessage(currentPhase);

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight';
      case 'banner':
        return 'text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight';
      case 'inline':
        return 'text-xl sm:text-2xl font-semibold text-gray-800 leading-tight';
      case 'floating':
        return 'text-lg font-medium text-white leading-tight';
      default:
        return 'text-2xl sm:text-3xl font-bold text-gray-900 leading-tight';
    }
  };

  const getContainerStyles = () => {
    switch (variant) {
      case 'hero':
        return 'text-center mb-6';
      case 'banner':
        return 'text-center mb-6 px-4';
      case 'inline':
        return 'mb-4';
      case 'floating':
        return 'text-center p-4 bg-gradient-to-r from-bot-green/90 to-bot-blue/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg';
      default:
        return 'text-center mb-6 px-4';
    }
  };

  return (
    <div className={`${getContainerStyles()} ${className}`}>
      <h1 className={`${getVariantStyles()} ${animated ? 'animate-in slide-in-from-top duration-700' : ''}`}>
        {showIcon && variant !== 'floating' && (
          <span className="inline-block mr-3 text-current">✨</span>
        )}
        {message}
      </h1>
      
      {/* Contextual subtitle based on phase */}
      {variant === 'hero' && (
        <p className="text-xl sm:text-2xl text-gray-600 mt-4 max-w-4xl mx-auto leading-relaxed">
          {currentPhase ? (
            <>You're in the <span className={`font-semibold ${currentPhase.color}`}>{currentPhase.name}</span> phase of your climate action journey.</>
          ) : (
            <>Start your journey to sustainable travel and climate action across Europe.</>
          )}
        </p>
      )}
      
      {/* Phase indicator for banner variant */}
      {variant === 'banner' && currentPhase && (
        <div className="mt-4">
          <span className={`inline-flex items-center px-4 py-2 ${currentPhase.bgColor} ${currentPhase.color} rounded-full font-medium text-sm border ${currentPhase.borderColor}`}>
            <span className="mr-2">{currentPhase.icon}</span>
            {currentPhase.title}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * UniversalMessageBanner - Sticky banner version for consistent messaging
 */
export function UniversalMessageBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`sticky top-0 z-40 bg-gradient-to-r from-bot-light-green/95 to-bot-green/95 backdrop-blur-md border-b border-bot-green/20 ${className}`}>
      <div className="max-w-7xl mx-auto py-2 px-4">
        <UniversalMessage 
          variant="floating"
          className="max-w-none"
          showIcon={false}
        />
      </div>
    </div>
  );
}

/**
 * UniversalMessageFloating - Floating action variant
 */
export function UniversalMessageFloating({ 
  className = '',
  onClose
}: { 
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="relative">
        <UniversalMessage 
          variant="floating"
          className="max-w-none"
          showIcon={false}
        />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Close message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default UniversalMessage;