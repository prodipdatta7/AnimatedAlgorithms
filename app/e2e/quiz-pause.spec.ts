import { test, expect } from '@playwright/test';

test('prediction pause halts playback until the user answers', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: /prediction pauses/i }).check();
  await page.getByRole('button', { name: /classic cp array/i }).first().click();
  await page.getByRole('button', { name: /run/i }).first().click();
  await page.getByRole('button', { name: /^play$/i }).click();

  const quizModal = page.locator('[data-testid="quiz-pause-modal"]');
  await expect(quizModal).toBeVisible({ timeout: 10_000 });

  const stepBefore = await page.locator('[data-testid="step-index"]').innerText();
  await page.waitForTimeout(2000);
  await expect(page.locator('[data-testid="step-index"]')).toHaveText(stepBefore);

  await quizModal.getByRole('button', { name: /full overlap/i }).click();
  await expect(quizModal).toBeHidden();
});
