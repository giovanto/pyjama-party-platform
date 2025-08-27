'use client';

import { useState, useEffect } from 'react';
import { getCountdownTargetDate, EVENT_NAME, formatEventDateForBanner } from '@/lib/event';

interface TimeLeft {
  days: number;
}

export function EventBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0 });

  useEffect(() => {
    const targetDate = getCountdownTargetDate();
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        setTimeLeft({ days });
      } else {
        setTimeLeft({ days: 0 });
      }
    };
    
    // Update immediately and then every hour (port V1 logic)
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="event-banner bg-gradient-to-r from-bot-green to-bot-blue text-white py-4 animate-pulse-soft">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
          <span className="text-lg font-medium" aria-label={`${EVENT_NAME} date and time`}>
            🎉 {EVENT_NAME} — {formatEventDateForBanner()}
          </span>
          <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="font-mono text-xl font-bold">
              {timeLeft.days.toString().padStart(3, '0')} days left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
