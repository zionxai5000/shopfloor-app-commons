import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const VIEWS = [
  ['landing', '/'],
  ['catalog', '/#/catalog'],
  ['builder', '/#/builder'],
  ['registry', '/#/registry'],
  ['governance', '/#/governance'],
  ['standards', '/#/standards'],
  ['about', '/#/about'],
  ['kit-gate', '/#/app/app-kit-gate'],
];

async function scan(page, name) {
  console.log(`scanning ${name}`);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violations = result.violations.map((item) => ({
    id: item.id,
    impact: item.impact,
    nodes: item.nodes.length,
    sample: item.nodes.slice(0, 3).map((node) => node.target.join(' ')),
  }));
  return { name, count: result.violations.reduce((sum, item) => sum + item.nodes.length, 0), rules: result.violations.length, violations };
}

test('axe on views and every tour step', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay, ...args) => {
      const hold = window.__holdTimers && typeof delay === 'number' && delay >= 300 && delay <= 5000;
      if (hold) return original(() => {}, 600000);
      return original(fn, delay, ...args);
    };
  });

  const rows = [];

  for (const [name, path] of VIEWS) {
    await page.goto(path);
    await page.locator('h1').first().waitFor();
    rows.push(await scan(page, name));
  }

  await page.goto('/');
  await page.locator('h1').first().waitFor();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  await page.getByTestId('start-tour').click();
  await expect(page.getByRole('dialog')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'End' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByTestId('tour-next')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('start-tour')).toBeFocused();

  await page.getByTestId('start-tour').click();
  await expect(page.getByRole('dialog')).toBeFocused();

  for (let step = 1; step <= 5; step += 1) {
    await expect(page.getByRole('dialog')).toContainText(`${step} of 5`);
    if (step === 2) await page.locator('.snap .pending').first().waitFor();
    rows.push(await scan(page, `tour-step-${step}`));
    if (step === 1) await page.evaluate(() => { window.__holdTimers = true; });
    if (step < 5) await page.getByTestId('tour-next').click();
    else await page.getByRole('button', { name: 'Finish' }).click();
    if (step === 2) await page.evaluate(() => { window.__holdTimers = false; });
  }

  await expect(page.getByTestId('start-tour')).toBeFocused();

  console.log(JSON.stringify(rows, null, 2));
  const failing = rows.filter((row) => row.rules !== 0);
  expect(failing, JSON.stringify(failing, null, 2)).toEqual([]);
});
