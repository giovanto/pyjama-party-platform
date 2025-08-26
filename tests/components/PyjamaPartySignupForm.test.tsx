import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PyjamaPartySignupForm from '@/components/forms/PyjamaPartySignupForm'

// Mock fetch
global.fetch = vi.fn()

describe('PyjamaPartySignupForm (participant)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('validates required fields and disables submit until ready', async () => {
    render(<PyjamaPartySignupForm />)

    const submit = screen.getByRole('button', { name: /Join the European Pajama Party/i })
    expect(submit).toBeDisabled()

    // Fill partial data
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText(/Preferred Station/i), { target: { value: 'Berlin Hauptbahnhof' } })

    // Choose participation level
    const partyOption = screen.getByRole('radio', { name: /Attend the Party/i })
    fireEvent.click(partyOption)

    // Accept privacy policy
    const privacy = screen.getByText(/Privacy Policy & Terms/i).closest('label')!.querySelector('input') as HTMLInputElement
    fireEvent.click(privacy)

    expect(submit).not.toBeDisabled()
  })

  it('submits successfully and shows success message', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Thanks!' })
    })

    render(<PyjamaPartySignupForm />)

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText(/Preferred Station/i), { target: { value: 'Berlin Hbf' } })
    fireEvent.click(screen.getByRole('radio', { name: /Attend the Party/i }))
    fireEvent.click(screen.getByText(/Privacy Policy & Terms/i).closest('label')!.querySelector('input')!)

    fireEvent.click(screen.getByRole('button', { name: /Join the European Pajama Party/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Welcome to the Movement/i)).toBeInTheDocument()
    })
  })
})

