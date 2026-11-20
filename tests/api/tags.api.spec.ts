import { test, expect } from '@playwright/test';

test.describe('Tags API', { tag: ['@api', '@smoke'] }, () => {
  test('GET /tags returns a list of strings', async ({ request }) => {
    const response = await request.get('tags');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.tags)).toBe(true);
    for (const tag of body.tags) {
      expect(typeof tag).toBe('string');
    }
  });
});
