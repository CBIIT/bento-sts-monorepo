import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v2/models/**", async (route) => {
    await route.fulfill({
      json: [
        {
          type: "Model",
          handle: "GDC",
          name: "Genomic Data Commons",
          version: "1.0",
          nanoid: "model-1",
          repository: null,
          is_latest_version: true,
        },
      ],
    });
  });
});

test("shows models from the STS API", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Explore terminology across connected data models",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Genomic Data Commons/ }),
  ).toBeVisible();
});

test("has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Data model")).toBeEnabled();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
