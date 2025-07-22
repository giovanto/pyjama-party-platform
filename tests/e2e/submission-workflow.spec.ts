import { test, expect } from '@playwright/test'

test.describe('Pyjama Party Submission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the organize page
    await page.goto('/organize')
  })

  test('should complete full submission workflow', async ({ page }) => {
    // Fill out the form
    await page.locator('#stationName').fill('Berlin Hauptbahnhof')
    await page.locator('#city').fill('Berlin')
    await page.locator('#country').fill('Germany')
    await page.locator('#organizerName').fill('Test User')
    await page.locator('#organizerEmail').fill('test@example.com')
    await page.locator('#description').fill('Test pyjama party for E2E testing')
    await page.locator('#expectedAttendees').fill('15')

    // Submit the form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Wait for success message
    await expect(page.getByText('Pyjama party created! 🎉')).toBeVisible()

    // Verify form is reset
    await expect(page.locator('#stationName')).toHaveValue('')
    await expect(page.locator('#city')).toHaveValue('')
    await expect(page.locator('#organizerName')).toHaveValue('')
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for validation errors
    await expect(page.getByText('Station name is required')).toBeVisible()
    await expect(page.getByText('City is required')).toBeVisible()
    await expect(page.getByText('Country is required')).toBeVisible()
    await expect(page.getByText('Organizer name is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    // Fill form with invalid email
    await page.locator('#stationName').fill('Berlin Hauptbahnhof')
    await page.locator('#city').fill('Berlin')
    await page.locator('#country').fill('Germany')
    await page.locator('#organizerName').fill('Test User')
    await page.locator('#organizerEmail').fill('invalid-email-format')
    await page.locator('#description').fill('Test description')

    // Submit form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for email validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should show loading state during submission', async ({ page }) => {
    // Fill out the form
    await page.locator('#stationName').fill('Berlin Hauptbahnhof')
    await page.locator('#city').fill('Berlin')
    await page.locator('#country').fill('Germany')
    await page.locator('#organizerName').fill('Test User')
    await page.locator('#organizerEmail').fill('test@example.com')
    await page.locator('#description').fill('Test pyjama party')

    // Submit the form
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Check for loading state
    await expect(page.getByText(/Creating Your Pyjama Party/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Creating Your Pyjama Party/i })).toBeDisabled()
  })

  test('should navigate back to home and see updated map', async ({ page }) => {
    // Submit a pyjama party first
    await page.locator('#stationName').fill('Vienna Central Station')
    await page.locator('#city').fill('Vienna')
    await page.locator('#country').fill('Austria')
    await page.locator('#organizerName').fill('Test Organizer')
    await page.locator('#organizerEmail').fill('organizer@example.com')
    await page.locator('#description').fill('Vienna pyjama party test')

    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Wait for success
    await expect(page.getByText('Pyjama party created! 🎉')).toBeVisible()

    // Navigate to home page
    await page.goto('/')

    // Wait for map section to load
    await page.waitForSelector('#map', { timeout: 10000 })
    
    // Verify the map section is present
    await expect(page.locator('#map')).toBeVisible()
  })

  test('should handle form autocomplete for stations', async ({ page }) => {
    // Start typing in station name
    await page.locator('#stationName').fill('Ber')

    // Wait for suggestions (if autocomplete is implemented)
    // This test would need to be updated based on actual autocomplete implementation
    await page.waitForTimeout(500)

    // Continue with a complete station name
    await page.locator('#stationName').fill('Berlin Hauptbahnhof')
    await page.locator('#city').fill('Berlin')
    await page.locator('#country').fill('Germany')
    
    // Verify the fields are filled correctly
    await expect(page.locator('#stationName')).toHaveValue('Berlin Hauptbahnhof')
    await expect(page.locator('#city')).toHaveValue('Berlin')
    await expect(page.locator('#country')).toHaveValue('Germany')
  })

  test('should preserve form data on validation errors', async ({ page }) => {
    // Fill most of the form but leave email invalid
    await page.locator('#stationName').fill('Paris Nord')
    await page.locator('#city').fill('Paris')
    await page.locator('#country').fill('France')
    await page.locator('#organizerName').fill('Test Organizer')
    await page.locator('#organizerEmail').fill('invalid-email')
    await page.locator('#description').fill('Paris pyjama party')

    // Submit form (should fail validation)
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Verify validation error appears
    await expect(page.getByText('Please enter a valid email')).toBeVisible()

    // Verify other form data is preserved
    await expect(page.locator('#stationName')).toHaveValue('Paris Nord')
    await expect(page.locator('#city')).toHaveValue('Paris')
    await expect(page.locator('#country')).toHaveValue('France')
    await expect(page.locator('#organizerName')).toHaveValue('Test Organizer')
    await expect(page.locator('#description')).toHaveValue('Paris pyjama party')
  })
})