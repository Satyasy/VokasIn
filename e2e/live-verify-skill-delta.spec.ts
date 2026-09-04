import { test, expect } from "@playwright/test";

test("Live verification of Skill Delta 0-100% and dynamic urgency weights on production", async ({ page }) => {
  test.setTimeout(60000);
  const baseUrl = "https://vokasin.resatya.dev";

  console.log("Navigating to login page...");
  await page.goto(`${baseUrl}/login`);
  await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
  await expect(page).toHaveURL(new RegExp(`${baseUrl}/kaprogli`), { timeout: 15000 });

  console.log("Successfully logged in to Kaprogli dashboard.");

  // Switch to Skill Delta tab
  const deltaTab = page.locator("button, [role='tab']").filter({ hasText: /Skill Delta/i }).first();
  await expect(deltaTab).toBeVisible({ timeout: 5000 });
  await deltaTab.click();

  // Verify Explanation Banner
  await expect(page.locator("text=Dasar Perhitungan Skor Delta & Indeks Keselarasan Industri")).toBeVisible();
  await expect(page.locator("text=70% Defisit Cakupan SKKNI")).toBeVisible();
  await expect(page.locator("text=30% Kebutuhan Industri Aktual")).toBeVisible();

  // Verify alignment index and percentage display
  const rplTitle = page.locator("text=Rekayasa Perangkat Lunak").first();
  await expect(rplTitle).toBeVisible();

  // Look for Indeks Keselarasan Industri and Gap percentage
  await expect(page.locator("text=Indeks Keselarasan Industri").first()).toBeVisible();
  await expect(page.locator("text=Tingkat Kesenjangan (Skill Delta):").first()).toBeVisible();

  // Verify Urgency Badges in gap candidate section
  await expect(page.locator("text=Kandidat Kesenjangan Kompetensi Industri")).toBeVisible();
  const kritisBadge = page.locator("text=🔴 Kritis (+10%)").first();
  await expect(kritisBadge).toBeVisible();

  // Verify Action Buttons
  const sintesisBtn = page.locator("text=Sintesis ke Modul Praktikum").first();
  await expect(sintesisBtn).toBeVisible();

  // Take full page screenshot for artifact review
  await page.screenshot({ path: "test-results/screenshots/skill-delta-percentage-prod.png", fullPage: true });
  console.log("Skill Delta percentage and dynamic weights verified successfully on production!");
});
