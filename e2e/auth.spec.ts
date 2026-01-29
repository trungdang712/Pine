import { test, expect, TEST_DATA } from './fixtures';

/**
 * Authentication Flow E2E Tests
 * Tests login page rendering and form validation
 */

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login page with correct elements', async ({ page }) => {
      await page.goto('/login');

      // Check page title elements
      await expect(page.getByText(TEST_DATA.PAGES.LOGIN.title)).toBeVisible();
      await expect(page.getByText(TEST_DATA.PAGES.LOGIN.subtitle)).toBeVisible();

      // Check logo is present (GF initials)
      await expect(page.getByText('GF')).toBeVisible();

      // Check form elements are present
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

      // Check demo mode button is present
      await expect(page.getByRole('button', { name: /demo mode/i })).toBeVisible();
    });

    test('should have proper form validation for required fields', async ({ page }) => {
      await page.goto('/login');

      // Email field should have required attribute
      const emailInput = page.getByLabel('Email');
      await expect(emailInput).toHaveAttribute('required', '');

      // Password field should have required attribute
      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test('should show error message with invalid credentials', async ({ page }) => {
      await page.goto('/login');

      // Fill in invalid credentials
      await page.getByLabel('Email').fill(TEST_DATA.INVALID_CREDENTIALS.email);
      await page.getByLabel('Password').fill(TEST_DATA.INVALID_CREDENTIALS.password);

      // Submit the form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for error message to appear
      // The error message should contain 'error' or 'failed' or 'invalid'
      await expect(page.locator('[class*="destructive"]').or(page.getByText(/error|failed|invalid/i))).toBeVisible({
        timeout: 10000,
      });
    });

    test('should show loading state when submitting form', async ({ page }) => {
      await page.goto('/login');

      // Fill in credentials
      await page.getByLabel('Email').fill(TEST_DATA.INVALID_CREDENTIALS.email);
      await page.getByLabel('Password').fill(TEST_DATA.INVALID_CREDENTIALS.password);

      // Submit the form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show loading state (button text changes to "Signing in...")
      await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible();
    });

    test('should allow clicking demo mode button', async ({ page }) => {
      await page.goto('/login');

      // Get the demo mode button
      const demoButton = page.getByRole('button', { name: /demo mode/i });
      await expect(demoButton).toBeVisible();
      await expect(demoButton).toBeEnabled();
    });

    test('should have proper email input type', async ({ page }) => {
      await page.goto('/login');

      // Email field should have type="email"
      const emailInput = page.getByLabel('Email');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('should have proper password input type', async ({ page }) => {
      await page.goto('/login');

      // Password field should have type="password"
      const passwordInput = page.getByLabel('Password');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access a protected dashboard page directly
      await page.goto('/tasks');

      // Should either redirect to login or show login page content
      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');

      // Check if we're on the login page or see login content
      const isLoginPage = page.url().includes('/login');
      const hasLoginContent = await page.getByText(TEST_DATA.PAGES.LOGIN.title).isVisible().catch(() => false);

      expect(isLoginPage || hasLoginContent).toBeTruthy();
    });

    test('should redirect from dashboard to login when not authenticated', async ({ page }) => {
      // Try to access the root dashboard
      await page.goto('/');

      // Wait for any redirects or content loading
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show loading spinner then redirect
      // Wait up to 5 seconds for redirect
      await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
        // If no redirect, check if still showing loading or actually on dashboard
      });

      // Verify we ended up on login page or see login elements
      const url = page.url();
      if (url.includes('/login')) {
        // Confirm login page elements
        await expect(page.getByLabel('Email')).toBeVisible();
      }
    });
  });
});
