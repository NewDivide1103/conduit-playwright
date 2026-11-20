import type { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { buildUser } from '../data/user.factory';

export interface AuthedUser {
  username: string;
  email: string;
  token: string;
}

/**
 * Log in with the permanent account from .env / GitHub Secrets,
 * or register a new user if no credentials are set.
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
