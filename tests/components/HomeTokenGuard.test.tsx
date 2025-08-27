import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock map module to avoid loading mapbox
vi.mock('@/components/map', () => ({
  DreamMap: () => <div data-testid="dream-map">[DreamMap]</div>,
  ProminentLayerToggle: () => <div data-testid="layer-toggle" />,
}))

// Mock useDreams hook to avoid requiring DataProvider context/fetch
vi.mock('@/providers/DataProvider', () => ({
  useDreams: () => ({
    dreams: [],
    total: 0,
    lastUpdate: new Date(),
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

// Defer importing Home until after env is set in tests

describe('Homepage map token guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows instruction card when no Mapbox token present', async () => {
    const original = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    // Ensure undefined for this test
    // @ts-ignore
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = undefined

    // Explicitly mark token absent for client code path
    // @ts-ignore
    global.window = global.window || ({} as any)
    // @ts-ignore
    global.window.__MAPBOX_TOKEN_PRESENT__ = false
    const { default: Home } = await import('@/../app/page')
    render(React.createElement(Home))
    expect(screen.getByText(/Map Unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/Add to your .env.local/i)).toBeInTheDocument()
    expect(screen.queryByTestId('dream-map')).toBeNull()

    // Restore
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = original
  })
})
