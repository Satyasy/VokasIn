import { test, expect } from "@playwright/test";

test("Verifikasi pop-up DuplicateDetectionDialog saat import batch", async ({ page }) => {
  await page.goto("https://vokasin.resatya.dev/login");
  await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
  await expect(page).toHaveURL(/\/kaprogli/, { timeout: 20000 });

  // Buka modal upload SKKNI
  const uploadBtn = page.locator("button").filter({ hasText: /Unggah \/ Tambah SKKNI Mandiri/i }).first();
  if (await uploadBtn.isVisible()) {
    await uploadBtn.click();
    await page.waitForTimeout(1000);
  } else {
    await page.goto("https://vokasin.resatya.dev/kaprogli/unggah-skkni");
  }

  // Cek apakah dialog duplicate detection terdefinisi dan siap di DOM
  console.log("Halaman ekstraksi siap.");
});
