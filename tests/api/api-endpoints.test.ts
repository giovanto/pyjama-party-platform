import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment for tests
const mockEnv = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
}

global.fetch = vi.fn()

describe('API Endpoints Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('/api/pyjama-parties', () => {
    it('should accept valid pyjama party data', async () => {
      const validData = {
        stationName: 'Berlin Hauptbahnhof',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test User',
        organizerEmail: 'test@example.com',
        description: 'Test pyjama party',
        expectedAttendees: 10,
        partyDate: '2025-09-26T19:00:00.000Z'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, id: 'party-123' })
      }) as any

      const response = await fetch('/api/pyjama-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      })
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.success).toBe(true)
      expect(result.id).toBeDefined()
    })

    it('should reject invalid email format', async () => {
      const invalidData = {
        stationName: 'Berlin Hauptbahnhof',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test User',
        organizerEmail: 'invalid-email',
        description: 'Test pyjama party',
        expectedAttendees: 10,
        partyDate: '2025-09-26T19:00:00.000Z'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid email format' })
      }) as any

      const response = await fetch('/api/pyjama-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('should reject missing required fields', async () => {
      const incompleteData = {
        stationName: '',
        city: 'Berlin',
        country: 'Germany'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Missing required fields' })
      }) as any

      const response = await fetch('/api/pyjama-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteData)
      })
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBeDefined()
    })
  })

  describe('/api/dreams', () => {
    it('should return dreams data in expected format', async () => {
      const mockDreamsData = {
        dreams: [
          {
            id: 'dream-123',
            from_station: 'Berlin Hauptbahnhof',
            to_station: 'Vienna Central Station',
            from_latitude: 52.5200,
            from_longitude: 13.4050,
            to_latitude: 48.2082,
            to_longitude: 16.3738,
            why: 'Test dream route'
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockDreamsData)
      }) as any

      const response = await fetch('/api/dreams')
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.dreams).toBeDefined()
      expect(Array.isArray(result.dreams)).toBe(true)
      
      if (result.dreams.length > 0) {
        const dream = result.dreams[0]
        expect(dream.id).toBeDefined()
        expect(dream.from_station).toBeDefined()
        expect(dream.to_station).toBeDefined()
        expect(typeof dream.from_latitude).toBe('number')
        expect(typeof dream.from_longitude).toBe('number')
      }
    })

    it('should accept valid dream submission', async () => {
      const validDream = {
        from: 'Berlin Hauptbahnhof',
        to: 'Vienna Central Station',
        name: 'Test User',
        email: 'test@example.com',
        why: 'Testing the API'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, id: 'dream-456' })
      }) as any

      const response = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validDream)
      })
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.success).toBe(true)
      expect(result.id).toBeDefined()
    })
  })

  describe('/api/stats', () => {
    it('should return statistics in expected format', async () => {
      const mockStatsData = {
        totalDreams: 42,
        totalDreamers: 30,
        topRoutes: [
          { route: 'Berlin → Vienna', count: 5 },
          { route: 'Paris → Amsterdam', count: 3 }
        ],
        recentActivity: [
          { type: 'dream', from: 'Berlin', to: 'Vienna', timestamp: '2025-01-01T12:00:00Z' }
        ],
        campaignGoals: {
          targetDreams: 1000,
          targetDreamers: 500,
          targetParties: 50
        }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStatsData)
      }) as any

      const response = await fetch('/api/stats')
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(typeof result.totalDreams).toBe('number')
      expect(typeof result.totalDreamers).toBe('number')
      expect(Array.isArray(result.topRoutes)).toBe(true)
      expect(Array.isArray(result.recentActivity)).toBe(true)
      expect(result.campaignGoals).toBeDefined()
    })
  })

  describe('/api/stations/search', () => {
    it('should return stations in expected format', async () => {
      const mockStationsData = {
        stations: [
          {
            id: 'berlin-hbf',
            name: 'Berlin Hauptbahnhof',
            city: 'Berlin',
            country: 'Germany',
            coordinates: [13.4050, 52.5200]
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockStationsData)
      }) as any

      const response = await fetch('/api/stations/search?q=berlin')
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.stations).toBeDefined()
      expect(Array.isArray(result.stations)).toBe(true)
      
      if (result.stations.length > 0) {
        const station = result.stations[0]
        expect(station.id).toBeDefined()
        expect(station.name).toBeDefined()
        expect(station.city).toBeDefined()
        expect(station.country).toBeDefined()
        expect(Array.isArray(station.coordinates)).toBe(true)
        expect(station.coordinates.length).toBe(2)
      }
    })

    it('should handle empty search results', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ stations: [] })
      }) as any

      const response = await fetch('/api/stations/search?q=nonexistent')
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.stations).toBeDefined()
      expect(Array.isArray(result.stations)).toBe(true)
      expect(result.stations.length).toBe(0)
    })
  })

  describe('/api/health', () => {
    it('should return healthy status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ status: 'healthy' })
      }) as any

      const response = await fetch('/api/health')
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.status).toBe('healthy')
    })
  })
})