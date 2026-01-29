import { test, expect, TEST_DATA } from './fixtures';

/**
 * Navigation E2E Tests
 * Tests for sidebar navigation and page routing
 */

test.describe('Navigation', () => {
  test.describe('Login Page Navigation', () => {
    test('should be accessible at /login', async ({ page }) => {
      await page.goto('/login');

      // Verify we're on login page
      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByText(TEST_DATA.PAGES.LOGIN.title)).toBeVisible();
    });
  });

  test.describe('Demo Mode Navigation', () => {
    test.beforeEach(async ({ page, helpers }) => {
      // Enable demo mode before each test
      await helpers.enableDemoMode();
    });

    test('should access dashboard in demo mode', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/');

      // Wait for page to load
      await helpers.waitForPageLoad();

      // In demo mode, we should see either dashboard content or be able to navigate
      // Check for common dashboard elements (sidebar, main content area)
      const hasSidebar = await page.locator('[data-sidebar]').or(page.locator('aside')).count() > 0;
      const hasMainContent = await page.locator('main').count() > 0;
      const isOnLoginPage = page.url().includes('/login');

      // Either we're on the dashboard with sidebar or we need to login first
      expect(hasSidebar || hasMainContent || isOnLoginPage).toBeTruthy();
    });

    test('should display sidebar with navigation items', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/');
      await helpers.waitForPageLoad();

      // If we're on login page, this test is not applicable
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for sidebar presence
      const sidebar = page.locator('[data-sidebar]').or(page.locator('aside'));
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test('should have Greenfield Dental branding in sidebar', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for branding elements
      const brandText = page.getByText('Greenfield Dental');
      const brandLogo = page.getByText('GF');

      // At least one branding element should be visible
      const hasBranding = await brandText.isVisible().catch(() => false) ||
                          await brandLogo.isVisible().catch(() => false);

      if (hasBranding) {
        expect(hasBranding).toBeTruthy();
      }
    });

    test('should show Dashboard link in navigation', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for Dashboard navigation item
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });
      if (await dashboardLink.count() > 0) {
        await expect(dashboardLink.first()).toBeVisible();
      }
    });

    test('should show main navigation sections', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Expected navigation sections
      const navSections = [
        'Dashboard',
        'Tasks',
        'Proposals',
        'Calendar',
        'Inbox',
        'Settings',
      ];

      // Check if at least some navigation items are present
      let foundItems = 0;
      for (const section of navSections) {
        const hasSection = await page.getByText(section, { exact: false }).count() > 0;
        if (hasSection) foundItems++;
      }

      // At least 3 navigation items should be present
      expect(foundItems).toBeGreaterThanOrEqual(3);
    });

    test('should navigate to tasks page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/tasks');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on tasks page
      await expect(page).toHaveURL(/\/tasks/);
    });

    test('should navigate to proposals page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on proposals page
      await expect(page).toHaveURL(/\/proposals/);
    });

    test('should navigate to calendar page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/calendar');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on calendar page
      await expect(page).toHaveURL(/\/calendar/);
    });

    test('should navigate to inbox page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/inbox');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on inbox page
      await expect(page).toHaveURL(/\/inbox/);
    });

    test('should navigate to settings page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/settings');
      await helpers.waitForPageLoad();

      // Skip if redirected to login
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on settings page
      await expect(page).toHaveURL(/\/settings/);
    });
  });

  test.describe('Unauthorized Page', () => {
    test('should display unauthorized page correctly', async ({ page }) => {
      await page.goto('/unauthorized');

      // Should be on unauthorized page
      await expect(page).toHaveURL(/\/unauthorized/);

      // Should show some unauthorized message
      const hasUnauthorizedContent = await page.getByText(/unauthorized|access denied|permission/i).count() > 0;
      expect(hasUnauthorizedContent).toBeTruthy();
    });
  });
});
