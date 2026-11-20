# conduit-playwright

Playwright + TypeScript test automation for Conduit (RealWorld), a Medium clone with a UI and a REST API. The project is built from scratch following Playwright best practices: role-based locators, parameterized tests, API + UI tests, CI in GitHub Actions, and AI agents.

## Test environment

- UI: `https://conduit.bondaracademy.com`
- API: `https://conduit-api.bondaracademy.com/api`
- Conduit stores the auth token in `localStorage.jwtToken`.
- Fallback if the demo site goes down: run Conduit locally in Docker and change `BASE_URL` / `API_URL` in `.env`.

## Stack and tooling

- `@playwright/test` + TypeScript, browsers: Chromium, Firefox, WebKit.
- `dotenv`, `@faker-js/faker`, ESLint (`typescript-eslint` + `eslint-plugin-playwright`), Prettier, `tsc --noEmit`.
- IDE: VS Code with the Playwright Test for VS Code, ESLint, and Prettier extensions (recommended in `.vscode/extensions.json`, format on save).
- CI: GitHub Actions (`.github/workflows/playwright.yml`) on Node LTS: a `lint` job (ESLint, typecheck, Prettier) → a `test` job with GitHub Secrets and the HTML report uploaded as an artifact.

## Project structure

```
.github/workflows/playwright.yml
.claude/agents/            # custom Claude Code subagents (stage 7)
specs/                     # Markdown test plans
src/
  config/env.ts            # env, STORAGE_STATE, USER_FILE
  api/                     # API clients
  pages/                   # Page Objects
  components/              # NavBar, ArticlePreview, Pagination
  fixtures/                # test.extend: pages, api, authedUser, newArticle
  data/                    # parameterization data, faker factories
  utils/
tests/
  setup/auth.setup.ts      # API login → playwright/.auth/user.json
  api/                     # browserless tests ("api" project)
  ui/                      # UI tests, already logged in
  e2e/                     # data via API, assertions in the UI
playwright.config.ts
```

Projects in the config: `setup` → `api` (baseURL = API) → `chromium` / `firefox` / `webkit` (depend on `setup`, use `storageState`, run `tests/ui` and `tests/e2e`).

Scripts: `npm test`, `test:smoke`, `test:api`, `test:ui`, `test:chromium`, `report`, `codegen`, `lint`, `typecheck`, `format`, `format:check`.

## Conventions

- **Locators:** `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` → `getByTestId`. CSS/XPath only as an exception, with a reason. For lists, use chaining and `filter({ hasText })`.
- **Assertions:** web-first only (`await expect(locator).toBeVisible()`). No `waitForTimeout`, `force: true`, or `if` in tests.
- **Isolation:** each test creates its own unique data (faker) and cleans it up via the API in fixture teardown.
- **Login:** once via the API in `setup` → `storageState`. UI tests do not log in through the form, except tests of the login itself (they disable `storageState`). If `CONDUIT_EMAIL` / `CONDUIT_PASSWORD` are not set, a new user is registered.
- **Test structure:** fixtures instead of `beforeEach`; no assertions inside Page Objects.
- **Parameterization:** `for (const data of cases) test(...)`, with data in `src/data`.
- **Tags:** `@smoke`, `@regression`, `@api` for `--grep`.
- **Secrets:** `.env` locally, GitHub Secrets in CI. `.env` and `playwright/.auth/` are in `.gitignore`.
- **Language:** everything in the repository is in English: code, comments, commit messages, docs, and prompts (agent definitions, test plans in `specs/`).
- **Before committing:** `npm run lint`, `npm run typecheck`, `npm run format:check`, `npx playwright test` must all pass.
- **Roadmap:** when a stage is finished, mark it done in both `README.md` and `CLAUDE.md` in the same commit.

## Test case backlog

**Auth:** 1) sign up (UI, @smoke); 2) log in; 3) negative login — parameterized; 4) negative sign-up — parameterized; 5) log out.
**Articles:** 6) create an article; 7) edit (data via API); 8) delete → API 404; 9) tags — parameterized; 10) editor validation — parameterized.
**Feed:** 11) Global Feed + pagination; 12) filter by tag; 13) Your Feed after following an author.
**Interaction:** 14) like/unlike; 15) comments; 16) follow/unfollow; 17) Settings → profile.
**API:** 18) login + negative cases (parameterized); 19) articles CRUD; 20) comments CRUD, favorite; 21) response schema validation (zod).
**Advanced:** 22) network mocking with `page.route`; 23) visual snapshot with masked dates.

## Roadmap

1. ✅ **Setup:** project, config, API login, smoke tests, ESLint/Prettier, CI, English README.
2. ✅ **First test and locators:** case 2 without POM, practice Pick locator / codegen.
3. **POM and fixtures:** extract pages, rewrite cases 1, 2, 5.
4. **Parameterization:** cases 3, 4, 9, 10, 18.
5. **API layer:** ApiClient, cases 18–21, then UI cases 6–8 and 14–17 with data created via the API.
6. **CI:** secrets → matrix / sharding + merged blob reports → report published to GitHub Pages, nightly run.
7. **Agents:**
   - Playwright Test Agents (`npx playwright init-agents`): planner, generator, healer on cases 11–13; requires a `seed.spec.ts`.
   - Custom Claude Code subagents in `.claude/agents/`: `test-case-designer`, `locator-reviewer`, `pom-generator`, `flaky-investigator`. They follow the rules in this file.
8. **Advanced:** mocking (22), visual (23), tags and nightly runs.
