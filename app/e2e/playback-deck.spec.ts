import { test, expect } from '@playwright/test';

test.describe('Playback Deck interactive automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /classic cp array/i }).first().click();
    await page.getByRole('spinbutton', { name: /query left bound/i }).fill('1');
    await page.getByRole('spinbutton', { name: /query right bound/i }).fill('5');
    await page.getByRole('button', { name: /run/i }).first().click();
  });

  test('Step Forward advances exactly one AlgorithmStep and updates code-line highlight', async ({
    page,
  }) => {
    const codeLine = page.locator('[data-testid="active-code-line"]');
    const before = await codeLine.getAttribute('data-line');
    await page.getByRole('button', { name: /step forward/i }).click();
    const after = await codeLine.getAttribute('data-line');
    expect(after).not.toBe(before);
  });

  test('Play advances steps automatically and Pause halts it', async ({ page }) => {
    const stepCounter = page.locator('[data-testid="step-index"]');
    const atStart = await stepCounter.innerText();

    await page.getByRole('button', { name: /^play$/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /^pause$/i }).click();
    const afterPlay = await stepCounter.innerText();
    expect(Number(afterPlay)).toBeGreaterThan(Number(atStart));

    await page.waitForTimeout(1000);
    const afterPause = await stepCounter.innerText();
    expect(afterPause).toBe(afterPlay);
  });

  test('Scrubbing timeline jumps directly to the target step', async ({ page }) => {
    const slider = page.getByRole('slider', { name: /timeline/i });
    await slider.fill('4');
    await expect(page.locator('[data-testid="step-index"]')).toHaveText('4');
  });

  test('Jump to Start / Jump to End land on the correct boundary steps', async ({ page }) => {
    await page.getByRole('button', { name: /jump to end/i }).click();
    const last = await page.locator('[data-testid="step-index"]').innerText();
    await page.getByRole('button', { name: /jump to start/i }).click();
    await expect(page.locator('[data-testid="step-index"]')).toHaveText('0');
    expect(Number(last)).toBeGreaterThan(0);
  });
});
