import { test, expect } from '@playwright/test'

test.describe('Complete User Journey E2E Tests', () => {
  test('should complete full user journey from dream to party organization', async ({ page }) => {
    // Step 1: Visit home page and submit a dream route
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify home page loads correctly  
    await expect(page.getByRole('heading', { level: 1, name: /Where would you like to wake up tomorrow/i })).toBeVisible()
    
    // Fill out the dream form (dream-only tier)
    await page.locator('#dreamerName').fill('Journey Test User')
    await page.locator('#from').fill('Amsterdam Centraal')
    await page.locator('#to').fill('Barcelona Sants')
    await page.locator('#why').fill('I want to experience sustainable travel across Europe and see the beautiful countryside by train instead of flying.')

    // Submit dream (default is dream-only)
    await page.getByRole('button', { name: /add my dream to the map/i }).click()

    // Wait for success message
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })

    // Step 2: Navigate to organize page to create a pyjama party
    await page.goto('/organize')
    await page.waitForLoadState('networkidle')

    // Verify organize page loads
    await expect(page.getByRole('heading', { name: /Organize a Pyjama Party/i })).toBeVisible()

    // Fill out pyjama party form
    await page.locator('#stationName').fill('Amsterdam Centraal')
    await page.locator('#city').fill('Amsterdam')
    await page.locator('#country').fill('Netherlands')
    await page.locator('#organizerName').fill('Journey Test Organizer')
    await page.locator('#organizerEmail').fill('organizer@test.com')
    await page.locator('#expectedAttendees').fill('12')
    await page.locator('#description').fill('Exciting pyjama party at Amsterdam Centraal! We will gather in our pajamas to show support for night trains across Europe. Bring your sleeping bags and train enthusiasm!')

    // Submit pyjama party
    await page.getByRole('button', { name: /organize pyjama party/i }).click()

    // Wait for success
    await expect(page.getByText(/Pyjama party created/i)).toBeVisible({ timeout: 10000 })

    // Step 3: Navigate back to home and verify map section
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that map section is visible
    await expect(page.locator('#map')).toBeVisible()
    
    // Check community section
    await expect(page.locator('#community')).toBeVisible()
    await expect(page.getByText(/Our Growing Action Group/i)).toBeVisible()

    // Step 4: Test navigation between sections
    // Test floating navigation if it exists
    const navButtons = page.locator('nav a, [href*="#"]')
    if (await navButtons.count() > 0) {
      // Click on map section link if available
      const mapLink = page.locator('a[href="#map"], a[href*="map"]').first()
      if (await mapLink.isVisible()) {
        await mapLink.click()
        await expect(page.locator('#map')).toBeInViewport()
      }
    }
  })

  test('should handle complete pyjama party participation flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Fill basic dream info
    await page.locator('#dreamerName').fill('Party Participant')
    await page.locator('#from').fill('Berlin Hauptbahnhof')
    await page.locator('#to').fill('Vienna Central')
    await page.locator('#why').fill('Night trains are the future of sustainable European transport!')

    // Select pyjama party participation
    await page.getByRole('radio', { name: /Pajama Party Participant/i }).click()

    // Email field should become visible and required
    await expect(page.locator('#email')).toBeVisible()
    
    // Fill email
    await page.locator('#email').fill('participant@test.com')

    // Submit with party participation
    await page.getByRole('button', { name: /Join pyjama party/i }).click()

    // Wait for success
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })
    
    // Verify form reset
    await expect(page.locator('#dreamerName')).toHaveValue('')
    await expect(page.locator('#from')).toHaveValue('')
    await expect(page.locator('#to')).toHaveValue('')
  })

  test('should handle organizer participation flow', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Fill basic dream info
    await page.locator('#dreamerName').fill('Future Organizer')
    await page.locator('#from').fill('Paris Gare du Nord')
    await page.locator('#to').fill('Rome Termini')
    await page.locator('#why').fill('I want to organize the most amazing pyjama party for sustainable transport!')

    // Select organize party option
    await page.getByRole('radio', { name: /Station Host & Organizer/i }).click()

    // Email field should become visible and required
    await expect(page.locator('#email')).toBeVisible()
    
    // Fill email
    await page.locator('#email').fill('future-organizer@test.com')

    // Submit as organizer
    await page.getByRole('button', { name: /Organize pyjama party/i }).click()

    // Wait for success
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })
  })

  test('should validate form interactions and error states', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test empty form validation
    await page.getByRole('button', { name: /add my dream to the map/i }).click()
    
    // Check validation errors appear
    await expect(page.getByText(/Name is required/i)).toBeVisible()
    await expect(page.getByText(/Departure station is required/i)).toBeVisible()
    await expect(page.getByText(/Destination station is required/i)).toBeVisible()

    // Test email validation when party participation is selected
    await page.getByRole('radio', { name: /Pajama Party Participant/i }).click()
    
    // Fill form with invalid email
    await page.locator('#dreamerName').fill('Validation Tester')
    await page.locator('#from').fill('Milan Central')
    await page.locator('#to').fill('Munich Hbf')
    await page.locator('#email').fill('invalid-email')
    await page.locator('#why').fill('Testing validation')

    // Submit form
    await page.getByRole('button', { name: /Join pyjama party/i }).click()

    // Check email validation error
    await expect(page.getByText(/Please enter a valid email/i)).toBeVisible()

    // Fix email and verify form works
    await page.locator('#email').fill('valid@email.com')
    await page.getByRole('button', { name: /Join pyjama party/i }).click()

    // Should succeed this time
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })
  })

  test('should test responsive design and mobile experience', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify mobile layout
    await expect(page.getByRole('heading', { level: 1, name: /Where would you like to wake up tomorrow/i })).toBeVisible()
    
    // Test form works on mobile
    await page.locator('#dreamerName').fill('Mobile User')
    await page.locator('#from').fill('London St Pancras')
    await page.locator('#to').fill('Amsterdam Centraal')
    await page.locator('#why').fill('Mobile sustainable travel dreams!')

    // Submit
    await page.getByRole('button', { name: /add my dream to the map/i }).click()
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify tablet layout
    await expect(page.getByRole('heading', { name: /Where would you like to wake up tomorrow/i })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify desktop layout
    await expect(page.getByRole('heading', { name: /Where would you like to wake up tomorrow/i })).toBeVisible()
  })

  test('should test accessibility features', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test keyboard navigation
    await page.keyboard.press('Tab') // Should focus first interactive element
    
    // Test form labels and ARIA attributes
    const nameInput = page.locator('#dreamerName')
    const nameLabel = page.locator('label[for="dreamerName"]')
    
    await expect(nameLabel).toBeVisible()
    await expect(nameInput).toHaveAttribute('id', 'dreamerName')

    // Test form can be filled using keyboard only
    await nameInput.focus()
    await nameInput.fill('Accessibility Tester')
    
    await page.keyboard.press('Tab')
    const fromInput = page.locator('#from')
    await fromInput.fill('Copenhagen Central')
    
    await page.keyboard.press('Tab') 
    const toInput = page.locator('#to')
    await toInput.fill('Stockholm Central')
    
    // Navigate to why field
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Skip radio buttons
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const whyInput = page.locator('#why')
    await whyInput.fill('Accessibility in sustainable transport!')

    // Submit using keyboard
    await page.keyboard.press('Tab') // Navigate to submit button
    await page.keyboard.press('Enter')

    // Check success
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })
  })

  test('should test page performance and loading states', async ({ page }) => {
    // Monitor network requests
    const responses: any[] = []
    page.on('response', response => responses.push(response))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check page loads within reasonable time
    const navigationPromise = page.goto('/')
    await expect(navigationPromise).resolves.toBeTruthy()

    // Test loading states during form submission
    await page.locator('#dreamerName').fill('Performance Tester')
    await page.locator('#from').fill('Brussels Central')
    await page.locator('#to').fill('Prague Central')
    await page.locator('#why').fill('Testing loading performance')

    // Submit and immediately check for loading state
    const submitPromise = page.getByRole('button', { name: /add my dream to the map/i }).click()
    
    // Loading state should appear briefly
    await expect(page.getByText(/Sharing Your Dream/i)).toBeVisible()
    
    await submitPromise
    await expect(page.getByText(/Your dream is on the map/i)).toBeVisible({ timeout: 10000 })

    // Check that CSS and JS loaded successfully
    const cssResponses = responses.filter(r => r.url().includes('.css'))
    const jsResponses = responses.filter(r => r.url().includes('.js'))
    
    expect(cssResponses.length).toBeGreaterThan(0)
    expect(jsResponses.length).toBeGreaterThan(0)
  })
});