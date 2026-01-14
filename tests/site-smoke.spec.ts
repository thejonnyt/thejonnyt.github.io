import { test, expect, type Page } from '@playwright/test';

const analyticsErrorPatterns = [
  'cloudflareinsights.com/cdn-cgi/rum',
  'static.cloudflareinsights.com/beacon.min.js',
  'Failed to load resource: net::ERR_FAILED'
];

function isIgnorableError(message: string) {
  return analyticsErrorPatterns.some(pattern => message.includes(pattern));
}

function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => {
    if (!isIgnorableError(error.message)) {
      errors.push(error.message);
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const message = msg.text();
      if (!isIgnorableError(message)) {
        errors.push(message);
      }
    }
  });
  return errors;
}

test.describe('site smoke', () => {
  test('home page renders core sections', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    await expect(page.locator('section#about')).toBeVisible();
    await expect(page.locator('section#experience')).toBeVisible();
    await expect(page.locator('section#projects')).toBeVisible();
    await expect(page.locator('section#education')).toBeVisible();
    await expect(page.locator('section#contact')).toBeVisible();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('header navigation and language switcher work', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    const mainNavLinks = page.locator('nav[aria-label="Main navigation"] a[data-section]');
    await expect(mainNavLinks).toHaveCount(5);

    const deSwitcher = page.locator('.lang-switcher a[lang="de"]');
    await expect(deSwitcher).toBeVisible();
    await deSwitcher.click();
    await expect(page).toHaveURL(/\/de\/?$/);

    const deNavLinks = page.locator('nav[aria-label="Hauptnavigation"] a[data-section]');
    await expect(deNavLinks).toHaveCount(5);

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('bio toggle expands and collapses', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    const toggle = page.locator('.bio-toggle');
    const bioFull = page.locator('.bio-full');

    await expect(toggle).toBeVisible();
    await expect(bioFull).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(bioFull).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(bioFull).toBeHidden();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('experience toggle reveals hidden entries', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    const toggle = page.locator('#experience-toggle');
    await expect(toggle).toBeVisible();

    const hiddenCount = await page.locator('.timeline-item[data-hidden="true"]').count();
    expect(hiddenCount).toBeGreaterThan(0);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.timeline-item[data-hidden="true"]')).toHaveCount(0);

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('audio summary reveal works', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    const trigger = page.locator('.audio-summary-trigger');
    const player = page.locator('#audio-summary-player');

    await expect(trigger).toBeVisible();
    await expect(player).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(player).toBeVisible();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('footer social links are present', async ({ page }) => {
    const pageErrors = trackPageErrors(page);
    await page.goto('/');

    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toBeVisible();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });
});
