import { test, expect } from "@playwright/test";

test("Live verification of SKKNI Sync modal on production", async ({ page }) => {
  // 1. Buka halaman login produksi
  await page.goto("https://vokasin.resatya.dev/login");
  await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
  await expect(page).toHaveURL(/\/kaprogli/, { timeout: 20000 });

  // 2. Klik tab "Kurikulum & Mapel"
  const mapelTabBtn = page.getByRole("tab", { name: /Kurikulum & Mapel/i });
  await expect(mapelTabBtn).toBeVisible();
  await mapelTabBtn.click();

  // 3. Cari kartu "AI Dasar" (tag article) dan klik "Sinkronkan SKKNI"
  const aiArticle = page.locator("article").filter({ hasText: /AI Dasar/i }).first();
  const syncBtn = aiArticle.getByRole("button", { name: /Sinkronkan SKKNI/i });
  await syncBtn.click();

  // 4. Verifikasi header modal muncul
  await expect(page.locator("h4").filter({ hasText: /Sinkronisasi SKKNI/i })).toBeVisible();

  // 5. Tunggu sejenak agar proses saran RRF / query expansion selesai di-fetch
  await page.waitForTimeout(2500);

  // 6. Cek keberadaan Section 1 (TOP RRF) atau Section 2 (Katalog SKKNI TI Lainnya)
  const sec2 = page.locator("text=Katalog SKKNI TI Lainnya");
  await expect(sec2).toBeVisible({ timeout: 10000 });

  // 7. Cek apakah ada alert Konteks Pencarian Diperluas
  const expansionAlert = page.locator("text=Konteks Pencarian Diperluas (AI & Tesaurus Vokasi)");
  const hasAlert = await expansionAlert.isVisible().catch(() => false);
  console.log("Alert Konteks Pencarian Diperluas visible:", hasAlert);

  if (hasAlert) {
    // Klik untuk membuka detail ekspansi kata kunci
    await expansionAlert.click();
    await page.waitForTimeout(500);
  }

  // 8. Ambil screenshot bukti visual
  await page.screenshot({ path: "test-results/screenshots/live-skkni-modal-prod.png", fullPage: false });
  console.log("Screenshot tersimpan di test-results/screenshots/live-skkni-modal-prod.png");

  // 9. Coba ketik "Jaringan" di kotak pencarian untuk mengetes live tesaurus
  const searchInput = page.getByPlaceholder("Cari kode unit atau kata kunci kompetensi...");
  await searchInput.fill("Jaringan");
  await page.waitForTimeout(2500);
  await page.screenshot({ path: "test-results/screenshots/live-skkni-modal-search-jaringan.png", fullPage: false });
  console.log("Screenshot search jaringan tersimpan!");
});
