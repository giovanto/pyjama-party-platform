// Centralized event metadata and helpers for the European Pajama Party

export const EVENT_NAME = 'European Pajama Party';

// Canonical UTC time for the synchronized 19:00–20:00 CEST action
// 19:00 CEST = 17:00 UTC
export const EVENT_DATE_UTC_ISO = '2025-09-26T17:00:00Z';
export const EVENT_DATE_UTC = new Date(EVENT_DATE_UTC_ISO);

export const EVENT_DATE_DISPLAY = 'September 26, 2025';
export const EVENT_TIME_DISPLAY = '19:00–20:00 CEST';
export const EVENT_SIGNUP_ANCHOR = '#signup-form';

export function getCountdownTargetDate(): Date {
  return EVENT_DATE_UTC;
}

export function getDaysToEvent(now: Date = new Date(), target: Date = EVENT_DATE_UTC): number {
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatEventDateForBanner(): string {
  return `${EVENT_DATE_DISPLAY} • ${EVENT_TIME_DISPLAY}`;
}

