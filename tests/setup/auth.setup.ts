import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { env, STORAGE_STATE, USER_FILE } from '../../src/config/env';
import { loginOrRegister } from '../../src/api/auth.api';

/**
 * Log in via the API instead of the UI: fast and stable.
 * Conduit keeps the JWT in localStorage under the `jwtToken` key,
 * so we build storageState directly from the API response.
 */
setup('authenticate via API', async ({ request }) => {
  const user = await loginOrRegister(request);
  expect(user.token).toBeTruthy();

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  fs.writeFileSync(
    STORAGE_STATE,
    JSON.stringify({
      cookies: [],
      origins: [{ origin: env.baseUrl, localStorage: [{ name: 'jwtToken', value: user.token }] }],
    }),
  );
  // Tests and API fixtures will need the username/token
  fs.writeFileSync(USER_FILE, JSON.stringify(user));
});
