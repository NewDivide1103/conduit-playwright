# conduit-playwright

[![Playwright Tests](https://github.com/NewDivide1103/conduit-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/NewDivide1103/conduit-playwright/actions/workflows/playwright.yml)

End-to-end and API test automation for [Conduit](https://conduit.bondaracademy.com), a Medium clone built on the
[RealWorld](https://github.com/gothinkster/realworld) spec, written with **Playwright** and **TypeScript**.

The project is a hands-on playground for test automation best practices: resilient locators, Page Objects and
fixtures, data-driven (parameterized) tests, API-backed test setup, CI on GitHub Actions, and AI test agents.

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running tests](#running-tests)
- [Project structure](#project-structure)
- [How authentication works](#how-authentication-works)
- [Test conventions](#test-conventions)
- [Continuous integration](#continuous-integration)
- [Roadmap](#roadmap)

## Tech stack

| Area         | Tool                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| Test runner  | [`@playwright/test`](https://playwright.dev) (Chromium, Firefox, WebKit)      |
| Language     | TypeScript (strict mode)                                                      |
| Test data    | [`@faker-js/faker`](https://fakerjs.dev)                                      |
| Config       | [`dotenv`](https://github.com/motdotla/dotenv)                                |
| Code quality | ESLint + `typescript-eslint` + `eslint-plugin-playwright`, Prettier, `tsc`    |
| CI           | GitHub Actions                                                                |
| Application  | Conduit UI: `conduit.bondaracademy.com`, API: `conduit-api.bondaracademy.com` |

## Getting started

**Prerequisites:** Node.js 20+ (LTS recommended) and npm.

```bash
git clone https://github.com/NewDivide1103/conduit-playwright.git
cd conduit-playwright
npm ci
npx playwright install
cp .env.example .env   # optional, see Configuration
npm test
```

**Recommended VS Code extensions** (suggested automatically from `.vscode/extensions.json`):
[Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright),
ESLint and Prettier. The Playwright extension lets you run and debug tests from the editor, pick locators and
record new tests.

## Configuration

All settings are read from environment variables (a local `.env` file or CI secrets). Every variable is optional.

| Variable           | Default                                     | Purpose                              |
| ------------------ | ------------------------------------------- | ------------------------------------ |
| `BASE_URL`         | `https://conduit.bondaracademy.com`         | Web app under test                   |
| `API_URL`          | `https://conduit-api.bondaracademy.com/api` | REST API under test                  |
| `CONDUIT_EMAIL`    | _(empty)_                                   | Email of a permanent test account    |
| `CONDUIT_PASSWORD` | _(empty)_                                   | Password of a permanent test account |

If no account is configured, a fresh user is registered through the API on every run. `.env` is git-ignored, so
never commit real credentials.

## Running tests

| Command                 | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `npm test`              | Run everything: `setup` → `api` → `chromium`/`firefox`/`webkit` |
| `npm run test:smoke`    | Only tests tagged `@smoke`                                      |
| `npm run test:api`      | Only API tests (no browser)                                     |
| `npm run test:chromium` | UI tests in Chromium only                                       |
| `npm run test:ui`       | Interactive UI mode (watch, time-travel debugging)              |
| `npm run codegen`       | Record actions and pick locators against Conduit                |
| `npm run report`        | Open the last HTML report                                       |
| `npm run lint`          | ESLint                                                          |
| `npm run typecheck`     | TypeScript type check                                           |
| `npm run format`        | Format the codebase with Prettier                               |

Useful Playwright CLI flags: `--headed`, `--debug`, `--grep "<title or tag>"`, `--repeat-each 5` (flakiness check),
`npx playwright show-trace <trace.zip>`.

## Project structure

```
.
├── .github/workflows/      # GitHub Actions pipeline
├── specs/                  # Markdown test plans (manual cases, agent output)
├── src/
│   ├── api/                # API helpers (auth, articles, ...)
│   ├── components/         # Reusable UI component objects (nav bar, article preview, ...)
│   ├── config/env.ts       # Environment variables and shared paths
│   ├── data/               # Test data factories and data sets for parameterized tests
│   ├── fixtures/           # Custom Playwright fixtures (test.extend)
│   ├── pages/              # Page Objects
│   └── utils/              # Generic helpers
├── tests/
│   ├── setup/              # Global setup projects (authentication)
│   ├── api/                # API tests, run in the `api` project
│   ├── ui/                 # UI tests, run already logged in
│   └── e2e/                # Cross-layer flows: data via API, checks in UI
└── playwright.config.ts
```

Which project runs which files is decided by `testMatch` in [`playwright.config.ts`](playwright.config.ts):

| Project                           | Files                         | Browser | Logged in |
| --------------------------------- | ----------------------------- | ------- | --------- |
| `setup`                           | `tests/**/*.setup.ts`         | No      | -         |
| `api`                             | `tests/api/**/*.spec.ts`      | No      | -         |
| `chromium` / `firefox` / `webkit` | `tests/{ui,e2e}/**/*.spec.ts` | Yes     | Yes       |

## How authentication works

Logging in through the UI before every test is slow and flaky, so the project logs in **once, through the API**:

1. The `setup` project runs [`tests/setup/auth.setup.ts`](tests/setup/auth.setup.ts).
2. It calls [`loginOrRegister()`](src/api/auth.api.ts), which logs in with `CONDUIT_EMAIL` / `CONDUIT_PASSWORD`, or
   registers a new user if they are not set.
3. Conduit keeps its JWT in `localStorage.jwtToken`, so the token is written straight into a Playwright
   `storageState` file: `playwright/.auth/user.json`. User details go to `playwright/.auth/user.meta.json`.
4. Browser projects depend on `setup` and load that `storageState`, so every UI test starts already signed in.

Tests that check the login form itself should opt out with `test.use({ storageState: { cookies: [], origins: [] } })`.

## Test conventions

- **Locators**, in order of preference: `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` →
  `getByTestId`. CSS and XPath only as a last resort. Narrow lists with `filter({ hasText })` and chaining.
- **Assertions**: web-first only (`await expect(locator).toBeVisible()`). No `waitForTimeout`, no `force: true`.
- **Isolation**: each test creates its own data (unique values from the factories in `src/data`) and does not
  depend on other tests or on execution order.
- **Setup through the API**: create preconditions (users, articles, comments) via the API and keep the UI for the
  behaviour actually under test.
- **No conditionals in tests**: branching logic belongs in helpers, fixtures or Page Objects.
- **Tags**: `@smoke` (fast, critical path), `@regression`, `@api`. Run with `--grep @tag`.

Most of these rules are enforced by ESLint (`eslint-plugin-playwright`) locally and in CI.

## Continuous integration

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull request to `main`,
and manually via **Run workflow**:

1. **lint**: ESLint, `tsc --noEmit`, Prettier check.
2. **test**: installs browsers and runs the full suite. Retries are enabled only on CI and traces are captured on the
   first retry.

The HTML report (with traces, screenshots and videos of failures) is uploaded as the `playwright-report` artifact.
To use a permanent test account in CI, add `CONDUIT_EMAIL` and `CONDUIT_PASSWORD` under
**Settings → Secrets and variables → Actions**.

## Roadmap

- [x] Project setup, API authentication, smoke tests, linting, CI
- [x] Login tests and locator practice
- [ ] Page Objects and custom fixtures
- [ ] Parameterized tests (negative login and registration, editor validation, tags)
- [ ] API client and API test suite (articles, comments, profiles, schema validation)
- [ ] CI: browser matrix, sharding, merged reports, GitHub Pages
- [ ] Playwright Test Agents (planner, generator, healer) and custom Claude Code subagents
- [ ] Network mocking and visual regression tests
