import { test, expect } from "@playwright/test";

test.describe("Mobile Responsive & Layout Testing", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Mobile viewport renders hamburger menu and toggles dropdown drawer", async ({ page }) => {
    await page.goto("/");

    // Verify Brand is visible
    await expect(page.locator("nav").first()).toContainText("VokasIn");

    // Hamburger button should be visible
    const hamburgerBtn = page.getByRole("button", { name: /menu navigasi/i }).first();
    await expect(hamburgerBtn).toBeVisible();

    // Open mobile menu
    await hamburgerBtn.click();

    // Verify Dropdown Card items (using exact match)
    await expect(page.getByRole("link", { name: "Cara Kerja", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Regulasi", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Roadmap Kompetensi", exact: true })).toBeVisible();

    // Close mobile menu
    await hamburgerBtn.click();
    await expect(page.getByRole("link", { name: "Cara Kerja", exact: true })).not.toBeVisible();
  });

  test("No horizontal scroll overflow on landing page in mobile viewport", async ({ page }) => {
    await page.goto("/");

    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    });

    expect(hasHorizontalScrollbar).toBe(false);
  });
});
