/** Response shapes of the Conduit API, only the fields the tests use. Full schemas come with zod in stage 5. */

export interface Article {
  slug: string;
  title: string;
  description: string;
  tagList: string[];
  author: { username: string };
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface TagsResponse {
  tags: string[];
}
