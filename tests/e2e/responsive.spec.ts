import { test, expect } from '@playwright/test';

/**
 * Responsive / E2E smoke tests across real viewports (mobile / tablet / desktop
 * — see playwright.config.ts projects). Run with `npm run test:e2e`.
 *
 * These require a running app + browsers; they're not part of the Vitest suite.
 */
test.describe('homepage', () => {
  test('loads and shows the primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: /request a quote/i }).first(),
    ).toBeVisible();
  });
});

test.describe('mobile shell (mobile project only)', () => {
  test('bottom navigation is visible on mobile, hidden on desktop', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const bottomNav = page.getByRole('navigation', { name: /primary mobile/i });
    if (testInfo.project.name === 'mobile') {
      await expect(bottomNav).toBeVisible();
    } else {
      await expect(bottomNav).toBeHidden();
    }
  });
});

test.describe('order tracking', () => {
  test('search page renders the lookup form', async ({ page }) => {
    await page.goto('/track');
    await expect(page.getByLabel(/order id/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /track order/i })).toBeVisible();
  });
});

test.describe('product discovery', () => {
  test('products listing renders', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  });
});
