import { test, expect } from '../../src/fixtures';

test.describe('Home page (authenticated)', { tag: '@smoke' }, () => {
  test('logged-in user sees own profile link and New Article', async ({ homePage, authedUser }) => {
    await homePage.goto();

    await expect(homePage.nav.profileLink(authedUser.username)).toBeVisible();
    await expect(homePage.nav.newArticleLink).toBeVisible();
    await expect(homePage.nav.signInLink).toBeHidden();
  });
});
