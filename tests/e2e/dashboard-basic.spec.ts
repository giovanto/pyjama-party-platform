import { test, expect } from '@playwright/test'

test.describe('Dashboard renders key sections', () => {
  test('shows counter and charts containers', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /Impact Dashboard/i })).toBeVisible()

    // Counter tile should render
    await expect(page.getByText(/Live Dreams/i)).toBeVisible()

    // Sections present (data may be loading/empty depending on env)
    await expect(page.getByRole('heading', { name: /Growth Trends/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Popular Routes/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Station Readiness Overview/i })).toBeVisible()
  })
})

