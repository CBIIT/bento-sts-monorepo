import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Expected values come from qa/browse-models/seed.py, never from the UI response.
const currentNames = ['A version 3.0.0', 'B version 2.0.0'];
const allNames = [
  'A version 3.0.0', 'A version 2.0.0', 'A version 1.0.0',
  'B version 2.0.0', 'B version 1.0.0',
];
const cards = (page: Page) => page.getByRole('article');
const allVersions = (page: Page) => page.getByRole('checkbox', { name: /^Include all versions/ });
async function expectCards(page: Page, names: string[]) {
  await expect(cards(page)).toHaveCount(names.length);
  await expect.poll(() => cards(page).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))).toEqual(names);
}
async function openModels(page: Page) {
  const control = page.getByRole('button', { name: 'Models', exact: true });
  if (await control.getAttribute('aria-expanded') !== 'true') await control.click();
}

test.beforeEach(async ({ request, page }) => {
  const includesEmptyModel = process.env.QA_EMPTY_MODEL === '1';
  const paginationFixture = process.env.QA_PAGINATION === '1';
  expect(includesEmptyModel && paginationFixture, 'Fixture modes must not be combined').toBe(false);
  const expectedCounts = { models: includesEmptyModel ? 3 : 2, model_versions: paginationFixture ? 53 : includesEmptyModel ? 6 : 5 };
  const expectedNames = paginationFixture ? [...Array.from({ length: 51 }, (_, index) => `A version ${51 - index}.0.0`), 'B version 2.0.0', 'B version 1.0.0'] : includesEmptyModel ? [...allNames, 'C version 1.0.0'] : allNames;
  await expect.poll(async () => {
    const ready = await request.get('/api/v2/models/?include_counts=true');
    if (!ready.ok()) return { status: ready.status() };
    const rows = await ready.json();
    return { models: new Set(rows.map((m: { name: string }) => m.name)).size, model_versions: rows.length };
  }, { message: 'Wait for owned fixture and one-second API cache refresh' }).toEqual(expectedCounts);
  const response = await request.get('/api/v2/models/?include_counts=true');
  expect(response.status(), 'Real local API and dedicated fixture must be ready').toBe(200);
  const data = await response.json();
  expect(data.length).toBe(expectedCounts.model_versions);
  expect(data.map((item: { name: string; version: string }) => `${item.name} version ${item.version}`).sort()).toEqual([...expectedNames].sort());
  for (const item of data) expect(item.counts).toEqual(item.name === 'C' && includesEmptyModel ? { nodes: 0, properties: 0, relationships: 0 } : { nodes: 2, properties: 3, relationships: 1 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
});

test('current models, fixture statistics, all versions, and revert', async ({ page }) => {
  await expectCards(page, currentNames);
  await expect(page.locator('.result-summary')).toHaveText('2 models');
  const card = page.getByRole('article', { name: currentNames[0], exact: true });
  await expect(card.locator('dl dd')).toHaveText(['2', '3', '1']);
  await allVersions(page).check();
  await expectCards(page, allNames);
  await expect(page.locator('.result-summary')).toHaveText('2 models · 5 model versions');
  await allVersions(page).uncheck();
  await expectCards(page, currentNames);
  await expect(page.locator('.result-summary')).toHaveText('2 models');
});

test('model inclusion, select none, and restore', async ({ page }) => {
  await expectCards(page, currentNames);
  await allVersions(page).check();
  await openModels(page);
  await page.getByRole('checkbox', { name: 'B', exact: true }).uncheck();
  await expectCards(page, allNames.slice(0, 3));
  await expect(page.locator('.result-summary')).toHaveText('1 models · 3 model versions');
  await page.getByRole('button', { name: 'Clear model selection' }).click();
  await expect(page.getByRole('heading', { name: 'No models to display' })).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.locator('.result-summary')).toHaveText('0 models · 0 model versions');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Select all models' }).click();
  await expectCards(page, allNames);
});

test('reversible name and version sorting', async ({ page }) => {
  await allVersions(page).check();
  await expectCards(page, allNames);
  await page.getByRole('button', { name: 'Sort descending', exact: true }).click();
  await expectCards(page, ['B version 2.0.0', 'B version 1.0.0', ...allNames.slice(0, 3)]);
  await page.getByRole('combobox', { name: 'Sort models' }).selectOption('version');
  await expectCards(page, ['A version 3.0.0', 'A version 2.0.0', 'B version 2.0.0', 'A version 1.0.0', 'B version 1.0.0']);
  await page.getByRole('button', { name: 'Sort ascending', exact: true }).click();
  await expectCards(page, ['A version 1.0.0', 'B version 1.0.0', 'A version 2.0.0', 'B version 2.0.0', 'A version 3.0.0']);
});

test('detail navigation preserves selected model and version through reload and history', async ({ page }) => {
  await allVersions(page).check();
  await page.getByRole('article', { name: 'A version 1.0.0', exact: true }).getByRole('link', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/#\/model\/A\/1\.0\.0(?:\?|$)/);
  await expect(page.getByRole('heading', { name: 'A', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Nodes in A, version 1.0.0' })).toBeVisible();
  await expect(page.getByRole('rowheader')).toHaveText(['node_0', 'node_1']);
  await page.reload();
  await expect(page.getByRole('table', { name: 'Nodes in A, version 1.0.0' })).toBeVisible();
  await page.getByRole('link', { name: 'Skip to main content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page).toHaveURL(/#\/model\/A\/1\.0\.0(?:\?|$)/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('table', { name: 'Nodes in A, version 1.0.0' })).toBeVisible();
});

test('rapid changes resolve to the final selection with real requests', async ({ page }) => {
  await expectCards(page, currentNames);
  await allVersions(page).check();
  await allVersions(page).uncheck();
  await allVersions(page).check();
  await openModels(page);
  await page.getByRole('checkbox', { name: 'B', exact: true }).uncheck();
  await expectCards(page, allNames.slice(0, 3));
  await expect(page.locator('.result-summary')).toHaveText('1 models · 3 model versions');
});

test('fault injection: HTTP 503 is an error, then retry uses the real API', async ({ page }) => {
  await page.route('**/api/v2/models/?*', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"QA injected failure"}' }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Unable to load data');
  await expect(page.getByRole('heading', { name: 'No models to display' })).toHaveCount(0);
  await expect(page.locator('.result-summary')).not.toContainText('0 models');
  await page.unroute('**/api/v2/models/?*');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expectCards(page, currentNames);
});

test('keyboard controls and automated accessibility', async ({ page }) => {
  await expectCards(page, currentNames);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await allVersions(page).focus();
  await page.keyboard.press('Space');
  await expectCards(page, allNames);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('desktop and mobile visual artifacts with no horizontal overflow', async ({ page }, testInfo) => {
  await expectCards(page, currentNames);
  for (const width of [1440, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width === 1440 || width === 375) {
      const screenshot = testInfo.outputPath(`browse-models-${width}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      await testInfo.attach(`Browse Models ${width}px`, { path: screenshot, contentType: 'image/png' });
    }
  }
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});


test('browse URL restores filters, version mode, sorting, and declared unavailable navigation', async ({ page }) => {
  await expectCards(page, currentNames);
  await allVersions(page).check();
  await openModels(page);
  await page.getByRole('checkbox', { name: 'B', exact: true }).uncheck();
  await page.getByRole('combobox', { name: 'Sort models' }).selectOption('version');
  await expectCards(page, ['A version 1.0.0', 'A version 2.0.0', 'A version 3.0.0']);
  await page.reload();
  await expect(allVersions(page)).toBeChecked();
  await expect(page.getByRole('combobox', { name: 'Sort models' })).toHaveValue('version');
  await expectCards(page, ['A version 1.0.0', 'A version 2.0.0', 'A version 3.0.0']);
  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  for (const name of ['Search Terms', 'Compare Models', 'Global Search']) {
    await expect(navigation.locator('.nav-item').filter({ hasText: name })).toBeVisible();
    await expect(navigation.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
  await expect(navigation).toContainText(/coming soon|not available/i);
});

test('malformed encoded detail URL does not crash the application', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#/model/%E0%A4%A/1.0.0');
  await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
  await expectCards(page, currentNames);
  expect(errors).toEqual([]);
});


if (process.env.QA_EMPTY_MODEL === '1') {
  test('valid empty model detail and unknown model are distinct', async ({ page }) => {
    await page.getByRole('article', { name: 'C version 1.0.0', exact: true }).getByRole('link', { name: 'View Details' }).click();
    await expect(page.getByRole('heading', { name: 'C', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No nodes in this model version', exact: true })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'No nodes in this model version', exact: true })).toBeVisible();
    await page.goto('/#/model/UNKNOWN-QA/1.0.0');
    await expect(page.getByRole('heading', { name: 'Model version not found', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No nodes in this model version', exact: true })).toHaveCount(0);
    await page.goto('/#/model/C/9.9.9');
    await expect(page.getByRole('heading', { name: 'Model version not found', exact: true })).toBeVisible();
  });
}


if (process.env.QA_PAGINATION === '1') {
  test('real pagination preserves totals and resets offset when returning to current versions', async ({ page }) => {
    await expectCards(page, ['A version 51.0.0', 'B version 2.0.0']);
    await allVersions(page).check();
    const firstPage = Array.from({ length: 50 }, (_, index) => `A version ${51 - index}.0.0`);
    await expectCards(page, firstPage);
    await expect(page.locator('.result-summary')).toHaveText('2 models · 53 model versions');
    const pagination = page.getByRole('navigation', { name: 'Model pages' });
    await expect(pagination).toContainText('1–50 of 53');
    await expect(pagination.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await pagination.getByRole('button', { name: 'Next' }).click();
    await expectCards(page, ['A version 1.0.0', 'B version 2.0.0', 'B version 1.0.0']);
    await expect(page.locator('.result-summary')).toHaveText('2 models · 53 model versions');
    await expect(pagination).toContainText('51–53 of 53');
    await expect(pagination.getByRole('button', { name: 'Next' })).toBeDisabled();
    await page.reload();
    await expectCards(page, ['A version 1.0.0', 'B version 2.0.0', 'B version 1.0.0']);
    await page.getByRole('navigation', { name: 'Model pages' }).getByRole('button', { name: 'Previous' }).click();
    await expectCards(page, firstPage);
    await page.getByRole('navigation', { name: 'Model pages' }).getByRole('button', { name: 'Next' }).click();
    await allVersions(page).uncheck();
    await expectCards(page, ['A version 51.0.0', 'B version 2.0.0']);
    await expect(page.locator('.result-summary')).toHaveText('2 models');
    await expect(page.getByRole('navigation', { name: 'Model pages' })).toContainText('1–2 of 2');
  });
}
