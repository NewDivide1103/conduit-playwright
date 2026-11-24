import fs from 'node:fs';
import { test as base } from '@playwright/test';
import { registerUser, type AuthedUser } from '../api/auth.api';
import { USER_FILE } from '../config/env';
import { buildUser, type NewUser } from '../data/user.factory';

/** A user that exists in the backend, with the password needed to log in through the UI. */
export type RegisteredUser = NewUser & AuthedUser;

export interface UserFixtures {
  /** The user the `setup` project logged in as; the browser starts with their storageState. */
  authedUser: AuthedUser;
  /** A brand-new user registered via the API, for tests that log in through the UI. */
  newUser: RegisteredUser;
}

export const test = base.extend<UserFixtures>({
  // Playwright requires a destructured first argument even when no fixtures are used.
  // eslint-disable-next-line no-empty-pattern
  authedUser: async ({}, use) => {
    await use(JSON.parse(fs.readFileSync(USER_FILE, 'utf-8')) as AuthedUser);
  },
  newUser: async ({ request }, use) => {
    const user = buildUser();
    const authed = await registerUser(request, user);
    await use({ ...user, ...authed });
    // No teardown: Conduit has no API to delete users. Unique names keep runs independent.
  },
});
