import type { ArticlesResponse, TagsResponse } from '../api/types';
import { ArticlePreview } from '../components/article-preview.component';
import { Pagination } from '../components/pagination.component';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly path = '/';

  /** Shown only to logged-out users. */
  readonly banner = this.page.getByText('A place to learn and practice test automation.');
  // The tabs are plain elements with no link/tab role, so text is the most user-facing option.
  // The selected tab is marked by the `active` class.
  readonly globalFeedTab = this.page.getByText('Global Feed');
  readonly yourFeedTab = this.page.getByText('Your Feed');

  // CSS on purpose: a card has no role or test id, so the Angular component tag is the container.
  readonly previews = this.page.locator('app-article-preview');
  readonly previewTitles = this.previews.getByRole('heading', { level: 1 });
  readonly pagination = new Pagination(this.page);

  readonly popularTagsHeading = this.page.getByText('Popular Tags');
  // CSS on purpose: sidebar chips have no role, name or test id, and getByText can't tell them
  // apart from the tags inside the previews, so the selector is scoped to the sidebar.
  readonly popularTags = this.page.locator('.sidebar .tag-list a');

  preview(index: number): ArticlePreview {
    return new ArticlePreview(this.previews.nth(index));
  }

  /** Open `/` and return the Global Feed response (`GET /articles?limit=10&offset=0`) the page received. */
  async openGlobalFeed(): Promise<ArticlesResponse> {
    return this.gotoAndCapture<ArticlesResponse>('/api/articles?');
  }

  /** Open `/` and return the `GET /tags` response the Popular Tags sidebar was built from. */
  async openAndCaptureTags(): Promise<TagsResponse> {
    return this.gotoAndCapture<TagsResponse>('/api/tags');
  }
}
