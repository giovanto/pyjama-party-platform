'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  className?: string;
}

export function Countdown({ targetDate, className = '' }: CountdownProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = targetDate.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      setDaysLeft(days);
    };

    // Update immediately
    updateCountdown();

    // Update every hour (like V1)
    const interval = setInterval(updateCountdown, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Format as 3-digit number like V1
  const formattedDays = String(daysLeft).padStart(3, '0');

  return (
    <div className={`countdown-container ${className}`}>
      <div className="inline-block bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
        <span className="countdown-item flex flex-col items-center">
          <span className="countdown-number text-3xl font-bold text-bot-green mb-1">
            {formattedDays}
          </span>
          <span className="countdown-label text-sm font-semibold text-gray-700 uppercase tracking-wide">
            days to go
          </span>
        </span>
      </div>
    </div>
  );
}