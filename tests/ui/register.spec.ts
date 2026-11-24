import { test, expect, LOGGED_OUT } from '../../src/fixtures';
import { buildUser } from '../../src/data/user.factory';

/**
 * Case 1: sign up through the UI form.
 * Negative sign-up cases (case 4) are parameterized in stage 4.
 */

test.use({ storageState: LOGGED_OUT });

test.describe('Sign up', () => {
  test(
    'new user signs up and is logged in',
    { tag: ['@smoke', '@regression'] },
    async ({ page, registerPage, homePage }) => {
      // Unique data per run. No cleanup: Conduit has no API to delete users.
      const user = buildUser();

      await registerPage.goto();
      await expect(registerPage.heading).toBeVisible();
      await registerPage.register(user);

      await expect(page).toHaveURL('/');
      await expect(homePage.nav.profileLink(user.username)).toBeVisible();
      await expect(homePage.nav.newArticleLink).toBeVisible();
      await expect(homePage.nav.signUpLink).toBeHidden();
      await expect.poll(() => homePage.getAuthToken()).toBeTruthy();
    },
  );

  test(
    'Sign up button is disabled until all fields are filled',
    { tag: '@regression' },
    async ({ registerPage }) => {
      const user = buildUser();
      await registerPage.goto();

      await expect(registerPage.submitButton).toBeDisabled();
      await registerPage.fillForm({ username: user.username, email: user.email });
      await expect(registerPage.submitButton).toBeDisabled();
      await registerPage.passwordInput.fill(user.password);
      await expect(registerPage.submitButton).toBeEnabled();
    },
  );
});
