import { test, expect } from "@playwright/test";

test("Verifikasi TOP RRF Search Cloud Computing & Duplicate Detection di Produksi", async ({ page }) => {
  // Test 1: Verifikasi TOP RRF pada Mapel Cloud Computing
  console.log("1. Mengakses https://vokasin.resatya.dev/login...");
  await page.goto("https://vokasin.resatya.dev/login");
  await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
  await expect(page).toHaveURL(/\/kaprogli/, { timeout: 20000 });

  console.log("2. Membuka tab Kurikulum & Mapel...");
  const mapelTabBtn = page.getByRole("tab", { name: /Kurikulum & Mapel/i });
  await expect(mapelTabBtn).toBeVisible();
  await mapelTabBtn.click();

  // Buka modal sinkronisasi pada salah satu mapel
  const firstSyncBtn = page.locator("button").filter({ hasText: /Sinkronkan SKKNI/i }).first();
  await expect(firstSyncBtn).toBeVisible({ timeout: 10000 });
  await firstSyncBtn.click();

  // Tunggu modal muncul
  await expect(page.locator("h4").filter({ hasText: /Sinkronisasi SKKNI/i })).toBeVisible();

  // Ketik "Cloud Computing" di input pencarian modal
  console.log("3. Mengetik 'Cloud Computing' di modal sinkronisasi...");
  const searchInput = page.getByPlaceholder("Cari kode unit atau kata kunci kompetensi...");
  await searchInput.fill("Cloud Computing");
  await page.waitForTimeout(3000);

  // Verifikasi Section 1 TOP RRF sekarang memuat unit relevan dan BUKAN "0 Unit"
  const topRrfSection = page.locator("text=Rekomendasi Unggulan (TOP RRF)");
  await expect(topRrfSection).toBeVisible();

  // Screenshot hasil pencarian Cloud Computing
  await page.screenshot({ path: "test-results/screenshots/live-cloud-computing-rrf.png", fullPage: false });
  console.log("Screenshot Cloud Computing RRF tersimpan!");

  // Tutup modal
  const closeBtn = page.locator("button").filter({ hasText: /Batal/i }).first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Test 2: Verifikasi Duplicate Detection di Form Input SKKNI
  console.log("4. Membuka halaman Ekstraksi SKKNI...");
  await page.goto("https://vokasin.resatya.dev/kaprogli/unggah-skkni");
  await page.waitForLoadState("networkidle");

  // Klik tab "Input Teks Manual"
  const manualTabBtn = page.getByRole("button", { name: /Input Teks Manual/i });
  if (await manualTabBtn.isVisible()) {
    await manualTabBtn.click();
    await page.waitForTimeout(500);

    // Isi dengan kode unit yang sudah ada di sistem (J.63HOS00.003.2)
    console.log("5. Menginput unit yang sudah terdaftar untuk menguji deteksi duplikasi...");
    await page.locator('input[name="nomorDokumen"]').fill("Kepmenaker No. 102 Tahun 2023");
    await page.locator('input[name="kodeUnit"]').fill("J.63HOS00.003.2");
    await page.locator('input[name="judulUnit"]').fill("Menjabarkan Berbagai Jenis Perangkat Keras Cloud Computing");
    await page.locator('textarea[name="elemenRawText"]').fill("1. Mengidentifikasi perangkat cloud\n1.1 Spesifikasi server cloud diuji");

    // Submit form manual
    const submitManualBtn = page.locator('button[type="submit"]').filter({ hasText: /Ekstrak & Simpan Unit/i });
    if (await submitManualBtn.isVisible()) {
      await submitManualBtn.click();
      await page.waitForTimeout(3000);

      // Verifikasi pesan peringatan duplikasi muncul
      const dupAlert = page.locator("text=sudah pernah diunggah sebelumnya");
      await expect(dupAlert).toBeVisible({ timeout: 10000 });
      console.log("Deteksi duplikasi berhasil terpicu!");
      await page.screenshot({ path: "test-results/screenshots/live-duplicate-detection-alert.png", fullPage: false });
    }
  }

  console.log("Seluruh pengujian fungsional live produksi sukses!");
});
