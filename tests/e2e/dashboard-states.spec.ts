import { test, expect } from '@playwright/test'

// Helpers to mock API responses for dashboard
const successMocks = {
  dreams: {
    total: 3,
    dreams: [
      { id: '1', created_at: new Date().toISOString() },
      { id: '2', created_at: new Date().toISOString() },
      { id: '3', created_at: new Date(Date.now() - 3600_000).toISOString() },
    ],
  },
  growth: {
    chartData: [
      { date: '2025-08-20', formattedDate: 'Aug 20', weekday: 'Wed', dreams: 2, participants: 1, cumulativeDreams: 2, cumulativeParticipants: 1 },
      { date: '2025-08-21', formattedDate: 'Aug 21', weekday: 'Thu', dreams: 3, participants: 2, cumulativeDreams: 5, cumulativeParticipants: 3 },
    ],
    metrics: {
      totalDreams: 5,
      totalParticipants: 3,
      last7Days: 5,
      weeklyGrowthRate: 10,
      peakDay: { date: 'Aug 21', dreams: 3 },
      averageDailyDreams: 2,
      participationRate: 40,
    },
    lastUpdated: new Date().toISOString(),
  },
  popular: {
    popularRoutes: [
      { route: 'Berlin → Vienna', from: 'Berlin, Germany', to: 'Vienna, Austria', dreamCount: 10, percentage: 20 },
      { route: 'Paris → Amsterdam', from: 'Paris, France', to: 'Amsterdam, Netherlands', dreamCount: 8, percentage: 16 },
    ],
    popularDestinations: [{ city: 'Vienna, Austria', dreamCount: 12 }],
    popularOrigins: [{ city: 'Berlin, Germany', dreamCount: 14 }],
    totalRoutes: 2,
    totalDreams: 18,
    lastUpdated: new Date().toISOString(),
  },
  readiness: {
    readyStations: [
      { station: 'Berlin Hbf', totalInterest: 120, participants: 55, organizers: 1, recentActivity: 5, readinessScore: 90, momentum: 'growing', hasOrganizer: true, participationRate: 45 },
    ],
    buildingStations: [],
    emergingStations: [],
    summary: { totalStations: 1, readyCount: 1, buildingCount: 0, emergingCount: 0, stationsWithParticipants: 1, stationsWithOrganizers: 1, coverageRate: 10 },
    thresholds: { READY: 50, BUILDING: 20, EMERGING: 5 },
    lastUpdated: new Date().toISOString(),
  },
}

const emptyMocks = {
  dreams: { total: 0, dreams: [] },
  growth: { chartData: [], metrics: { totalDreams: 0, totalParticipants: 0, last7Days: 0, weeklyGrowthRate: 0, peakDay: { date: '', dreams: 0 }, averageDailyDreams: 0, participationRate: 0 }, lastUpdated: new Date().toISOString() },
  popular: { popularRoutes: [], popularDestinations: [], popularOrigins: [], totalRoutes: 0, totalDreams: 0, lastUpdated: new Date().toISOString() },
  readiness: { readyStations: [], buildingStations: [], emergingStations: [], summary: { totalStations: 0, readyCount: 0, buildingCount: 0, emergingCount: 0, stationsWithParticipants: 0, stationsWithOrganizers: 0, coverageRate: 0 }, thresholds: { READY: 50, BUILDING: 20, EMERGING: 5 }, lastUpdated: new Date().toISOString() },
}

test.describe('Dashboard states with mocked APIs', () => {
  test('renders success state with data', async ({ page }) => {
    await page.route('**/api/dreams', route => route.fulfill({ json: successMocks.dreams }))
    await page.route('**/api/impact/growth-chart', route => route.fulfill({ json: successMocks.growth }))
    await page.route('**/api/impact/routes-popular', route => route.fulfill({ json: successMocks.popular }))
    await page.route('**/api/impact/stations-ready', route => route.fulfill({ json: successMocks.readiness }))

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /Impact Dashboard/i })).toBeVisible()

    // Popular routes should render at least one route item and totals line
    await expect(page.getByText(/Most Requested Routes/i)).toBeVisible()
    await expect(page.getByText(/dreams across/i)).toBeVisible()

    // Station readiness shows ready count and a station row
    await expect(page.getByText(/Ready Stations/i)).toBeVisible()
    await expect(page.getByText('Berlin Hbf')).toBeVisible()
  })

  test('renders empty states', async ({ page }) => {
    await page.route('**/api/dreams', route => route.fulfill({ json: emptyMocks.dreams }))
    await page.route('**/api/impact/growth-chart', route => route.fulfill({ json: emptyMocks.growth }))
    await page.route('**/api/impact/routes-popular', route => route.fulfill({ json: emptyMocks.popular }))
    await page.route('**/api/impact/stations-ready', route => route.fulfill({ json: emptyMocks.readiness }))

    await page.goto('/dashboard')

    // PopularRoutes empty copy
    await expect(page.getByText(/No route data available yet/i)).toBeVisible()

    // StationReadiness empty copy defaults to ready
    await expect(page.getByText(/No ready stations yet/i)).toBeVisible()
  })

  test('renders standardized error messages', async ({ page }) => {
    const errorJson = { error: 'Database unavailable' }
    await page.route('**/api/dreams', route => route.fulfill({ status: 500, json: errorJson }))
    await page.route('**/api/impact/growth-chart', route => route.fulfill({ status: 500, json: errorJson }))
    await page.route('**/api/impact/routes-popular', route => route.fulfill({ status: 500, json: errorJson }))
    await page.route('**/api/impact/stations-ready', route => route.fulfill({ status: 500, json: errorJson }))

    await page.goto('/dashboard')

    // All tiles should show the standardized error helper
    await expect(page.getByText('Check Supabase configuration.')).toHaveCount(3)
    await expect(page.getByText(/Unable to load dream counter/i)).toBeVisible()
    await expect(page.getByText(/Unable to load popular routes/i)).toBeVisible()
    await expect(page.getByText(/Unable to load growth chart/i)).toBeVisible()
    await expect(page.getByText(/Unable to load station readiness/i)).toBeVisible()
  })
})

