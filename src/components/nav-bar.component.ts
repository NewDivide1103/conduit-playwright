import type { Locator, Page } from '@playwright/test';

/** The header navigation shared by every page. Links depend on whether the user is logged in. */
export class NavBar {
  readonly root: Locator;
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    // Scope every link to the header, so links with the same name in the body or footer don't match.
    // The feed pagination is a navigation landmark too; only the header has the "conduit" brand link.
    this.root = page.getByRole('navigation').filter({ has: page.getByRole('link', { name: 'conduit' }) });
    this.homeLink = this.root.getByRole('link', { name: 'Home' });
    this.signInLink = this.root.getByRole('link', { name: 'Sign in' });
    this.signUpLink = this.root.getByRole('link', { name: 'Sign up' });
    this.newArticleLink = this.root.getByRole('link', { name: 'New Article' });
    this.settingsLink = this.root.getByRole('link', { name: 'Settings' });
  }

  /** Link to the logged-in user's profile; its accessible name is the username. */
  profileLink(username: string): Locator {
    return this.root.getByRole('link', { name: username, exact: true });
  }

  async openSettings(): Promise<void> {
    await this.settingsLink.click();
  }
}
