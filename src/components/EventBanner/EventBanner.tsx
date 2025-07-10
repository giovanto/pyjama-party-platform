/**
 * EventBanner Component
 * Displays Europe-wide pajama party event information with countdown timer
 */

import React, { useState, useEffect } from 'react';

export interface EventBannerProps {
  className?: string;
  eventDate?: Date;
  onJoinClick?: () => void;
}

export function EventBanner({ 
  className = '',
  eventDate = new Date('2025-09-26T00:00:00Z'),
  onJoinClick 
}: EventBannerProps) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        setDaysLeft(days);
      } else {
        setDaysLeft(0);
      }
    };

    // Update immediately and then every hour
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, [eventDate]);

  const handleJoinClick = () => {
    onJoinClick?.();
    // Scroll to community section
    const communitySection = document.getElementById('community');
    if (communitySection) {
      communitySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`event-banner ${className}`}>
      <div className="event-banner__content">
        <h2 className="event-banner__title">🎉 Europe-Wide Pajama Party</h2>
        <p className="event-banner__date">September 26, 2025</p>
        <p className="event-banner__description">
          Join thousands across Europe for synchronized pajama parties at train stations. 
          Your dream becomes part of a continental movement for night trains!
        </p>
        
        <div className="event-banner__countdown">
          <div className="countdown-item">
            <span className="countdown-number">{daysLeft.toString().padStart(3, '0')}</span>
            <span className="countdown-label">days left</span>
          </div>
        </div>
        
        <button
          onClick={handleJoinClick}
          className="event-banner__cta"
        >
          Join the Movement
        </button>
      </div>
    </div>
  );
}

export default EventBanner;