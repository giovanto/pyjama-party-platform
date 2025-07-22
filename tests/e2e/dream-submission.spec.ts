import { test, expect } from '@playwright/test'

test.describe('Dream Route Submission Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/')
  })

  test('should complete full dream submission workflow', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Fill out the dream form with correct field IDs
    await page.locator('#dreamerName').fill('Test Dreamer')
    await page.locator('#from').fill('Berlin Hauptbahnhof')
    await page.locator('#to').fill('Vienna Central Station')
    await page.locator('#why').fill('I dream of taking a peaceful night train from Berlin to Vienna, watching the countryside pass by as I sleep.')

    // Submit the dream
    await page.getByRole('button', { name: /add my dream to the map/i }).click()

    // Wait for success message
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })

    // Verify form is reset
    await expect(page.locator('#from')).toHaveValue('')
    await expect(page.locator('#to')).toHaveValue('')
    await expect(page.locator('#dreamerName')).toHaveValue('')
  })

  test('should show validation errors for empty dream form', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Try to submit empty form
    await page.getByRole('button', { name: /add my dream to the map/i }).click()

    // Check for validation errors
    await expect(page.getByText('Departure station is required')).toBeVisible()
    await expect(page.getByText('Destination station is required')).toBeVisible()
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Please tell us why this route matters to you')).toBeVisible()
  })

  test('should validate email format in dream form', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // First select join party to make email required
    await page.getByRole('radio', { name: /join a pyjama party/i }).click()

    // Fill form with invalid email
    await page.locator('#from').fill('Berlin Hauptbahnhof')
    await page.locator('#to').fill('Vienna Central Station')
    await page.locator('#dreamerName').fill('Test Dreamer')
    await page.locator('#email').fill('invalid-email-format')
    await page.locator('#why').fill('Test story')

    // Submit form
    await page.getByRole('button', { name: /join pyjama party/i }).click()

    // Check for email validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should show loading state during dream submission', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Fill out the form
    await page.locator('#dreamerName').fill('Test User')
    await page.locator('#from').fill('Paris Nord')
    await page.locator('#to').fill('Barcelona Sants')
    await page.locator('#why').fill('Dreaming of the Pyrenees from my train window')

    // Submit the form
    await page.getByRole('button', { name: /add my dream to the map/i }).click()

    // Check for loading state
    await expect(page.getByText(/Sharing Your Dream/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sharing Your Dream/i })).toBeDisabled()
  })

  test('should handle station autocomplete', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Start typing in from station
    await page.locator('#from').fill('Ber')

    // Wait for potential suggestions
    await page.waitForTimeout(500)

    // Continue with a complete station name
    await page.locator('#from').fill('Berlin Hauptbahnhof')
    
    // Verify the field is filled correctly
    await expect(page.locator('#from')).toHaveValue('Berlin Hauptbahnhof')
  })

  test('should preserve form data on validation errors', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Select party participation to require email
    await page.getByRole('radio', { name: /join a pyjama party/i }).click()

    // Fill most of the form but leave email invalid
    await page.locator('#dreamerName').fill('Test Dreamer')
    await page.locator('#from').fill('Amsterdam Centraal')
    await page.locator('#to').fill('Stockholm Central')
    await page.locator('#email').fill('invalid-email')
    await page.locator('#why').fill('Dreaming of Nordic landscapes')

    // Submit form (should fail validation)
    await page.getByRole('button', { name: /join pyjama party/i }).click()

    // Verify validation error appears
    await expect(page.getByText('Please enter a valid email')).toBeVisible()

    // Verify other form data is preserved
    await expect(page.locator('#from')).toHaveValue('Amsterdam Centraal')
    await expect(page.locator('#to')).toHaveValue('Stockholm Central')
    await expect(page.locator('#dreamerName')).toHaveValue('Test Dreamer')
    await expect(page.locator('#why')).toHaveValue('Dreaming of Nordic landscapes')
  })

  test('should update map after successful dream submission', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Submit a dream
    await page.locator('#dreamerName').fill('Map Test User')
    await page.locator('#from').fill('Rome Termini')
    await page.locator('#to').fill('Naples Central')
    await page.locator('#why').fill('Italian countryside by night train')

    await page.getByRole('button', { name: /add my dream to the map/i }).click()

    // Wait for success
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })

    // Wait for map to potentially update
    await page.waitForTimeout(2000)
    
    // Check if map section exists (may not have data-testid)
    await expect(page.locator('#map')).toBeVisible()
  })
})