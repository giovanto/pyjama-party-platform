import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock the heavy map component for unit testing
vi.mock('@/components/map', () => ({
  DreamMap: () => <div data-testid="dream-map">[DreamMap]</div>,
}))

import CommunityPage from '@/../app/community/page'

describe('CommunityPage simplified UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders required sections and no fake metrics', () => {
    render(React.createElement(CommunityPage))

    // Must have organizer resources and station map
    expect(screen.getByText(/Organizer Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/Station Readiness Map/i)).toBeInTheDocument()
    expect(screen.getByTestId('dream-map')).toBeInTheDocument()

    // Must have Discord CTA
    expect(screen.getAllByText(/Join Discord/i)[0]).toBeInTheDocument()

    // Must not show fake stat sections
    expect(screen.queryByText(/Active Community Members/i)).toBeNull()
    expect(screen.queryByText(/Recent Updates/i)).toBeNull()
    expect(screen.queryByText(/Community Achievements/i)).toBeNull()
  })
})
