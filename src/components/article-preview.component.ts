import type { Locator } from '@playwright/test';

/** "January 27, 2024". No anchors: the date element has surrounding whitespace. */
const DATE_FORMAT = /[A-Z][a-z]+ \d{1,2}, \d{4}/;

/** One article card in a feed. All locators are scoped to the card's root. */
export class ArticlePreview {
  /** The level-1 heading inside the card. */
  readonly title: Locator;
  /** The link that wraps the title, description, "Read more..." and tags; opens the article. */
  readonly titleLink: Locator;
  readonly description: Locator;
  readonly date: Locator;
  /** Only button in the card; its name is a heart glyph plus the like count. */
  readonly likeButton: Locator;
  readonly readMore: Locator;
  readonly tags: Locator;

  constructor(readonly root: Locator) {
    this.title = root.getByRole('heading', { level: 1 });
    // `has` is resolved inside each candidate link, so it must not be chained from the card root.
    this.titleLink = root.getByRole('link').filter({ has: root.page().getByRole('heading', { level: 1 }) });
    this.description = root.getByRole('paragraph');
    this.date = root.getByText(DATE_FORMAT);
    this.likeButton = root.getByRole('button');
    this.readMore = root.getByText('Read more...');
    this.tags = root.getByRole('listitem');
  }

  /** The avatar link has no name, so a named link is the author's username link. */
  authorLink(username: string): Locator {
    return this.root.getByRole('link', { name: username, exact: true });
  }
}
