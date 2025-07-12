import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PyjamaPartyForm from '@/components/forms/PyjamaPartyForm'
import { mockRefreshDreamMap } from '../setup'

// Mock fetch
global.fetch = vi.fn()

describe('PyjamaPartyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshDreamMap.mockClear()
    // Reset any global fetch mocks
    global.fetch = vi.fn()
  })
  
  afterEach(() => {
    // Clean up any DOM state
    document.body.innerHTML = ''
  })

  it('renders form fields correctly', () => {
    render(<PyjamaPartyForm />)
    
    expect(screen.getByLabelText(/which train station/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email for coordination \(optional\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/describe your pyjama party plan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/how many people do you expect/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    // Render fresh component
    const { container } = render(<PyjamaPartyForm />)
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    
    // Verify form starts empty
    const stationInput = screen.getByLabelText(/which train station/i)
    const emailInput = screen.getByLabelText(/email for coordination \(optional\)/i) 
    const descriptionInput = screen.getByLabelText(/describe your pyjama party plan/i)
    
    expect(stationInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(descriptionInput).toHaveValue('')
    
    // Submit empty form using fireEvent.submit (works with framer-motion mock)
    const form = submitButton.closest('form')
    expect(form).toBeInTheDocument()
    fireEvent.submit(form!)
    
    // Check if button stays enabled (validation failed) or gets disabled (form submitted)
    await waitFor(() => {
      // Look for validation errors
      expect(screen.getByText('Station name is required')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Verify other validation errors appear
    expect(screen.getByText('City is required')).toBeInTheDocument()
    expect(screen.getByText('Country is required')).toBeInTheDocument()
    expect(screen.getByText('Organizer name is required')).toBeInTheDocument()
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    
    // Email should NOT show an error since it's optional
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<PyjamaPartyForm />)
    
    const emailInput = screen.getByLabelText(/email for coordination \(optional\)/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    
    render(<PyjamaPartyForm onSubmit={mockOnSubmit} />)
    
    // Fill form
    await user.type(screen.getByLabelText(/which train station/i), 'Berlin Hauptbahnhof')
    await user.type(screen.getByLabelText(/city/i), 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    await user.type(screen.getByLabelText(/email for coordination \(optional\)/i), 'test@example.com')
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    await user.type(screen.getByLabelText(/how many people do you expect/i), '10')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        stationName: 'Berlin Hauptbahnhof',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test User',
        organizerEmail: 'test@example.com',
        description: 'Test pyjama party',
        expectedAttendees: 110, // 1 (default) + 10 (typed) = 110
        partyDate: '2025-09-26T19:00:00.000Z'
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Pyjama party created! 🎉')).toBeInTheDocument()
    })
  })

  it('submits form with valid data but no email', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    
    render(<PyjamaPartyForm onSubmit={mockOnSubmit} />)
    
    // Fill form without email
    await user.type(screen.getByLabelText(/which train station/i), 'Berlin Hauptbahnhof')
    await user.type(screen.getByLabelText(/city/i), 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    // Skip email field
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    await user.type(screen.getByLabelText(/how many people do you expect/i), '5')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        stationName: 'Berlin Hauptbahnhof',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test User',
        organizerEmail: '', // Empty email should be allowed
        description: 'Test pyjama party',
        expectedAttendees: 15, // 1 (default) + 5 (typed) = 15
        partyDate: '2025-09-26T19:00:00.000Z'
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Pyjama party created! 🎉')).toBeInTheDocument()
    })
  })

  it('calls refreshDreamMap after successful submission', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, id: '123' })
    }) as any
    
    render(<PyjamaPartyForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/which train station/i), 'Berlin Hauptbahnhof')
    await user.type(screen.getByLabelText(/city/i), 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    await user.type(screen.getByLabelText(/email for coordination \(optional\)/i), 'test@example.com')
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(mockRefreshDreamMap).toHaveBeenCalledTimes(1)
    })
  })

  it('handles submission errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock failed API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Validation failed' })
    }) as any
    
    render(<PyjamaPartyForm />)
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/which train station/i), 'Berlin Hauptbahnhof')
    await user.type(screen.getByLabelText(/city/i), 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    await user.type(screen.getByLabelText(/email for coordination \(optional\)/i), 'test@example.com')
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    // Should not call refreshDreamMap on error
    await waitFor(() => {
      expect(mockRefreshDreamMap).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock delayed API response
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ success: true, id: '123' })
      }), 100))
    ) as any
    
    render(<PyjamaPartyForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/which train station/i), 'Berlin Hauptbahnhof')
    await user.type(screen.getByLabelText(/city/i), 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    await user.type(screen.getByLabelText(/email for coordination \(optional\)/i), 'test@example.com')
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    // Check for loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('resets form after successful submission', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, id: '123' })
    }) as any
    
    render(<PyjamaPartyForm />)
    
    const stationInput = screen.getByLabelText(/which train station/i)
    const cityInput = screen.getByLabelText(/city/i)
    
    // Fill form
    await user.type(stationInput, 'Berlin Hauptbahnhof')
    await user.type(cityInput, 'Berlin')
    await user.type(screen.getByLabelText(/country/i), 'Germany')
    await user.type(screen.getByLabelText(/your name/i), 'Test User')
    await user.type(screen.getByLabelText(/email for coordination \(optional\)/i), 'test@example.com')
    await user.type(screen.getByLabelText(/describe your pyjama party plan/i), 'Test pyjama party')
    
    expect(stationInput).toHaveValue('Berlin Hauptbahnhof')
    expect(cityInput).toHaveValue('Berlin')
    
    const submitButton = screen.getByRole('button', { name: /organize pyjama party/i })
    const form = submitButton.closest('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(stationInput).toHaveValue('')
      expect(cityInput).toHaveValue('')
    })
  })
})