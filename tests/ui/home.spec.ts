import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { USER_FILE } from '../../src/config/env';

test.describe('Home page (authenticated)', { tag: '@smoke' }, () => {
  test('logged-in user sees own profile link and New Article', async ({ page }) => {
    const { username } = JSON.parse(fs.readFileSync(USER_FILE, 'utf-8'));

    await page.goto('/');

    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: username })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'New Article' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sign in' })).toBeHidden();
  });
});
