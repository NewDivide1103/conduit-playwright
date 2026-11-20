import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { buildUser, type NewUser } from '../data/user.factory';

export interface AuthedUser {
  username: string;
  email: string;
  token: string;
}

async function toAuthedUser(response: APIResponse): Promise<AuthedUser> {
  if (!response.ok()) {
    throw new Error(`Auth failed: ${response.status()} ${await response.text()}`);
  }
  const { user } = await response.json();
  return { username: user.username, email: user.email, token: user.token };
}

/** Register a new user via the API (POST /users). */
export async function registerUser(
  request: APIRequestContext,
  user: NewUser = buildUser(),
): Promise<AuthedUser> {
  return toAuthedUser(await request.post(`${env.apiUrl}/users`, { data: { user } }));
}

/**
 * Log in with the permanent account from .env / GitHub Secrets,
 * or register a new user if no credentials are set.
 */
export async function loginOrRegister(request: APIRequestContext): Promise<AuthedUser> {
  if (!env.userEmail || !env.userPassword) {
    return registerUser(request);
  }
  return toAuthedUser(
    await request.post(`${env.apiUrl}/users/login`, {
      data: { user: { email: env.userEmail, password: env.userPassword } },
    }),
  );
}
