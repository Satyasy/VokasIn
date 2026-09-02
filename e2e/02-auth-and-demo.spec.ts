import { test, expect } from "@playwright/test";

test.describe("Authentication & Demo Roles", () => {
  test("Login page renders floating navbar, manual form, and demo buttons", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Masuk Akun");
    await expect(page.getByRole("button", { name: /Demo Guru/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Demo Kaprogli/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();

    await page.screenshot({ path: "test-results/screenshots/05-login-page.png", fullPage: true });
  });

  test("1-Click Demo Guru logs in and enters Guru area", async ({ page }) => {
    await page.goto("/login");

    const demoGuruBtn = page.getByRole("button", { name: /Demo Guru/i });
    await demoGuruBtn.click();

    // Verify redirection to /guru
    await expect(page).toHaveURL(/\/guru/, { timeout: 15000 });
    await expect(page.locator("nav")).toContainText("Guru Produktif");

    await page.screenshot({ path: "test-results/screenshots/06-guru-dashboard.png", fullPage: true });

    // Verify Logout
    const logoutBtn = page.getByRole("button", { name: /Keluar/i }).first();
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("1-Click Demo Kaprogli logs in and enters Kaprogli dashboard", async ({ page }) => {
    await page.goto("/login");

    const demoKaprogliBtn = page.getByRole("button", { name: /Demo Kaprogli/i });
    await demoKaprogliBtn.click();

    // Verify redirection to /kaprogli
    await expect(page).toHaveURL(/\/kaprogli/, { timeout: 15000 });
    await expect(page.locator("nav")).toContainText("Kaprogli");
    await expect(page.locator("h1")).toContainText("Dashboard Skill Delta Score");

    await page.screenshot({ path: "test-results/screenshots/07-kaprogli-dashboard.png", fullPage: true });
  });
});
