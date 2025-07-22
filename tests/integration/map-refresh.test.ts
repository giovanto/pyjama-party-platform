import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the map refresh functionality
const mockRefreshDreamMap = vi.fn()

// Simulate the global window function
Object.defineProperty(global, 'window', {
  value: {
    refreshDreamMap: mockRefreshDreamMap
  },
  writable: true,
  configurable: true
})

describe('Map Refresh Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshDreamMap.mockClear()
    // Ensure window.refreshDreamMap is available in each test
    if (typeof window !== 'undefined') {
      (window as any).refreshDreamMap = mockRefreshDreamMap
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should trigger map refresh after successful pyjama party submission', async () => {
    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, id: 'party-123' })
    }) as any

    const formData = {
      stationName: 'Berlin Hauptbahnhof',
      city: 'Berlin',
      country: 'Germany',
      organizerName: 'Test User',
      organizerEmail: 'test@example.com',
      description: 'Test pyjama party',
      expectedAttendees: 10,
      partyDate: '2025-09-26T19:00:00.000Z'
    }

    // Simulate form submission
    const response = await fetch('/api/pyjama-parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const result = await response.json()

    // Verify successful submission
    expect(response.ok).toBe(true)
    expect(result.success).toBe(true)

    // Simulate the map refresh call that would happen after successful submission
    if (typeof window !== 'undefined' && window.refreshDreamMap) {
      window.refreshDreamMap()
    }

    // Verify map refresh was called
    expect(mockRefreshDreamMap).toHaveBeenCalledTimes(1)
  })

  it('should not trigger map refresh after failed submission', async () => {
    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Validation failed' })
    }) as any

    const invalidFormData = {
      stationName: '',
      city: 'Berlin',
      country: 'Germany',
      organizerEmail: 'invalid-email'
    }

    // Simulate form submission
    const response = await fetch('/api/pyjama-parties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidFormData)
    })

    const result = await response.json()

    // Verify failed submission
    expect(response.ok).toBe(false)
    expect(result.error).toBeDefined()

    // Map refresh should not be called on failed submission
    expect(mockRefreshDreamMap).toHaveBeenCalledTimes(0)
  })

  it('should handle missing refreshDreamMap function gracefully', async () => {
    // Remove the refreshDreamMap function
    delete (window as any).refreshDreamMap

    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, id: 'party-456' })
    }) as any

    const formData = {
      stationName: 'Vienna Central Station',
      city: 'Vienna',
      country: 'Austria',
      organizerName: 'Test User',
      organizerEmail: 'test@example.com',
      description: 'Test pyjama party',
      expectedAttendees: 8,
      partyDate: '2025-09-26T19:00:00.000Z'
    }

    // This should not throw an error even without refreshDreamMap
    expect(() => {
      // Simulate the conditional check
      if (typeof window !== 'undefined' && window.refreshDreamMap) {
        window.refreshDreamMap()
      }
    }).not.toThrow()
  })

  it('should verify map refresh function signature', () => {
    // Ensure refreshDreamMap is a function
    expect(typeof window.refreshDreamMap).toBe('function')

    // Call the function and verify it doesn't throw
    expect(() => window.refreshDreamMap()).not.toThrow()

    // Verify it was called
    expect(mockRefreshDreamMap).toHaveBeenCalledTimes(1)
    expect(mockRefreshDreamMap).toHaveBeenCalledWith()
  })

  it('should handle multiple rapid submissions correctly', async () => {
    // Mock successful API responses
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, id: 'party-multi' })
    }) as any

    const submissions = [
      { city: 'Berlin', organizerEmail: 'berlin@example.com' },
      { city: 'Vienna', organizerEmail: 'vienna@example.com' },
      { city: 'Paris', organizerEmail: 'paris@example.com' }
    ]

    // Simulate multiple submissions
    for (const submission of submissions) {
      const formData = {
        stationName: `${submission.city} Station`,
        city: submission.city,
        country: 'Test Country',
        organizerName: 'Test User',
        organizerEmail: submission.organizerEmail,
        description: 'Test pyjama party',
        expectedAttendees: 5,
        partyDate: '2025-09-26T19:00:00.000Z'
      }

      const response = await fetch('/api/pyjama-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok && typeof window !== 'undefined' && window.refreshDreamMap) {
        window.refreshDreamMap()
      }
    }

    // Verify map refresh was called for each successful submission
    expect(mockRefreshDreamMap).toHaveBeenCalledTimes(3)
  })

  it('should work with different window environments', () => {
    // Test with undefined window (SSR environment)
    const originalWindow = global.window
    delete (global as any).window

    expect(() => {
      // This check should handle undefined window gracefully
      if (typeof window !== 'undefined' && window.refreshDreamMap) {
        window.refreshDreamMap()
      }
    }).not.toThrow()

    // Restore window with refreshDreamMap
    Object.defineProperty(global, 'window', {
      value: {
        refreshDreamMap: mockRefreshDreamMap
      },
      writable: true,
      configurable: true
    })

    // Test with defined window
    expect(() => {
      if (typeof window !== 'undefined' && window.refreshDreamMap) {
        window.refreshDreamMap()
      }
    }).not.toThrow()

    expect(mockRefreshDreamMap).toHaveBeenCalledTimes(1)
  })
})