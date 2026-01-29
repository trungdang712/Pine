import { test as base, expect, Page } from '@playwright/test';

/**
 * Common test fixtures and utilities for Greenfield Dental E2E tests
 */

// Custom page type with helpers
interface TestHelpers {
  /**
   * Enable demo mode by setting localStorage before navigation
   */
  enableDemoMode: () => Promise<void>;

  /**
   * Navigate to a dashboard page with demo mode enabled
   */
  gotoDashboard: (path?: string) => Promise<void>;

  /**
   * Wait for the page to finish loading (spinners gone)
   */
  waitForPageLoad: () => Promise<void>;

  /**
   * Check if redirected to login page
   */
  isOnLoginPage: () => Promise<boolean>;
}

// Extend base test with custom fixtures
export const test = base.extend<{ helpers: TestHelpers }>({
  helpers: async ({ page }, use) => {
    const helpers: TestHelpers = {
      enableDemoMode: async () => {
        // Set demo mode in localStorage before any navigation
        await page.addInitScript(() => {
          localStorage.setItem('demo_mode', 'true');
        });
      },

      gotoDashboard: async (path = '/') => {
        // Enable demo mode first
        await page.addInitScript(() => {
          localStorage.setItem('demo_mode', 'true');
        });
        // Navigate to the page
        await page.goto(path);
        // Wait for any loading spinners to disappear
        await page.waitForLoadState('networkidle');
      },

      waitForPageLoad: async () => {
        // Wait for loading spinners to disappear
        await page.waitForLoadState('networkidle');
        // Wait for any loading indicators to be hidden
        const spinner = page.locator('.animate-spin');
        if (await spinner.count() > 0) {
          await spinner.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
            // Spinner may have already disappeared
          });
        }
      },

      isOnLoginPage: async () => {
        const url = page.url();
        return url.includes('/login');
      },
    };

    await use(helpers);
  },
});

export { expect };

/**
 * Test data constants
 */
export const TEST_DATA = {
  // Invalid test credentials (for testing error handling)
  INVALID_CREDENTIALS: {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  },

  // Page titles and identifiers
  PAGES: {
    LOGIN: {
      title: 'Greenfield Dental',
      subtitle: 'Marketing Command Center',
    },
    DASHBOARD: {
      title: 'Dashboard',
    },
    TASKS: {
      title: 'My Tasks',
      columns: ['TO DO', 'IN PROGRESS', 'REVIEW', 'DONE'],
    },
    PROPOSALS: {
      title: 'Proposals',
      tabs: ['Proposals', 'Innovation Ideas'],
    },
  },

  // Common selectors
  SELECTORS: {
    SIDEBAR: '[data-sidebar="sidebar"]',
    SIDEBAR_CONTENT: '[data-sidebar="content"]',
    LOADING_SPINNER: '.animate-spin',
    ERROR_MESSAGE: '[class*="destructive"]',
  },
};

/**
 * Utility function to wait for element with retry
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' } = {}
) {
  const { timeout = 5000, state = 'visible' } = options;
  try {
    await page.locator(selector).waitFor({ state, timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility function to check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).count() > 0;
}
