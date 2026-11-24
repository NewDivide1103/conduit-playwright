import { test, expect } from '../../src/fixtures';

// Seed for Playwright Test Agents (planner / generator / healer).
// Run it in the "chromium" project: the "setup" dependency logs in via the API,
// so the agents start on the home page as an authenticated user.
// It imports the project fixtures, so generated tests follow the same Page Object style.
test.describe('Seed', () => {
  test('seed', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.nav.newArticleLink).toBeVisible();
  });
});
