import { test, expect, LOGGED_OUT } from '../../src/fixtures';

/**
 * Case 2: log in through the UI form.
 * Locator choices are documented in specs/login.md and live in LoginPage.
 */

// Tests of the login itself must start logged out.
test.use({ storageState: LOGGED_OUT });

test.describe('Login', () => {
  test(
    'user logs in with valid credentials',
    { tag: ['@smoke', '@regression'] },
    async ({ page, loginPage, homePage, newUser }) => {
      await loginPage.goto();
      await expect(loginPage.heading).toBeVisible();
      await loginPage.login(newUser.email, newUser.password);

      // Redirected home, nav switched to the logged-in state, token stored.
      await expect(page).toHaveURL('/');
      await expect(homePage.nav.profileLink(newUser.username)).toBeVisible();
      await expect(homePage.nav.newArticleLink).toBeVisible();
      await expect(homePage.nav.signInLink).toBeHidden();
      await expect.poll(() => homePage.getAuthToken()).toBeTruthy();
    },
  );

  test(
    'Sign in button is disabled until the form is filled',
    { tag: '@regression' },
    async ({ loginPage }) => {
      await loginPage.goto();

      await expect(loginPage.submitButton).toBeDisabled();
      await loginPage.emailInput.fill('someone@test.dev');
      await expect(loginPage.submitButton).toBeDisabled();
      await loginPage.passwordInput.fill('any-password');
      await expect(loginPage.submitButton).toBeEnabled();
    },
  );

  test(
    'wrong password shows an error and keeps the user logged out',
    { tag: '@regression' },
    async ({ page, loginPage, newUser }) => {
      await loginPage.goto();
      await loginPage.login(newUser.email, `${newUser.password}-wrong`);

      await expect(loginPage.errorMessages).toHaveText(['email or password is invalid']);
      await expect(page).toHaveURL('/login');
      await expect(loginPage.nav.signInLink).toBeVisible();
    },
  );
});
