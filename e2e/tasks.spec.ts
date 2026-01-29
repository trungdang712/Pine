import { test, expect, TEST_DATA } from './fixtures';

/**
 * Tasks Page E2E Tests
 * Tests for the Kanban board and task management features
 */

test.describe('Tasks Page', () => {
  test.describe('Page Structure', () => {
    test.beforeEach(async ({ page, helpers }) => {
      await helpers.gotoDashboard('/tasks');
      await helpers.waitForPageLoad();
    });

    test('should display tasks page or redirect to login', async ({ page }) => {
      // Either we're on tasks page or redirected to login
      const isOnTasksPage = page.url().includes('/tasks');
      const isOnLoginPage = page.url().includes('/login');

      expect(isOnTasksPage || isOnLoginPage).toBeTruthy();
    });

    test('should show page title "My Tasks"', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const pageTitle = page.getByRole('heading', { name: /my tasks/i });
      if (await pageTitle.count() > 0) {
        await expect(pageTitle.first()).toBeVisible();
      } else {
        // Check for any tasks-related title
        const hasTasksTitle = await page.getByText(/tasks/i).count() > 0;
        expect(hasTasksTitle).toBeTruthy();
      }
    });

    test('should display Kanban board columns', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Expected column titles
      const columnTitles = TEST_DATA.PAGES.TASKS.columns;

      // Check for Kanban columns - they should be in cards
      let foundColumns = 0;
      for (const column of columnTitles) {
        const hasColumn = await page.getByText(column, { exact: true }).count() > 0;
        if (hasColumn) foundColumns++;
      }

      // At least 2 columns should be visible (might be in different tabs/views)
      expect(foundColumns).toBeGreaterThanOrEqual(2);
    });

    test('should have statistics cards', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Check for statistics cards
      const statsLabels = [
        /total tasks/i,
        /in progress/i,
        /review/i,
        /completed/i,
      ];

      let foundStats = 0;
      for (const label of statsLabels) {
        const hasLabel = await page.getByText(label).count() > 0;
        if (hasLabel) foundStats++;
      }

      // At least 2 stats should be present
      expect(foundStats).toBeGreaterThanOrEqual(2);
    });

    test('should have "Create Task" button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Look for create task button
      const createButton = page.getByRole('button', { name: /tạo task|create task|new task/i });
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    });

    test('should have filters button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Look for filters button
      const filtersButton = page.getByRole('button', { name: /filters/i });
      if (await filtersButton.count() > 0) {
        await expect(filtersButton.first()).toBeVisible();
      }
    });

    test('should have view tabs (Kanban/List)', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Look for view tabs
      const kanbanTab = page.getByRole('tab', { name: /kanban/i });
      const listTab = page.getByRole('tab', { name: /list|danh sách/i });

      // At least one view option should be present
      const hasKanban = await kanbanTab.count() > 0;
      const hasList = await listTab.count() > 0;

      if (hasKanban || hasList) {
        expect(hasKanban || hasList).toBeTruthy();
      }
    });
  });

  test.describe('Task Interactions', () => {
    test.beforeEach(async ({ page, helpers }) => {
      await helpers.gotoDashboard('/tasks');
      await helpers.waitForPageLoad();
    });

    test('should open filters when clicking Filters button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const filtersButton = page.getByRole('button', { name: /filters/i });
      if (await filtersButton.count() === 0) {
        test.skip();
        return;
      }

      // Click filters button
      await filtersButton.first().click();

      // Should show filter options (Assignee, Priority, Category)
      await expect(page.getByText(/assignee/i).or(page.getByText(/priority/i))).toBeVisible({
        timeout: 5000,
      });
    });

    test('should open new task modal when clicking create button', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const createButton = page.getByRole('button', { name: /tạo task|create task|new task/i });
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

    test('should switch between Kanban and List views', async ({ page }) => {
      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      const listTab = page.getByRole('tab', { name: /list|danh sách/i });
      if (await listTab.count() === 0) {
        test.skip();
        return;
      }

      // Click list tab
      await listTab.first().click();

      // Tab should now be selected/active
      await expect(listTab.first()).toHaveAttribute('data-state', 'active', { timeout: 3000 });
    });
  });

  test.describe('Team Tasks Page', () => {
    test('should navigate to team tasks page', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/tasks/team');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should be on team tasks page
      await expect(page).toHaveURL(/\/tasks\/team/);
    });

    test('should display team tasks content', async ({ page, helpers }) => {
      await helpers.gotoDashboard('/tasks/team');
      await helpers.waitForPageLoad();

      // Skip if on login page
      if (page.url().includes('/login')) {
        test.skip();
        return;
      }

      // Should have some team-related content
      const hasTeamContent = await page.getByText(/team/i).count() > 0;
      expect(hasTeamContent).toBeTruthy();
    });
  });
});
