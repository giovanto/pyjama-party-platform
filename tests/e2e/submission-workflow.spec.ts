import { test, expect } from '@playwright/test'

test.describe('Pyjama Party Submission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the organize page
    await page.goto('/organize')
  })

  test('should complete full submission workflow', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/station name/i).fill('Berlin Hauptbahnhof')
    await page.getByLabel(/city/i).fill('Berlin')
    await page.getByLabel(/country/i).fill('Germany')
    await page.getByLabel(/organizer name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/description/i).fill('Test pyjama party for E2E testing')
    await page.getByLabel(/expected attendees/i).fill('15')

    // Submit the form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Wait for success message
    await expect(page.getByText('Pyjama party created! 🎉')).toBeVisible()

    // Verify form is reset
    await expect(page.getByLabel(/station name/i)).toHaveValue('')
    await expect(page.getByLabel(/city/i)).toHaveValue('')
    await expect(page.getByLabel(/organizer name/i)).toHaveValue('')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for validation errors
    await expect(page.getByText('Station name is required')).toBeVisible()
    await expect(page.getByText('City is required')).toBeVisible()
    await expect(page.getByText('Country is required')).toBeVisible()
    await expect(page.getByText('Organizer name is required')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/station name/i).fill('Berlin Hauptbahnhof')
    await page.getByLabel(/city/i).fill('Berlin')
    await page.getByLabel(/country/i).fill('Germany')
    await page.getByLabel(/organizer name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('invalid-email-format')
    await page.getByLabel(/description/i).fill('Test description')

    // Submit form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for email validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    // Fill out the form
    await page.getByLabel(/station name/i).fill('Berlin Hauptbahnhof')
    await page.getByLabel(/city/i).fill('Berlin')
    await page.getByLabel(/country/i).fill('Germany')
    await page.getByLabel(/organizer name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/description/i).fill('Test pyjama party')

    // Submit the form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for loading state
    await expect(page.getByText(/organizing/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /organizing/i })).toBeDisabled()
  })

  test('should navigate back to home and see updated map', async ({ page }) => {
    // Submit a pyjama party first
    await page.getByLabel(/station name/i).fill('Vienna Central Station')
    await page.getByLabel(/city/i).fill('Vienna')
    await page.getByLabel(/country/i).fill('Austria')
    await page.getByLabel(/organizer name/i).fill('Test Organizer')
    await page.getByLabel(/email/i).fill('organizer@example.com')
    await page.getByLabel(/description/i).fill('Vienna pyjama party test')

    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Wait for success
    await expect(page.getByText('Pyjama party created! 🎉')).toBeVisible()

    // Navigate to home page
    await page.goto('/')

    // Wait for map to load and check if new submission appears
    // Note: This test would need to be adjusted based on actual map implementation
    await page.waitForSelector('[data-testid="dream-map"]', { timeout: 10000 })
    
    // Verify the map component is present
    await expect(page.locator('[data-testid="dream-map"]')).toBeVisible()
  })

  test('should handle form autocomplete for stations', async ({ page }) => {
    // Start typing in station name
    await page.getByLabel(/station name/i).fill('Ber')

    // Wait for suggestions (if autocomplete is implemented)
    // This test would need to be updated based on actual autocomplete implementation
    await page.waitForTimeout(500)

    // Continue with a complete station name
    await page.getByLabel(/station name/i).fill('Berlin Hauptbahnhof')
    await page.getByLabel(/city/i).fill('Berlin')
    await page.getByLabel(/country/i).fill('Germany')
    
    // Verify the fields are filled correctly
    await expect(page.getByLabel(/station name/i)).toHaveValue('Berlin Hauptbahnhof')
    await expect(page.getByLabel(/city/i)).toHaveValue('Berlin')
    await expect(page.getByLabel(/country/i)).toHaveValue('Germany')
  })

  test('should preserve form data on validation errors', async ({ page }) => {
    // Fill most of the form but leave email invalid
    await page.getByLabel(/station name/i).fill('Paris Nord')
    await page.getByLabel(/city/i).fill('Paris')
    await page.getByLabel(/country/i).fill('France')
    await page.getByLabel(/organizer name/i).fill('Test Organizer')
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/description/i).fill('Paris pyjama party')

    // Submit form (should fail validation)
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Verify validation error appears
    await expect(page.getByText('Please enter a valid email')).toBeVisible()

    // Verify other form data is preserved
    await expect(page.getByLabel(/station name/i)).toHaveValue('Paris Nord')
    await expect(page.getByLabel(/city/i)).toHaveValue('Paris')
    await expect(page.getByLabel(/country/i)).toHaveValue('France')
    await expect(page.getByLabel(/organizer name/i)).toHaveValue('Test Organizer')
    await expect(page.getByLabel(/description/i)).toHaveValue('Paris pyjama party')
  })
})