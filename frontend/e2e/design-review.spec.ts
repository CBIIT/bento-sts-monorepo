import { test, expect } from '@playwright/test';
import path from 'node:path';

const reference = path.resolve('../.sdlc/design/2026-11-12/components/model-browser-dark-mode.svg');

// Capture review evidence for the approved landing-page scope. A successful test
// means the capture/layout probes ran; it is NOT a Figma-conformance verdict.
// Graphs, export, and other screens in the design file are not requirements here.
test('design review evidence for Browse Models and scoped detail navigation', async ({ page }, testInfo) => {
  await testInfo.attach('Figma reference — Browse Models', { path: reference, contentType: 'image/svg+xml' });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
  await expect(page.getByRole('article').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1700, 768, 375]) {
    await page.setViewportSize({ width, height: 1015 });
    await expect(page.getByRole('checkbox', { name: 'Include all versions' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const screenshot = testInfo.outputPath(`browse-models-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach(`Browse Models ${width}px`, { path: screenshot, contentType: 'image/png' });
  }
  await page.setViewportSize({ width: 1700, height: 1015 });
  await page.getByRole('article').first().getByRole('link', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/#\/model\//);
  await expect(page.getByRole('heading', { name: 'Model nodes', exact: true })).toBeVisible();
  await expect(page.getByRole('table').or(page.getByRole('heading', { name: 'No nodes in this model version', exact: true }))).toBeVisible();
  await testInfo.attach('Scoped detail destination', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await testInfo.attach('Review scope and pending verdict', { body: Buffer.from(JSON.stringify({
    source: '.sdlc/design/2026-11-12/components/model-browser-dark-mode.svg',
    compare: ['landing-page sidebar and header', 'card layout', 'colors and typography', 'spacing and control styling', 'responsive usability'],
    approvedDifferences: ['real model data and approved name/date fallbacks', 'search/comparison entries show Coming soon'],
    detailScope: 'Selected model/version navigation and existing destination; full entity-detail design is not required by this ticket.',
    excluded: ['relationship graph', 'graph navigation', 'PDF export', 'additional detail tabs'],
    visualVerdict: 'REVIEW REQUIRED — screenshot capture is not visual approval',
  }, null, 2)), contentType: 'application/json' });
});

test('model detail uses the scoped design and real selected-version data', async ({ page, request }, testInfo) => {
  const model = process.env.QA_DETAIL_MODEL ?? 'A';
  const version = process.env.QA_DETAIL_VERSION ?? '3.0.0';
  const response = await request.get('/api/v2/models/?include_counts=true');
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  const card = catalog.find((item: { name: string; version: string }) => item.name === model && item.version === version);
  expect(card, 'Selected version must exist in the test catalog').toBeTruthy();
  await testInfo.attach('Shared model detail design reference', { path: path.resolve('../.sdlc/design/2026-11-12/components/1-entity-view-model-relationships.svg'), contentType: 'image/svg+xml' });
  await page.goto(`/#/model/${encodeURIComponent(model)}/${encodeURIComponent(version)}`);
  const header = page.getByRole('main').locator('header');
  await expect(header.getByText('Entity View:', { exact: false })).toBeVisible();
  await expect(header.getByRole('heading', { level: 1 })).toContainText(card.name);
  await expect(header.getByText(`v${version}`, { exact: true })).toBeVisible();
  for (const [key, label] of [['nodes', 'Nodes'], ['properties', 'Properties'], ['relationships', 'Relationships']]) {
    const statistic = header.locator('dl > div').filter({ has: page.getByText(label, { exact: true }) });
    await expect(statistic.locator('dd')).toHaveText(String(card.counts[key]));
  }
  await expect(page.getByRole('table', { name: `Nodes in ${model}, version ${version}` })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1702, 768, 375]) {
    await page.setViewportSize({ width, height: 1196 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(header).toHaveCSS('background-color', 'rgb(37, 45, 53)');
    if (width === 1702) {
      await expect(header.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '30px');
      const box = await header.boundingBox();
      expect(box?.x).toBe(248);
      expect(box?.height).toBeGreaterThanOrEqual(199);
    }
    const screenshot = testInfo.outputPath(`model-detail-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach(`Scoped detail ${width}px`, { path: screenshot, contentType: 'image/png' });
  }
  await page.reload();
  await expect(header.getByText(`v${version}`, { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Model detail navigation' }).getByRole('link', { name: 'Browse Models' }).click();
  await expect(page.getByRole('heading', { name: 'Browse Models', exact: true })).toBeVisible();
});
