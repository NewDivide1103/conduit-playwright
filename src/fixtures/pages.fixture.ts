import { test as base } from '@playwright/test';
import { ArticlePage, HomePage, LoginPage, RegisterPage, SettingsPage } from '../pages';

export interface PageFixtures {
  articlePage: ArticlePage;
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  settingsPage: SettingsPage;
}

/** One Page Object per fixture, all bound to the test's `page`. Created lazily, only when a test asks for it. */
export const test = base.extend<PageFixtures>({
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});
