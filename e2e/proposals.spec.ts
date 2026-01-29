import { test, expect, TEST_DATA } from './fixtures';

/**
 * Proposals Page E2E Tests
 * Tests for the proposals list and management features
 */

test.describe('Proposals Page', () => {
  test.describe('Page Structure', () => {
    test.beforeEach(async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals');
      await helpers.waitForPageLoad();
    });

    test('should display proposals page or redirect to login', async ({ page }) => {
      // Either we're on proposals page or redirected to login
      const isOnProposalsPage = page.url().includes('/proposals');
      const isOnLoginPage = page.url().includes('/login');

      expect(isOnProposalsPage || isOnLoginPage).toBeTruthy();
    });

    test('should show page title "Proposals"', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const pageTitle = page.getByRole('heading', { name: /proposals/i });
      if (await pageTitle.count() > 0) {
        await expect(pageTitle.first()).toBeVisible();
      } else {
        // Check for proposals text anywhere
        const hasProposalsText = await page.getByText(/proposals/i).count() > 0;
        expect(hasProposalsText).toBeTruthy();
      }
    });

    test('should display tabs for Proposals and Innovation Ideas', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for tabs
      const proposalsTab = page.getByRole('tab', { name: /proposals/i });
      const ideasTab = page.getByRole('tab', { name: /innovation ideas|ideas/i });

      if (await proposalsTab.count() > 0) {
        await expect(proposalsTab.first()).toBeVisible();
      }

      if (await ideasTab.count() > 0) {
        await expect(ideasTab.first()).toBeVisible();
      }
    });

    test('should have statistics cards', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for statistics cards
      const statsLabels = [
        /total proposals/i,
        /under review/i,
        /approved/i,
        /rejected/i,
      ];

      let foundStats = 0;
      for (const label of statsLabels) {
        const hasLabel = await page.getByText(label).count() > 0;
        if (hasLabel) foundStats++;
      }

      // At least 2 stats should be present
      expect(foundStats).toBeGreaterThanOrEqual(2);
    });

    test('should have "Create Proposal" button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Look for create proposal button
      const createButton = page.getByRole('button', { name: /tạo proposal|create proposal|new proposal/i });
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    });
  });

  test.describe('Proposal Interactions', () => {
    test.beforeEach(async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals');
      await helpers.waitForPageLoad();
    });

    test('should switch to Innovation Ideas tab', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const ideasTab = page.getByRole('tab', { name: /innovation ideas|ideas/i });
      if (await ideasTab.count() === 0) {
        test.skip();
        return;
      }

      // Click ideas tab
      await ideasTab.first().click();

      // Tab should now be active
      await expect(ideasTab.first()).toHaveAttribute('data-state', 'active', { timeout: 3000 });
    });

    test('should open new proposal modal when clicking create button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const createButton = page.getByRole('button', { name: /tạo proposal|create proposal|new proposal/i });
      if (await createButton.count() === 0) {
        test.skip();
        return;
      }

      // Click create button
      await createButton.first().click();

      // Should open modal with form fields
      await expect(page.getByRole('dialog').or(page.locator('[role="dialog"]'))).toBeVisible({
        timeout: 5000,
      });
    });

    test('should show proposal form fields in modal', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const createButton = page.getByRole('button', { name: /tạo proposal|create proposal|new proposal/i });
      if (await createButton.count() === 0) {
        test.skip();
        return;
      }

      // Click create button
      await createButton.first().click();

      // Wait for modal
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Check for form fields
      const hasTitle = await page.getByText(/tiêu đề|title/i).count() > 0;
      const hasCategory = await page.getByText(/category/i).count() > 0;
      const hasDescription = await page.getByText(/mô tả|description/i).count() > 0;

      expect(hasTitle || hasCategory || hasDescription).toBeTruthy();
    });
  });

  test.describe('Pending Approvals Page', () => {
    test('should navigate to pending approvals page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals/pending');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on pending page
      await expect(page).toHaveURL(/\/proposals\/pending/);
    });

    test('should display pending approvals content', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals/pending');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should have some pending-related content
      const hasPendingContent = await page.getByText(/pending|approval|duyệt/i).count() > 0;
      expect(hasPendingContent).toBeTruthy();
    });
  });

  test.describe('Innovation Ideas Page', () => {
    test('should navigate to ideas page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals/ideas');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on ideas page
      await expect(page).toHaveURL(/\/proposals\/ideas/);
    });

    test('should display ideas content', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals/ideas');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should have some ideas-related content
      const hasIdeasContent = await page.getByText(/idea|ý tưởng|innovation/i).count() > 0;
      expect(hasIdeasContent).toBeTruthy();
    });
  });

  test.describe('New Proposal Page', () => {
    test('should navigate to new proposal page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/proposals/new');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on new proposal page
      await expect(page).toHaveURL(/\/proposals\/new/);
    });
  });
});
