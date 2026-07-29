import { test, expect } from '@playwright/test';

test('sharing a URL and reloading restores the exact same scenario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /uniform array/i }).first().click();
  await page.getByRole('button', { name: /run/i }).first().click();
  await page.getByRole('button', { name: /share/i }).click();

  const shareUrl = await page.locator('[data-testid="share-url-output"]').inputValue();
  expect(shareUrl).toMatch(/[?&]s=[A-Za-z0-9+/=]+/);

  await page.goto(shareUrl);
  await expect(page.locator('[data-testid="active-preset-label"]')).toHaveText(/uniform array/i);
});

test('a tampered/malformed share link falls back to default preset with a visible notice', async ({
  page,
}) => {
  await page.goto('/?s=not-valid-base64-json');
  await expect(page.locator('[data-testid="malformed-link-notice"]')).toBeVisible();
  await expect(page.locator('[data-testid="active-preset-label"]')).toHaveText(/classic cp array/i);
});
