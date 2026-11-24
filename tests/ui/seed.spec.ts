import { test, expect } from '@playwright/test';

// Seed for Playwright Test Agents (planner / generator / healer).
// Run it in the "chromium" project: the "setup" dependency logs in via the API,
// so the agents start on the home page as an authenticated user.
test.describe('Seed', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'New Article' })).toBeVisible();
  });
});
