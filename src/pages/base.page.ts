import type { Page } from '@playwright/test';
import { NavBar } from '../components/nav-bar.component';

/**
 * Common base for Page Objects: navigation by path and the shared header.
 * Page Objects expose locators and user actions only; assertions stay in the tests.
 */
export abstract class BasePage {
  /** Path relative to `baseURL`, used by `goto()`. */
  abstract readonly path: string;
  readonly nav: NavBar;

  constructor(readonly page: Page) {
    this.nav = new NavBar(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Conduit keeps the JWT in localStorage; `null` means the user is logged out. */
  async getAuthToken(): Promise<string | null> {
    return this.page.evaluate(() => localStorage.getItem('jwtToken'));
  }

  /**
   * Open the page and return the JSON body of the first GET request whose URL contains `urlPart`.
   * Lets tests compare the UI with the exact data the page received, which matters on a shared
   * demo site where the data changes all the time. Throws (no assertion) if the request fails.
   */
  protected async gotoAndCapture<T>(urlPart: string): Promise<T> {
    const responsePromise = this.page.waitForResponse(
      (r) => r.url().includes(urlPart) && r.request().method() === 'GET',
    );
    await this.goto();
    const response = await responsePromise;
    if (!response.ok()) {
      throw new Error(`GET ${response.url()} failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as T;
  }
}
