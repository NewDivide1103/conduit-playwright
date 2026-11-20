import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://conduit.bondaracademy.com',
  apiUrl: process.env.API_URL ?? 'https://conduit-api.bondaracademy.com/api',
  /** If not set, auth.setup registers a new user via the API. */
  userEmail: process.env.CONDUIT_EMAIL,
  userPassword: process.env.CONDUIT_PASSWORD,
};

export const STORAGE_STATE = path.resolve(__dirname, '../../playwright/.auth/user.json');
export const USER_FILE = path.resolve(__dirname, '../../playwright/.auth/user.meta.json');
