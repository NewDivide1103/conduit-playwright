import { test, expect, LOGGED_OUT } from '../../src/fixtures';
import { Pagination } from '../../src/components/pagination.component';

// Backlog case 11: Global Feed + pagination. Plan: specs/feed.md (scenarios 11.1–11.6).
// Expected values always come from the API response the page itself received,
// because the shared demo site's data changes all the time.

test.describe('Global Feed', () => {
  test(
    'Logged in: Global Feed is the default tab and shows 10 previews',
    { tag: ['@smoke', '@regression'] },
    async ({ homePage }) => {
      const { articles } = await homePage.openGlobalFeed();

      await expect(homePage.globalFeedTab).toHaveClass(/active/);
      await expect(homePage.yourFeedTab).toBeVisible();
      await expect(homePage.yourFeedTab).not.toHaveClass(/active/);

      await expect(homePage.previewTitles).toHaveCount(articles.length);

      const first = homePage.preview(0);
      await expect(first.authorLink(articles[0].author.username)).toHaveAttribute('href', /^\/profile\//);
      await expect(first.date).toBeVisible();
      await expect(first.likeButton).toHaveText(/\d+/);
      await expect(first.description).toHaveText(/\S/);
      await expect(first.readMore).toBeVisible();
      await expect(first.title).toHaveText(articles[0].title);
    },
  );

  test('Every preview has the full structure', { tag: '@regression' }, async ({ homePage }) => {
    const { articles } = await homePage.openGlobalFeed();

    await expect(homePage.previews).toHaveCount(articles.length);
    for (const [index, article] of articles.entries()) {
      const preview = homePage.preview(index);
      await expect(preview.authorLink(article.author.username)).toHaveAttribute('href', /^\/profile\//);
      await expect(preview.date).toBeVisible();
      await expect(preview.likeButton).toHaveText(/\d+/);
      await expect(preview.title).toHaveText(article.title);
      await expect(preview.description).toHaveText(/\S/);
      await expect(preview.readMore).toBeVisible();
      await expect(preview.tags).toHaveText(article.tagList);
    }
  });

  test(
    'Clicking a preview title opens the article page',
    { tag: '@regression' },
    async ({ page, homePage, articlePage }) => {
      const { articles } = await homePage.openGlobalFeed();
      const { title, slug } = articles[0];

      const first = homePage.preview(0);
      await expect(first.titleLink).toContainText(title);
      await first.titleLink.click();

      await expect(page).toHaveURL(`${articlePage.path}/${slug}`);
      await expect(articlePage.title).toHaveText(title);
    },
  );

  test('Popular Tags sidebar matches the tags API', { tag: '@regression' }, async ({ homePage }) => {
    const { tags } = await homePage.openAndCaptureTags();

    await expect(homePage.popularTagsHeading).toBeVisible();
    await expect(homePage.popularTags).toHaveText(tags.slice(0, 10));
  });

  test('Page-link count matches the API total', { tag: '@regression' }, async ({ homePage }) => {
    const { articlesCount } = await homePage.openGlobalFeed();
    const pageCount = Math.ceil(articlesCount / Pagination.PAGE_SIZE);
    const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1);
    const { pagination } = homePage;

    await expect(pagination.pageButtons).toHaveText(pageNumbers.map(String));
    await expect(pagination.pageItem(1)).toHaveClass(/active/);
    for (const pageNumber of pageNumbers.slice(1)) {
      await expect(pagination.pageItem(pageNumber)).not.toHaveClass(/active/);
    }
  });

  test.describe('anonymous', () => {
    test.use({ storageState: LOGGED_OUT });

    test('Anonymous: Global Feed is visible and active', { tag: '@regression' }, async ({ homePage }) => {
      const { articles } = await homePage.openGlobalFeed();

      await expect(homePage.nav.signInLink).toBeVisible();
      await expect(homePage.nav.signUpLink).toBeVisible();
      await expect(homePage.nav.newArticleLink).toBeHidden();
      await expect(homePage.nav.settingsLink).toBeHidden();
      await expect(homePage.banner).toBeVisible();

      await expect(homePage.globalFeedTab).toHaveClass(/active/);
      await expect(homePage.previewTitles).toHaveText(articles.map((a) => a.title));
      for (const [index, article] of articles.entries()) {
        await expect(homePage.preview(index).authorLink(article.author.username)).toBeVisible();
      }
    });
  });
});
