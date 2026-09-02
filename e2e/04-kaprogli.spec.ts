import { test, expect } from "@playwright/test";

test.describe("Kaprogli Dashboard & Lab Inventory", () => {
  test.beforeEach(async ({ page }) => {
    // Login as Demo Kaprogli
    await page.goto("/login");
    await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
    await expect(page).toHaveURL(/\/kaprogli/, { timeout: 15000 });
  });

  test("Kaprogli views Skill Delta Score and navigates to Lab Inventory", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dashboard Skill Delta Score");

    // Verify program delta cards
    const rplCard = page.locator("text=Rekayasa Perangkat Lunak").first();
    await expect(rplCard).toBeVisible();

    // Navigate to Lab Inventory
    const labLink = page.locator("a[href='/kaprogli/lab']").first();
    await expect(labLink).toBeVisible();
    await labLink.click();

    await expect(page).toHaveURL(/\/kaprogli\/lab/);
    await expect(page.locator("h1")).toContainText("Manajemen Inventaris Lab");
    await page.screenshot({ path: "test-results/screenshots/10-kaprogli-lab-inventory.png", fullPage: true });
  });
});
