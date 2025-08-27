import { describe, it, expect } from 'vitest'
import { EVENT_DATE_UTC, getDaysToEvent, formatEventDateForBanner } from '@/lib/event'

describe('event constants/helpers', () => {
  it('formats banner date correctly', () => {
    const str = formatEventDateForBanner()
    expect(str).toMatch(/September 26, 2025/)
    expect(str).toMatch(/19:00–20:00 CEST/)
  })

  it('computes non-negative days to event', () => {
    const now = new Date(EVENT_DATE_UTC.getTime() - 24 * 60 * 60 * 1000) // 1 day before
    const days = getDaysToEvent(now)
    expect(days).toBeGreaterThan(0)
  })

  it('returns 0 days after event', () => {
    const after = new Date(EVENT_DATE_UTC.getTime() + 24 * 60 * 60 * 1000)
    expect(getDaysToEvent(after)).toBe(0)
  })
})

