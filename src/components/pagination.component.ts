import type { Locator, Page } from '@playwright/test';

/** Feed pagination: `nav > ul > li(.active) > button`. Items are buttons, not links. */
export class Pagination {
  /** Articles per page in every Conduit feed (`limit=10`). */
  static readonly PAGE_SIZE = 10;

  readonly root: Locator;
  /** All page buttons, in order: "1", "2", ... */
  readonly pageButtons: Locator;

  constructor(private readonly page: Page) {
    // The header is a navigation landmark too; the pagination is the one with a page "1" button.
    this.root = page
      .getByRole('navigation')
      .filter({ has: page.getByRole('button', { name: '1', exact: true }) });
    this.pageButtons = this.root.getByRole('button');
  }

  /** `exact` so that "1" does not match "10". */
  pageButton(pageNumber: number): Locator {
    return this.root.getByRole('button', { name: String(pageNumber), exact: true });
  }

  /**
   * The list item that holds a page button. The active page is marked only by the `active`
   * class on this item (no aria-current), so tests check it with `toHaveClass(/active/)`.
   */
  pageItem(pageNumber: number): Locator {
    return this.root.getByRole('listitem').filter({
      has: this.page.getByRole('button', { name: String(pageNumber), exact: true }),
    });
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.pageButton(pageNumber).click();
  }
}
