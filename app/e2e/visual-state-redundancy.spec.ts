import { test, expect } from '@playwright/test';

test('overlap states expose both a fill color AND a non-color signal on the SVG node', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: /classic cp array/i }).first().click();
  await page.getByRole('button', { name: /run/i }).first().click();
  await page.getByRole('button', { name: /step forward/i }).click();

  const visitedCircle = page.locator('[data-node-state="partialOverlap"] circle[fill]:not([fill="none"])').first();
  await expect(visitedCircle).toHaveAttribute('fill', '#78350f');
  const strokeDasharray = await visitedCircle.getAttribute('stroke-dasharray');
  const badge = page.locator('[data-node-state="partialOverlap"] [data-testid="state-badge"]');
  expect(strokeDasharray || (await badge.count()) > 0).toBeTruthy();
});
