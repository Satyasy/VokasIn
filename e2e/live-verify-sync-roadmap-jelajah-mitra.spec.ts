import { test, expect } from "@playwright/test";

test("Live verification of SKKNI synchronization across Roadmap, Jelajah, and Mitra Industri", async ({ page }) => {
  test.setTimeout(90000);
  const baseUrl = "https://vokasin.resatya.dev";

  console.log("1. Verifying Roadmap directory page...");
  await page.goto(`${baseUrl}/roadmap`);
  await expect(page.locator("h1")).toContainText("Roadmap Kompetensi Kejuruan");
  await expect(page.locator("text=Unit SKKNI Resmi").first()).toBeVisible();

  // Check that at least one program card has partner link and unit count
  await expect(page.locator("text=Teknik Komputer dan Jaringan").first()).toBeVisible();
  await expect(page.locator("text=Mitra Industri Terkait").first()).toBeVisible();

  console.log("2. Navigating to TKJ Roadmap Jalur...");
  await page.goto(`${baseUrl}/roadmap/pk-tkj`);
  await expect(page.locator("h1")).toContainText("Teknik Komputer dan Jaringan");
  await expect(page.locator("input[placeholder*='Cari kode unit']")).toBeVisible();

  // Verify search bar filtering
  const searchInput = page.locator("input[placeholder*='Cari kode unit']");
  await searchInput.fill("Instal, Konfigurasi");
  await expect(page.locator("text=Instal, Konfigurasi dan Uji Server").first()).toBeVisible();

  // Verify partner badge on unit card
  await expect(page.locator("text=Dibutuhkan Mitra Industri:").first()).toBeVisible();

  console.log("3. Verifying Mitra Industri page interactive buttons...");
  await page.goto(`${baseUrl}/kunjungan-industri`);
  await expect(page.locator("h1")).toContainText("Mitra Industri & Pembelajaran");
  await expect(page.locator("text=Lihat Alur di Roadmap").first()).toBeVisible();
  await expect(page.locator("text=Cocokkan Portofolio").first()).toBeVisible();

  // Click 'Lihat Alur di Roadmap' on the first partner's unit
  const roadmapBtn = page.locator("text=Lihat Alur di Roadmap").first();
  await roadmapBtn.click();
  await expect(page).toHaveURL(/\/roadmap\/pk-tkj\?highlight=/);

  console.log("4. Verifying Jelajah Kompetensi with pre-filled prompt...");
  await page.goto(`${baseUrl}/jelajah-kompetensi?prompt=Instal%2C%20Konfigurasi%20dan%20Uji%20Server`);
  await expect(page.locator("textarea")).toHaveValue("Instal, Konfigurasi dan Uji Server");

  // Wait for search result
  await expect(page.locator("text=Detail Unit").first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator("text=Mitra Industri:").first()).toBeVisible();

  // Open modal detail
  await page.locator("text=Detail Unit").first().click();
  await expect(page.locator("text=Dokumen SKKNI")).toBeVisible();
  await expect(page.locator("text=Buka di Roadmap")).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: "test-results/screenshots/sync-roadmap-jelajah-mitra.png", fullPage: true });
  console.log("All verifications for Roadmap, Jelajah, and Mitra Industri passed!");
});
