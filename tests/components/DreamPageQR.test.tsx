import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// Note: '@' alias maps to 'src', so app pages are outside of '@'.
import InterviewQRPage from '@/../app/interview/qr/page'

describe('Dream page QR tool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('generates a QR code and shows download + open link', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'qr_1',
        qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA',
        url: 'http://localhost:3000/interview?station=BERLIN-HBF&lang=en',
        stationCode: 'BERLIN-HBF',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      })
    })

    render(<InterviewQRPage />)

    fireEvent.change(screen.getByLabelText(/Station Code/i), { target: { value: 'BERLIN-HBF' } })
    fireEvent.change(screen.getByLabelText(/Station Name/i), { target: { value: 'Berlin Hauptbahnhof' } })
    fireEvent.click(screen.getByRole('button', { name: /Generate QR Code/i }))

    await waitFor(() => {
      expect(screen.getByAltText(/Interview QR Code/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Open Interview/i })).toHaveAttribute('href')
    })
  })
})
