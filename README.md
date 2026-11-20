# conduit-playwright

Навчальний проєкт автоматизації на **Playwright + TypeScript** для [Conduit (RealWorld)](https://conduit.bondaracademy.com).

## Старт

```bash
npm ci
npx playwright install
cp .env.example .env   # за потреби
npm test
```

## Команди

| Команда                                 | Що робить                                         |
| --------------------------------------- | ------------------------------------------------- |
| `npm test`                              | усі тести (setup → api → chromium/firefox/webkit) |
| `npm run test:smoke`                    | лише `@smoke`                                     |
| `npm run test:api`                      | лише API тести                                    |
| `npm run test:chromium`                 | UI тести в Chromium                               |
| `npm run test:ui`                       | інтерактивний UI mode                             |
| `npm run codegen`                       | рекордер / підбір локаторів                       |
| `npm run report`                        | відкрити HTML-репорт                              |
| `npm run lint` / `typecheck` / `format` | якість коду                                       |

## Структура

```
src/
  config/env.ts        # BASE_URL, API_URL, креди з .env
  data/                # фабрики тестових даних (faker), дані для параметризації
  pages/ components/   # Page Objects (етап 3)
  api/                 # API-клієнт (етап 5)
  fixtures/            # test.extend фікстури (етап 3+)
tests/
  setup/auth.setup.ts  # логін через API → playwright/.auth/user.json
  api/                 # API тести (без браузера)
  ui/ e2e/             # UI тести, вже залогінені через storageState
specs/                 # Markdown тест-плани
```

## Авторизація

`auth.setup.ts` логіниться через API і кладе JWT у `localStorage.jwtToken` у `storageState`.
Якщо в `.env` (або GitHub Secrets) задано `CONDUIT_EMAIL` / `CONDUIT_PASSWORD` — використовується цей акаунт,
інакше щоразу реєструється новий користувач.

## Правила

- Локатори: `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` → `getByTestId`; CSS/XPath — лише як виняток.
- Тільки web-first assertions (`await expect(locator)...`), без `waitForTimeout`.
- Кожен тест створює власні дані й не залежить від інших.
- Теги: `@smoke`, `@regression`, `@api`.
