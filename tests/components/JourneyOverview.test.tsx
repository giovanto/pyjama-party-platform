import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import JourneyOverview from '@/components/journey/JourneyOverview'
import { PHASES } from '@/lib/phases'

describe('JourneyOverview', () => {
  it('renders all phases with titles and links', () => {
    render(<JourneyOverview />)

    // Title and subtitle visible
    expect(screen.getByText(/Your Journey to Action/i)).toBeInTheDocument()

    // Renders one card per phase
    const cards = screen.getAllByRole('link')
    // There may be other links; filter by hrefs matching phase hrefs
    const phaseHrefs = new Set(PHASES.map(p => p.href))
    const phaseCards = cards.filter(a => {
      const href = a.getAttribute('href') || ''
      return Array.from(phaseHrefs).some(h => href.startsWith(h))
    })
    expect(phaseCards.length).toBe(PHASES.length)

    // Check labels
    PHASES.forEach(phase => {
      const item = screen.getByText(phase.title)
      expect(item).toBeInTheDocument()
      const link = item.closest('a')
      expect(link).toBeTruthy()
      expect(link!.getAttribute('href')).toContain(phase.href)
    })
  })
})

