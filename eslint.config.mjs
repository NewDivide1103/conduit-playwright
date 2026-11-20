import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/', 'playwright/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-raw-locators': 'warn',
      'playwright/no-conditional-in-test': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
);
