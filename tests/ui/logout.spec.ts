import { test, expect } from '../../src/fixtures';

/**
 * Case 5: log out from the Settings page.
 * Starts logged in through the shared storageState. Logging out only clears this browser
 * context's localStorage; the JWT itself stays valid, so parallel tests are not affected.
 */
test.describe('Logout', () => {
  test(
    'user logs out from Settings',
    { tag: ['@smoke', '@regression'] },
    async ({ page, homePage, settingsPage, authedUser }) => {
      await homePage.goto();
      await homePage.nav.openSettings();
      await expect(settingsPage.heading).toBeVisible();

      await settingsPage.logout();

      await expect(page).toHaveURL('/');
      await expect(homePage.nav.signInLink).toBeVisible();
      await expect(homePage.nav.signUpLink).toBeVisible();
      await expect(homePage.nav.profileLink(authedUser.username)).toBeHidden();
      await expect.poll(() => homePage.getAuthToken()).toBeNull();

      // The logged-out state survives a reload.
      await page.reload();
      await expect(homePage.nav.signInLink).toBeVisible();
    },
  );
});
