import type { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { buildUser } from '../data/user.factory';

export interface AuthedUser {
  username: string;
  email: string;
  token: string;
}

/**
 * Логін постійним акаунтом із .env / GitHub Secrets,
 * або — якщо кредів немає — реєстрація нового користувача.
 */
export async function loginOrRegister(request: APIRequestContext): Promise<AuthedUser> {
  const hasCreds = Boolean(env.userEmail && env.userPassword);
  const response = hasCreds
    ? await request.post(`${env.apiUrl}/users/login`, {
        data: { user: { email: env.userEmail, password: env.userPassword } },
      })
    : await request.post(`${env.apiUrl}/users`, { data: { user: buildUser() } });

  if (!response.ok()) {
    throw new Error(`Auth failed: ${response.status()} ${await response.text()}`);
  }
  const { user } = await response.json();
  return { username: user.username, email: user.email, token: user.token };
}
