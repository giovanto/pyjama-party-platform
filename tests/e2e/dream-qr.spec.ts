import { test, expect } from '@playwright/test'

test.describe('Dream QR flow', () => {
  test('generates QR and opens interview', async ({ page }) => {
    // Intercept the QR API to return a stable response
    await page.route('**/api/qr/generate**', async route => {
      const url = new URL(route.request().url())
      const station = url.searchParams.get('station') || 'BERLIN-HBF'
      const json = {
        id: 'qr_mock',
        qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA',
        url: `http://localhost:3000/interview?station=${station}&lang=en`,
        stationCode: station,
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      }
      await route.fulfill({ json, status: 200 })
    })

    await page.goto('/dream')
    await expect(page.getByRole('heading', { name: /Where would you like to wake up/i })).toBeVisible()

    await page.getByLabel('Station Code').fill('BERLIN-HBF')
    await page.getByLabel('Station Name').fill('Berlin Hauptbahnhof')
    await page.getByRole('button', { name: /Generate QR Code/i }).click()

    await expect(page.getByAltText('Interview QR Code')).toBeVisible()
    const openLink = page.getByRole('link', { name: /Open Interview/i })
    await expect(openLink).toBeVisible()
    await expect(openLink).toHaveAttribute('href', /\/interview\?station=BERLIN-HBF/)
  })
})

