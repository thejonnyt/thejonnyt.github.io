import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __clipboardValue?: string;
  }
}

const analyticsErrorPatterns = [
  'cloudflareinsights.com/cdn-cgi/rum',
  'static.cloudflareinsights.com/beacon.min.js',
  'Failed to load resource: net::ERR_FAILED'
];

function isIgnorableError(message: string) {
  return analyticsErrorPatterns.some(pattern => message.includes(pattern));
}

async function installClipboardStub(page: any) {
  await page.addInitScript(() => {
    window.__clipboardValue = '';

    const clipboard = {
      writeText: async (text: string) => {
        window.__clipboardValue = text;
      },
      readText: async () => window.__clipboardValue || ''
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: clipboard,
      configurable: true
    });
  });
}

async function readClipboardJson(page: any) {
  const clipboardText = await page.evaluate(() => {
    return window.__clipboardValue || '';
  });
  return JSON.parse(clipboardText);
}

test.describe('CV JSON copy buttons', () => {
  test('header copy button writes JSON on EN', async ({ page }) => {
    await installClipboardStub(page);
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });
    await page.goto('/');

    const copyBtn = page.locator('#header-cv-copy-resume-btn');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    const json = await readClipboardJson(page);
    expect(json.meta?.format).toBe('machine-readable-cv-json');
    expect(json.meta?.language).toBe('en');
    expect(json.profile?.name).toBeTruthy();
    expect(Array.isArray(json.experience)).toBeTruthy();
    expect(json.skills?.totalCount).toBeGreaterThan(0);
    expect(Array.isArray(json.skills?.order)).toBeTruthy();
    expect(json.skills?.order?.length).toBeGreaterThan(0);
  });

  test('header copy button writes JSON on DE', async ({ page }) => {
    await installClipboardStub(page);
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });
    await page.goto('/de');

    const copyBtn = page.locator('#header-cv-copy-resume-btn');
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    const json = await readClipboardJson(page);
    expect(json.meta?.format).toBe('machine-readable-cv-json');
    expect(json.meta?.language).toBe('de');
    expect(json.profile?.name).toBeTruthy();
    expect(Array.isArray(json.experience)).toBeTruthy();
    expect(json.skills?.totalCount).toBeGreaterThan(0);
  });

  test('magnetic carousel copy button writes JSON', async ({ page }) => {
    await installClipboardStub(page);
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });
    await page.goto('/');

    const copyCard = page.locator('[data-magnetic-carousel] [data-card="copy"]').first();
    await copyCard.scrollIntoViewIfNeeded();
    await expect(copyCard).toBeVisible();
    await copyCard.click();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    const json = await readClipboardJson(page);
    expect(json.meta?.format).toBe('machine-readable-cv-json');
    expect(json.profile?.name).toBeTruthy();
  });

  test('footer copy button writes JSON on mobile', async ({ page }) => {
    await installClipboardStub(page);
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/');

    const footerCopyBtn = page.locator('#footer-cv-copy-resume-btn');
    await footerCopyBtn.scrollIntoViewIfNeeded();
    await expect(footerCopyBtn).toBeVisible();
    await footerCopyBtn.click();

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    const json = await readClipboardJson(page);
    expect(json.meta?.format).toBe('machine-readable-cv-json');
    expect(json.profile?.name).toBeTruthy();
  });
});

test.describe('CV PDF download actions', () => {
  test.use({ acceptDownloads: true });

  test('header download button downloads PDF on EN', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });

    await page.goto('/');

    const downloadBtn = page.locator('#header-cv-download-pdf-btn');
    await expect(downloadBtn).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click()
    ]);

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(download.suggestedFilename()).toBe('Johannes_Tauscher_CV.pdf');
  });

  test('magnetic carousel download card downloads PDF', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const message = msg.text();
        if (!isIgnorableError(message)) {
          pageErrors.push(message);
        }
      }
    });

    await page.goto('/');

    const downloadCard = page.locator('[data-magnetic-carousel] [data-card="download"]').first();
    await downloadCard.scrollIntoViewIfNeeded();
    await expect(downloadCard).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadCard.click()
    ]);

    expect(pageErrors, `Page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    expect(download.suggestedFilename()).toBe('Johannes_Tauscher_CV.pdf');
  });
});
