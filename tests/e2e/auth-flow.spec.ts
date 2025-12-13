import { test, expect } from '@playwright/test'

test.describe('Authentication Flow UX', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('displays login form with proper elements', async ({ page }) => {
      // Check heading
      await expect(page.locator('text=Phantom Pressure Test')).toBeVisible()
      await expect(page.locator('text=Enter your email to receive a magic link')).toBeVisible()

      // Check form elements
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toBeVisible()
      await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com')

      // Check submit button
      const submitButton = page.getByRole('button', { name: /send magic link/i })
      await expect(submitButton).toBeVisible()
    })

    test('email input is required', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]')
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('shows validation for invalid email', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]')
      const submitButton = page.getByRole('button', { name: /send magic link/i })

      // Try to submit with invalid email
      await emailInput.fill('invalid-email')
      await submitButton.click()

      // HTML5 validation should prevent submission
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity())
      expect(isValid).toBe(false)
    })

    test('accepts valid email format', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]')

      await emailInput.fill('test@example.com')
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity())
      expect(isValid).toBe(true)
    })

    test('displays branding footer', async ({ page }) => {
      await expect(page.locator('text=Phantom Consumer Memory')).toBeVisible()
    })
  })

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('displays register page content', async ({ page }) => {
      // Register page currently shows placeholder
      await expect(page.locator('h2')).toContainText('Create your account')
      await expect(page.locator('text=sign in to existing account')).toBeVisible()
    })

    test('has link back to login', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /sign in to existing account/i })
      await expect(loginLink).toBeVisible()
      await loginLink.click()
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Protected Routes', () => {
    test('dashboard redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')
    })

    test('projects page redirects to login when not authenticated', async ({ page }) => {
      await page.goto('/projects')
      await expect(page).toHaveURL('/login')
    })
  })
})
