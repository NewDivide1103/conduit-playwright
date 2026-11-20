import { test, expect } from '@playwright/test';
import { registerUser } from '../../src/api/auth.api';
import { buildUser } from '../../src/data/user.factory';

/**
 * Case 2: log in through the UI form.
 * Stage 2 of the roadmap: written without Page Objects on purpose, to practice locators.
 * The form inputs have no <label>, so their accessible name comes from the placeholder:
 * getByRole('textbox', { name: 'Email' }) works and is preferred over getByPlaceholder.
 */

// Tests of the login itself must start logged out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test(
    'user logs in with valid credentials',
    { tag: ['@smoke', '@regression'] },
    async ({ page, request }) => {
      // Arrange: a unique user created via the API (Conduit has no API to delete users).
      const user = buildUser();
      await registerUser(request, user);

      // Act
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign in', level: 1 })).toBeVisible();
      await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(user.password);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Assert: redirected home, nav switched to the logged-in state, token stored.
      const nav = page.getByRole('navigation');
      await expect(page).toHaveURL('/');
      await expect(nav.getByRole('link', { name: user.username })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'New Article' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Sign in' })).toBeHidden();
      await expect.poll(() => page.evaluate(() => localStorage.getItem('jwtToken'))).toBeTruthy();
    },
  );

  test('Sign in button is disabled until the form is filled', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/login');
    const signIn = page.getByRole('button', { name: 'Sign in' });

    await expect(signIn).toBeDisabled();
    await page.getByRole('textbox', { name: 'Email' }).fill('someone@test.dev');
    await expect(signIn).toBeDisabled();
    await page.getByRole('textbox', { name: 'Password' }).fill('any-password');
    await expect(signIn).toBeEnabled();
  });

  test(
    'wrong password shows an error and keeps the user logged out',
    { tag: '@regression' },
    async ({ page, request }) => {
      const user = buildUser();
      await registerUser(request, user);

      await page.goto('/login');
      await page.getByRole('textbox', { name: 'Email' }).fill(user.email);
      await page.getByRole('textbox', { name: 'Password' }).fill(`${user.password}-wrong`);
      await page.getByRole('button', { name: 'Sign in' }).click();

      // The error is a plain <li> without a role or test id, so getByText is the best fit.
      await expect(page.getByText('email or password is invalid')).toBeVisible();
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('navigation').getByRole('link', { name: 'Sign in' })).toBeVisible();
    },
  );
});
