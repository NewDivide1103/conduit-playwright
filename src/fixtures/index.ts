import { expect, mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages.fixture';
import { test as usersTest } from './users.fixture';

/** Import `test` and `expect` from here in every test file instead of `@playwright/test`. */
export const test = mergeTests(pagesTest, usersTest);
export { expect };

export type { RegisteredUser } from './users.fixture';

/** For tests that must start logged out: `test.use({ storageState: LOGGED_OUT })`. */
export const LOGGED_OUT = { cookies: [], origins: [] };
