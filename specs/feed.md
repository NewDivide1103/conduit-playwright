# Global Feed and pagination: test plan

## Application Overview

Backlog case 11 for Conduit (https://conduit.bondaracademy.com). Seed file: `tests/ui/seed.spec.ts` (the `setup` project logs in via the API, so UI tests start authenticated on `/`). Implemented in `tests/ui/feed.spec.ts` (11.1–11.6). Anonymous scenarios use `test.use({ storageState: LOGGED_OUT })`.

Since roadmap stage 3 the locators in the table below live in Page Objects, not in the spec:
[`HomePage`](../src/pages/home.page.ts) (tabs, previews, Popular Tags, `openGlobalFeed()` / `openAndCaptureTags()`
that return the response the page received), [`ArticlePreview`](../src/components/article-preview.component.ts),
[`Pagination`](../src/components/pagination.component.ts) and [`ArticlePage`](../src/pages/article.page.ts).

## Scenarios table

| #     | Scenario                                                    | Expected result                                                                                   | Tags                    |
| ----- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------- |
| 11.1  | Logged in: Global Feed is the default and shows 10 previews | Global Feed tab active; preview count == API `limit`; first preview structure and title match API | `@smoke`, `@regression` |
| 11.2  | Anonymous: Global Feed visible                              | Sign in / Sign up in nav; Global Feed active; previews == API                                     | `@regression`           |
| 11.3  | Every preview has the full structure                        | Author, date, like count, title, description, Read more..., tags in each preview                  | `@regression`           |
| 11.4  | Click a title opens the article                             | URL `/article/<slug>`; heading equals the preview title                                           | `@regression`           |
| 11.5  | Popular Tags sidebar matches `GET /tags`                    | Up to 10 non-empty tags, all present in the API list                                              | `@regression`           |
| 11.6  | Page-link count matches the API total                       | buttons == ceil(articlesCount / 10), names 1..N, page 1 active                                    | `@regression`           |
| 11.7  | Page 2 shows the API `offset=10` articles                   | Request with `offset=10`; page 2 active; titles == API; URL unchanged                             | `@regression`           |
| 11.8  | Back to page 1 from page 2                                  | Page 1 active; titles == API `offset=0`                                                           | `@regression`           |
| 11.9  | Last page shows the remainder                               | previews == articlesCount - (pages-1)*10                                                          | `@regression`           |
| 11.10 | Reload while on page 2                                      | Documented behavior (expected: back to page 1, URL has no page param)                             | `@regression`           |
| 11.11 | Single-page feed (optional, mocked with `page.route`)       | 3 previews, one active button 1, no button 2                                                      | `@regression`           |

## Assumptions

- Fresh state; shared data on the demo site changes, so every expectation is structural or cross-checked against the API at assertion time (`GET /articles?limit=10&offset=N`, read through the `api` fixture or `page.waitForResponse`).
- At exploration time (2026-11-24) the site had only 10 articles (`articlesCount: 10`), so only page button 1 existed. Scenarios 11.7 to 11.10 need more than 10 articles: a fixture creates 11 articles for the test user via the API (`POST /articles`, faker titles) and deletes them in teardown. No UI steps for creating articles. Because other runs add articles in parallel, compute page counts from the API response in the same test, never hardcode them.
- Not verified live because only one page existed: the `offset=10` request, the URL after page switch (expected to stay `/`), reload behavior. The generator must confirm these on first run and adjust 11.7 and 11.10.
- Shared-data race: tests in other workers and browsers create and delete articles at the same time. That can shift page 2 between the UI request and a separate API call. In 11.7–11.9, compare UI titles with the body of the response the UI itself received (`page.waitForResponse`), not with a second API call.
- Optional: `page.route('**/api/articles*', ...)` would make 11.1, 11.6 and 11.11 fully deterministic (later stage).
- No `waitForTimeout`, no `if` in tests; web-first assertions only.

## Exploration findings

- Default tab: **Global Feed** has class `active` for both logged-in and anonymous users. **Your Feed** is present but not active, even for a new user who follows nobody. A third empty `nav-item` with an `active` link exists in the DOM (hidden tag tab).
- Page size is 10 (`limit=10&offset=0`). Authenticated home load sends the feed request twice, so do not assert request counts.
- Pagination: `nav > ul.pagination > li.page-item(.active) > button.page-link`. Items are buttons, not links; active state is the `active` class on the `li`, no `aria-current`.
- Logged out nav: conduit, Home, Sign in, Sign up, plus a banner `A place to learn and practice test automation.`. Logged in nav: Home, New Article, Settings, profile link.

## Locators (from the real accessibility tree)

```yaml
- navigation: [link "Home", link "New Article", link "Settings", link "<username>"]
- list: [listitem "Your Feed", listitem "Global Feed"]   # plain generic elements, no link/button role
- article preview (repeated):
    - link (avatar, no name) /profile/<author>
    - link "Artem Bondar" /profile/<author>
    - generic "January 27, 2024"
    - button " 2329"      # glyph + like count
    - link:               # wraps the title block, /article/<slug>
        - heading "<title>" [level=1]
        - paragraph: <description>
        - text: Read more...
        - list: [listitem "<tag>", ...]
- navigation: list: listitem: button "1"      # pagination, inside the feed
- paragraph "Popular Tags", then tag chips (generic, no role)
```

| Element             | Chosen locator                                                                                                                                                     | Why                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feed tabs           | `getByText('Global Feed')`, `getByText('Your Feed')`                                                                                                               | No role is exposed (plain elements); text is the most user-facing option. Active: `toHaveClass(/active/)`                                                                                                                       |
| Preview (one item)  | `getByRole('link').filter({ has: page.getByRole('heading', { level: 1 }) })` for the title link; for a whole card, `locator('app-article-preview')`                | The card has no role or test id. CSS/custom-element tag used only as a container, because there is no accessible wrapper                                                                                                        |
| Titles              | `getByRole('heading', { level: 1 })` scoped to the feed container                                                                                                  | Heading role with level; scope it because the banner `conduit` is also a level-1 heading                                                                                                                                        |
| Author link         | `preview.getByRole('link', { name: articles[i].author.username })` (name from the API response)                                                                    | The avatar link has no name, so a named-link locator excludes it; the name comes from the API, never hardcoded, because demo data changes                                                                                       |
| Like button         | `preview.getByRole('button')`                                                                                                                                      | Only one button per card; name is glyph + count, so assert with a regexp `/\d+/`                                                                                                                                                |
| Read more           | `preview.getByText('Read more...')`                                                                                                                                | Plain text node                                                                                                                                                                                                                 |
| Tags in a preview   | `preview.getByRole('listitem')`                                                                                                                                    | Real `li` elements                                                                                                                                                                                                              |
| Pagination          | `page.getByRole('navigation').last()` or `.filter({ has: getByRole('button', { name: '1' }) })`; page `N`: `getByRole('button', { name: String(N), exact: true })` | Role `button` (not link); `exact: true` so `1` does not match `10`. Several navigation landmarks exist (header nav), hence the filter                                                                                           |
| Active page         | `getByRole('listitem').filter({ has: getByRole('button', { name: '1', exact: true }) })` with `toHaveClass(/active/)`                                              | No `aria-current`, the class is the only signal                                                                                                                                                                                 |
| Popular Tags        | Heading: `getByText('Popular Tags')`. Chips: `page.locator('.sidebar .tag-list a')` (exception)                                                                    | Chips have no role, name or test id, and `getByText` cannot tell them apart from tags in the previews. A CSS selector scoped to the sidebar is the stated exception (`locator('..')` parent traversal would be just as brittle) |
| Nav (logged in/out) | `getByRole('navigation').getByRole('link', { name: 'Sign in' })`                                                                                                   | Chaining avoids footer links                                                                                                                                                                                                    |

Rejected: `getByRole('tab')` (tabs are not exposed as tabs), `getByRole('link', { name: '2' })` (pagination items are buttons), `getByTestId` (no test ids on the page).

## Test Scenarios

### 1. Global Feed and pagination (case 11)

**Seed:** `tests/ui/seed.spec.ts`

#### 1.1. 11.1 Logged in: Global Feed is the default tab and shows 10 previews (@smoke, @regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Register `page.waitForResponse` for `GET /articles?limit=10&offset=0` before opening `/` as the authenticated user, then open `/` and read the JSON body. - expect: Status 200; body has `articles` and `articlesCount`.
2. Check the tabs. - expect: `getByText('Global Feed')` has class `active`; `getByText('Your Feed')` is visible and not active.
3. Count the previews (title headings in the feed). - expect: `toHaveCount(apiBody.articles.length)` (10 on a full feed).
4. Inspect the first preview. - expect: Author link `href` starts with `/profile/`; date matches `/^[A-Z][a-z]+ \d{1,2}, \d{4}$/`; like button text matches `/\d+/`; description non-empty; `Read more...` visible; first title equals `articles[0].title` from the API.

#### 1.2. 11.2 Anonymous: Global Feed is visible and active (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. With empty storageState, open `/`. - expect: Nav shows Sign in and Sign up; no New Article, Settings or profile link. - expect: Banner text `A place to learn and practice test automation.` is visible.
2. Inspect tabs and feed. - expect: Global Feed is active; preview count equals API `articles.length`; each preview has an author link, date, title and like button.

#### 1.3. 11.3 Every preview has the full structure (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Open `/` and wait for the previews, then iterate over `await previews.all()` with a plain `for...of` (no conditionals). - expect: Each card has a named author link to `/profile/...`, a date matching the date regexp, a like button with a numeric count, a non-empty level-1 title, a non-empty description, visible `Read more...`. - expect: Tag list items, when present, have non-empty text (`toHaveText(/\S/)` on the listitem locator for the card).

#### 1.4. 11.4 Clicking a preview title opens the article page (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Open `/`, read the first preview title, click its link. - expect: URL matches `/\/article\//`; the article page has a level-1 heading with the same title.

#### 1.5. 11.5 Popular Tags sidebar matches the tags API (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Open `/` with `waitForResponse` for `GET /tags`. - expect: Status 200; `tags` is an array.
2. Look at the sidebar. - expect: `Popular Tags` is visible; chip count equals `min(tags.length, 10)`; every chip text is in the API `tags` array.

#### 1.6. 11.6 Page-link count matches the API total (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Open `/` and read `articlesCount` from the feed response. - expect: Pagination navigation is visible.
2. Count the pagination buttons. - expect: Count equals `Math.ceil(articlesCount / 10)`; names are `1..N` in order; the `li` of button `1` has class `active`, the others do not.

#### 1.7. 11.7 Page 2 shows the articles of API offset=10 (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Precondition via API fixture: 11 extra articles exist (so the feed has more than 10). Open `/`. - expect: Buttons `1` and `2` are visible.
2. Register `page.waitForRequest(/articles\?limit=10&offset=10/)` and click `getByRole('button', { name: '2', exact: true })`. - expect: The request is sent; button `2` is active and `1` is not; `page` URL is still `/` (confirm on first run).
3. Fetch `GET /articles?limit=10&offset=10` through the `api` fixture. - expect: Page titles equal API titles in order (`toHaveText([...])`); preview count equals API `articles.length`.

#### 1.8. 11.8 Back to page 1 from page 2 (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. With more than 10 articles (API fixture), open `/`, click `2`, then click `1`. - expect: Button `1` is active; titles equal the API `offset=0` titles in order.

#### 1.9. 11.9 Last page shows only the remainder (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. With more than 10 articles, read `articlesCount`, compute `pages = ceil(count / 10)` and `last = count - (pages - 1) * 10`; open `/` and click the button named `String(pages)`. - expect: The last button is active; preview count equals `last` and the API `articles.length` at `offset=(pages-1)*10`.

#### 1.10. 11.10 Reload while on page 2 (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. With more than 10 articles, open `/`, click `2`, then `page.reload()`. - expect: Expected: page 1 is active and shows the offset=0 titles because the page is not stored in the URL. Confirm on first run and record the real behavior.

#### 1.11. 11.11 Single-page feed with mocked API, optional (@regression)

**File:** `tests/ui/feed.spec.ts`

**Steps:**

1. Optional, later stage: `page.route('**/api/articles*', ...)` fulfilled with 3 articles and `articlesCount: 3`; open `/`. - expect: Exactly 3 previews; one pagination button `1` (active); no button `2`.
