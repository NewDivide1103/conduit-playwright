import { BasePage } from './base.page';

export class ArticlePage extends BasePage {
  readonly path = '/article';

  /** The article title is the page's level-1 heading, in the banner. */
  readonly title = this.page.getByRole('heading', { level: 1 });

  async open(slug: string): Promise<void> {
    await this.page.goto(`${this.path}/${slug}`);
  }
}
