import { expect, test } from '@playwright/test';

const sizes = [
  { name: 'wide', width: 2560, height: 1440 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-short', width: 390, height: 667 },
];

for (const size of sizes) {
  test(`${size.name} card experience`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.route('https://blog.gonets.top/api/profile.json', route => route.abort());
    await page.goto('/');
    await expect(page.locator('[data-panel="cover"]')).toBeVisible();
    await expect(page.locator('[data-card="cover"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('h1')).toContainText('Kaiyasi');
    await expect.poll(() => page.locator('[data-panel="cover"]').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    if (size.width > 760) {
      const ticketSize = await page.locator('.ticket-frame').evaluate(node => ({ width: node.offsetWidth, height: node.offsetHeight }));
      expect(ticketSize.width).toBeLessThanOrEqual(1241);
      expect(ticketSize.width / ticketSize.height).toBeCloseTo(16 / 9, 2);
      if (size.name === 'wide') expect(ticketSize.width).toBeGreaterThanOrEqual(1239);
      if (size.name === 'laptop') expect(ticketSize.width).toBeLessThan(1240);
    }
    await page.screenshot({ path: `test-results/${size.name}-cover.png`, fullPage: true });

    await page.locator('[data-card="work"]').click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.locator('[data-panel="work"]')).toBeVisible();
    await expect(page.locator('[data-card="work"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-card="cover"]')).not.toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-projects] > li')).toHaveCount(3);

    await page.locator('[data-locale]').selectOption('zh-TW');
    await page.locator('[data-card="profile"]').click();
    await expect(page.locator('[data-field="intro"] br')).toHaveCount(1);
    await page.locator('[data-card="work"]').click();

    await page.locator('[data-card="journey"]').click();
    await expect(page.locator('[data-panel="journey"]')).toBeVisible();
    await page.goBack();
    await expect(page.locator('[data-panel="work"]')).toBeVisible();

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      vertical: document.documentElement.scrollHeight - window.innerHeight,
      panel: Math.max(...[...document.querySelectorAll<HTMLElement>('.panel:not([hidden])')].map(node => node.scrollWidth - node.clientWidth)),
      panelVertical: Math.max(...[...document.querySelectorAll<HTMLElement>('.panel:not([hidden])')].map(node => node.scrollHeight - node.clientHeight)),
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.vertical).toBeLessThanOrEqual(1);
    expect(overflow.panel).toBeLessThanOrEqual(1);
    expect(overflow.panelVertical).toBeLessThanOrEqual(4);

    for (const card of ['profile', 'work', 'journey', 'contact']) {
      await page.locator(`[data-card="${card}"]`).click();
      await expect(page.locator(`[data-panel="${card}"]`)).toBeVisible();
      await expect.poll(() => page.locator(`[data-panel="${card}"]`).evaluate(element => getComputedStyle(element).opacity)).toBe('1');
      const panelOverflow = await page.locator(`[data-panel="${card}"]`).evaluate(node => {
        const lastContent = node.querySelector<HTMLElement>('li:last-child');
        const panelRect = node.getBoundingClientRect();
        return {
          x: node.scrollWidth - node.clientWidth,
          y: node.scrollHeight - node.clientHeight,
          contentBottom: lastContent ? lastContent.getBoundingClientRect().bottom - panelRect.bottom : 0,
        };
      });
      expect(panelOverflow.x, `${card} horizontal overflow`).toBeLessThanOrEqual(1);
      expect(panelOverflow.y, `${card} vertical overflow`).toBeLessThanOrEqual(4);
      expect(panelOverflow.contentBottom, `${card} visible content boundary`).toBeLessThanOrEqual(1);
      if (size.name === 'laptop' && (card === 'work' || card === 'journey')) {
        await page.screenshot({ path: `test-results/laptop-${card}.png`, fullPage: true });
      }
    }

    await page.locator('[data-locale]').selectOption('ja');
    await expect(page.locator('[data-ui="work"]').first()).toHaveText('主な作品');
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
    await page.locator('[data-card="work"]').click();
    await expect(page.locator('[data-panel="work"]')).toBeVisible();
    await expect.poll(() => page.locator('[data-panel="work"]').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    await page.screenshot({ path: `test-results/${size.name}-work.png`, fullPage: true });
  });
}
