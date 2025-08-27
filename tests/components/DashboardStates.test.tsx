import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock analytics hook to control data fetching
vi.mock('@/hooks/useAnalytics', () => ({
  useEventTracker: () => ({ trackDashboardView: vi.fn(), trackChartInteraction: vi.fn(), trackMapInteraction: vi.fn() }),
  useDashboardData: vi.fn(),
}))

// Mock dreams provider for DreamCounter
vi.mock('@/providers/DataProvider', () => ({
  useDreams: () => ({ dreams: [], total: 0, lastUpdate: new Date(), isLoading: false, error: 'Test error', refetch: vi.fn() })
}))

import { useDashboardData } from '@/hooks/useAnalytics'
import DreamCounter from '@/components/dashboard/DreamCounter'
import StationReadiness from '@/components/dashboard/StationReadiness'
import PopularRoutes from '@/components/dashboard/PopularRoutes'
import GrowthChart from '@/components/dashboard/GrowthChart'

describe('Dashboard components data states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('DreamCounter shows helpful error copy', () => {
    render(<DreamCounter />)
    expect(screen.getByText(/Unable to load dream counter/i)).toBeInTheDocument()
    expect(screen.getByText(/Check Supabase configuration/i)).toBeInTheDocument()
  })

  it('StationReadiness shows helpful error copy', () => {
    ;(useDashboardData as unknown as vi.Mock).mockReturnValue({ data: null, loading: false, error: 'Test error', refetch: vi.fn() })
    render(<StationReadiness />)
    expect(screen.getByText(/Unable to load station readiness/i)).toBeInTheDocument()
    expect(screen.getByText(/Check Supabase configuration/i)).toBeInTheDocument()
  })

  it('PopularRoutes shows helpful error copy', () => {
    ;(useDashboardData as unknown as vi.Mock).mockReturnValue({ data: null, loading: false, error: 'Test error', refetch: vi.fn() })
    render(<PopularRoutes />)
    expect(screen.getByText(/Unable to load popular routes/i)).toBeInTheDocument()
    expect(screen.getByText(/Check Supabase configuration/i)).toBeInTheDocument()
  })

  it('GrowthChart shows helpful error copy', () => {
    ;(useDashboardData as unknown as vi.Mock).mockReturnValue({ data: null, loading: false, error: 'Test error', refetch: vi.fn() })
    render(<GrowthChart />)
    expect(screen.getByText(/Unable to load growth chart/i)).toBeInTheDocument()
    expect(screen.getByText(/Check Supabase configuration/i)).toBeInTheDocument()
  })
})

