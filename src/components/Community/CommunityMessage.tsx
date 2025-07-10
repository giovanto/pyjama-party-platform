/**
 * CommunityMessage Component
 * Displays community formation messages and celebrations
 */

import React from 'react';
import type { CommunityMessageProps } from '../../types';

export function CommunityMessage({ 
  message,
  type = 'info',
  onClose,
  className = '',
  showIcon = true,
  autoClose = true,
  autoCloseDelay = 5000,
}: CommunityMessageProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  if (!isVisible || !message) {
    return null;
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: '🎉',
        };
      case 'celebration':
        return {
          container: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200',
          text: 'text-purple-800',
          icon: '🎪',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: '⚠️',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: '❌',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: '💭',
        };
    }
  };

  const styles = getTypeStyles();

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className={`
      community-message
      ${styles.container} 
      border rounded-lg p-4 mb-4 
      animate-in slide-in-from-top-2 duration-300
      ${className}
    `}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <span className="text-2xl">{styles.icon}</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={`${styles.text} text-sm font-medium`}>
            {message}
          </div>
          
          {type === 'celebration' && (
            <div className="mt-2 flex items-center space-x-1">
              <span className="text-lg">🚂</span>
              <span className="text-lg">💤</span>
              <span className="text-lg">✨</span>
              <span className="text-lg">🎊</span>
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={handleClose}
            className={`
              ${styles.text} 
              hover:opacity-70 
              transition-opacity 
              p-1 
              rounded-md
              focus:outline-none 
              focus:ring-2 
              focus:ring-offset-2 
              focus:ring-blue-500
            `}
            aria-label="Close message"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default CommunityMessage;