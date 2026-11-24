import { test, expect, type Page } from '@playwright/test';

// Backlog case 11: Global Feed + pagination. Plan: specs/feed.md (scenarios 11.1–11.6).
// Expected values always come from the API response the page itself received,
// because the shared demo site's data changes all the time.

const PAGE_SIZE = 10;
const DATE_FORMAT = /[A-Z][a-z]+ \d{1,2}, \d{4}/; // no anchors: the date span has surrounding whitespace

type FeedResponse = {
  articles: {
    slug: string;
    title: string;
    tagList: string[];
    author: { username: string };
  }[];
  articlesCount: number;
};

/** Open "/" and return the Global Feed response the page received. */
async function openGlobalFeed(page: Page): Promise<FeedResponse> {
  const feedResponse = page.waitForResponse(
    (r) => r.url().includes('/api/articles?') && r.request().method() === 'GET',
  );
  await page.goto('/');
  const response = await feedResponse;
  expect(response.status()).toBe(200);
  return (await response.json()) as FeedResponse;
}

/** Article cards. CSS exception: the card has no role or test id, so the component tag is the container. */
const previews = (page: Page) => page.locator('app-article-preview');

test.describe('Global Feed', () => {
  test(
    'Logged in: Global Feed is the default tab and shows 10 previews',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      const { articles } = await openGlobalFeed(page);

      await expect(page.getByText('Global Feed')).toHaveClass(/active/);
      await expect(page.getByText('Your Feed')).toBeVisible();
      await expect(page.getByText('Your Feed')).not.toHaveClass(/active/);

      await expect(previews(page).getByRole('heading', { level: 1 })).toHaveCount(articles.length);

      const first = previews(page).first();
      await expect(first.getByRole('link', { name: articles[0].author.username })).toHaveAttribute(
        'href',
        /^\/profile\//,
      );
      await expect(first.getByText(DATE_FORMAT)).toBeVisible();
      await expect(first.getByRole('button')).toHaveText(/\d+/);
      await expect(first.getByRole('paragraph')).toHaveText(/\S/);
      await expect(first.getByText('Read more...')).toBeVisible();
      await expect(first.getByRole('heading', { level: 1 })).toHaveText(articles[0].title);
    },
  );

  test('Every preview has the full structure', { tag: '@regression' }, async ({ page }) => {
    const { articles } = await openGlobalFeed(page);

    await expect(previews(page)).toHaveCount(articles.length);
    for (const [index, article] of articles.entries()) {
      const preview = previews(page).nth(index);
      await expect(preview.getByRole('link', { name: article.author.username })).toHaveAttribute(
        'href',
        /^\/profile\//,
      );
      await expect(preview.getByText(DATE_FORMAT)).toBeVisible();
      await expect(preview.getByRole('button')).toHaveText(/\d+/);
      await expect(preview.getByRole('heading', { level: 1 })).toHaveText(article.title);
      await expect(preview.getByRole('paragraph')).toHaveText(/\S/);
      await expect(preview.getByText('Read more...')).toBeVisible();
      await expect(preview.getByRole('listitem')).toHaveText(article.tagList);
    }
  });

  test('Clicking a preview title opens the article page', { tag: '@regression' }, async ({ page }) => {
    const { articles } = await openGlobalFeed(page);
    const { title, slug } = articles[0];

    const titleLink = previews(page)
      .first()
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { level: 1 }) });
    await expect(titleLink).toContainText(title);
    await titleLink.click();

    await expect(page).toHaveURL(`/article/${slug}`);
    await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
  });

  test('Popular Tags sidebar matches the tags API', { tag: '@regression' }, async ({ page }) => {
    const tagsResponse = page.waitForResponse(
      (r) => r.url().includes('/api/tags') && r.request().method() === 'GET',
    );
    await page.goto('/');
    const response = await tagsResponse;
    expect(response.status()).toBe(200);
    const { tags } = (await response.json()) as { tags: string[] };

    await expect(page.getByText('Popular Tags')).toBeVisible();
    // CSS exception: sidebar chips have no role, name or test id, and getByText cannot tell them
    // apart from the tags inside the previews, so the selector is scoped to the sidebar.
    await expect(page.locator('.sidebar .tag-list a')).toHaveText(tags.slice(0, 10));
  });

  test('Page-link count matches the API total', { tag: '@regression' }, async ({ page }) => {
    const { articlesCount } = await openGlobalFeed(page);
    const pageNames = Array.from({ length: Math.ceil(articlesCount / PAGE_SIZE) }, (_, i) => String(i + 1));

    const pagination = page
      .getByRole('navigation')
      .filter({ has: page.getByRole('button', { name: '1', exact: true }) });
    await expect(pagination.getByRole('button')).toHaveText(pageNames);

    // The active page is marked only by the `active` class on its list item (no aria-current).
    const item = (name: string) =>
      pagination.getByRole('listitem').filter({ has: page.getByRole('button', { name, exact: true }) });
    await expect(item('1')).toHaveClass(/active/);
    for (const name of pageNames.slice(1)) {
      await expect(item(name)).not.toHaveClass(/active/);
    }
  });

  test.describe('anonymous', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Anonymous: Global Feed is visible and active', { tag: '@regression' }, async ({ page }) => {
      const { articles } = await openGlobalFeed(page);

      const nav = page.getByRole('navigation').first();
      await expect(nav.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Sign up' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'New Article' })).toBeHidden();
      await expect(nav.getByRole('link', { name: 'Settings' })).toBeHidden();
      await expect(page.getByText('A place to learn and practice test automation.')).toBeVisible();

      await expect(page.getByText('Global Feed')).toHaveClass(/active/);
      await expect(previews(page).getByRole('heading', { level: 1 })).toHaveText(
        articles.map((a) => a.title),
      );
      for (const [index, article] of articles.entries()) {
        await expect(
          previews(page).nth(index).getByRole('link', { name: article.author.username }),
        ).toBeVisible();
      }
    });
  });
});
