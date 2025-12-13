import { test, expect } from '@playwright/test'

test.describe('Landing Page UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays main heading and tagline', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Phantom Pressure Test')
    await expect(page.locator('p').first()).toContainText('Phantom Consumer Memory')
  })

  test('has visible login and register buttons', async ({ page }) => {
    const loginButton = page.getByRole('link', { name: 'Login' })
    const registerButton = page.getByRole('link', { name: 'Register' })

    await expect(loginButton).toBeVisible()
    await expect(registerButton).toBeVisible()
  })

  test('login button navigates to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('register button navigates to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click()
    await expect(page).toHaveURL('/register')
  })

  test('page is responsive - has proper viewport meta', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })
})
