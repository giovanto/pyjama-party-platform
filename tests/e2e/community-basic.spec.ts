import { test, expect } from '@playwright/test'

test.describe('Community basic flow', () => {
  test('loads simplified community page with map or fallback', async ({ page }) => {
    await page.goto('/community')
    await expect(page.getByRole('heading', { name: /Station Readiness Map/i })).toBeVisible()

    // Discord link present
    const discord = page.getByRole('link', { name: /Join Discord/i })
    await expect(discord).toBeVisible()

    // Map area or an error/fallback should be visible
    const mapArea = page.locator('.dream-map, .dream-map-error')
    await expect(mapArea.first()).toBeVisible()

    // No fake metrics sections
    await expect(page.getByText('Recent Updates')).toHaveCount(0)
    await expect(page.getByText('Community Achievements')).toHaveCount(0)
  })
})

