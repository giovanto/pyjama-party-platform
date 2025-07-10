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
      <div className="inline-block bg-white bg-opacity-20 rounded-lg px-4 py-2">
        <span className="countdown-item">
          <span className="countdown-number text-lg font-bold mr-1">
            {formattedDays}
          </span>
          <span className="countdown-label text-sm font-medium">
            days to go
          </span>
        </span>
      </div>
    </div>
  );
}