import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@playwright/test';
import { env, STORAGE_STATE, USER_FILE } from '../../src/config/env';
import { loginOrRegister } from '../../src/api/auth.api';

/**
 * Логін через API замість UI: швидко і стабільно.
 * Conduit тримає JWT у localStorage під ключем `jwtToken`,
 * тож storageState збираємо напряму з відповіді API.
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
  // username/token знадобляться тестам і API-фікстурам
  fs.writeFileSync(USER_FILE, JSON.stringify(user));
});
