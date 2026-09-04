import { test, expect } from "@playwright/test";

test.describe("E2E Test Rute Baru: Ekstraksi SKKNI, Kurikulum Mapel & Bahan Ajar KKTP", () => {
  test.describe("1. Dedicated Full-Page SKKNI Extraction (/guru/unggah-skkni & /kaprogli/unggah-skkni)", () => {
    test("Guru can access /guru/unggah-skkni, see two-column layout & search bar", async ({ page }) => {
      // Login as Demo Guru
      await page.goto("/login");
      await page.getByRole("button", { name: /Demo Guru/i }).click();
      await expect(page).toHaveURL(/\/guru/, { timeout: 15000 });

      // Navigate to /guru/unggah-skkni
      await page.goto("/guru/unggah-skkni");
      await expect(page).toHaveURL(/\/guru\/unggah-skkni/);

      // Verify header & breadcrumb
      await expect(page.locator("h1")).toContainText("Unggah & Ekstraksi Unit SKKNI Kemnaker");
      await expect(page.locator("text=Kembali ke Dasbor Guru")).toBeVisible();
      await expect(page.locator("text=ETL Pipeline Mandiri")).toBeVisible();

      // Verify two-column layout
      await expect(page.locator("text=Tarik & Letakkan PDF SKKNI di Sini")).toBeVisible();
      await expect(page.locator("text=Belum Ada Dokumen yang Diunggah")).toBeVisible();

      // Test switching to Input Teks Manual tab
      const manualTabBtn = page.getByRole("button", { name: /Input Teks Manual/i });
      await expect(manualTabBtn).toBeVisible();
      await manualTabBtn.click();
      await expect(page.locator("text=Form Salin Potongan Teks")).toBeVisible();
      await expect(page.getByRole("button", { name: /Contoh Unit/i })).toBeVisible();

      // Click "Contoh Unit" sample autofill
      await page.getByRole("button", { name: /Contoh Unit/i }).click();
      await expect(page.locator("input[name='kodeUnit']")).toHaveValue("J.620100.012.01");

      await page.screenshot({ path: "test-results/screenshots/20-guru-unggah-skkni.png", fullPage: true });
    });

    test("Kaprogli can access /kaprogli/unggah-skkni", async ({ page }) => {
      // Login as Demo Kaprogli
      await page.goto("/login");
      await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
      await expect(page).toHaveURL(/\/kaprogli/, { timeout: 15000 });

      // Navigate to /kaprogli/unggah-skkni
      await page.goto("/kaprogli/unggah-skkni");
      await expect(page).toHaveURL(/\/kaprogli\/unggah-skkni/);
      await expect(page.locator("h1")).toContainText("Unggah & Ekstraksi Unit SKKNI Kemnaker");
      await expect(page.locator("text=Kembali ke Dasbor Kaprogli")).toBeVisible();

      await page.screenshot({ path: "test-results/screenshots/21-kaprogli-unggah-skkni.png", fullPage: true });
    });
  });

  test.describe("2. Kaprogli Kurikulum & Mapel Sync Tab (/kaprogli)", () => {
    test("Kaprogli views seeded subjects, WSOS badges, and opens sync modal", async ({ page }) => {
      // Login as Demo Kaprogli
      await page.goto("/login");
      await page.getByRole("button", { name: /Demo Kaprogli/i }).click();
      await expect(page).toHaveURL(/\/kaprogli/, { timeout: 15000 });

      // Click tab "Kurikulum & Mapel (X, XI, XII)"
      const mapelTabBtn = page.getByRole("tab", { name: /Kurikulum & Mapel/i });
      await expect(mapelTabBtn).toBeVisible();
      await mapelTabBtn.click();

      // Verify section heading
      await expect(page.locator("h3")).toContainText("Kurikulum & Mata Pelajaran Kejuruan (X, XI, XII)");

      // Verify seeded subjects
      await expect(page.locator("text=Sistem Komputer Jaringan (SisKomJar)").first()).toBeVisible();
      await expect(page.locator("text=Internet of Things (IoT)").first()).toBeVisible();
      await expect(page.locator("text=Sistem Keamanan Jaringan (SKJ)").first()).toBeVisible();

      // Verify WorldSkills (WSOS) badges
      await expect(page.locator("text=WSOS: Skill 39: Network Systems Administration").first()).toBeVisible();
      await expect(page.locator("text=Passing Grade: Min. 80 (Cakap)").first()).toBeVisible();
      await expect(page.locator("text=Lab 100% Siap").first()).toBeVisible();

      // Open "Sinkronkan SKKNI" modal
      const syncBtn = page.getByRole("button", { name: /Sinkronkan SKKNI/i }).first();
      await syncBtn.click();

      // Verify modal is open
      await expect(page.locator("h4").filter({ hasText: /Sinkronisasi SKKNI/i })).toBeVisible();
      await expect(page.locator("button").filter({ hasText: /Simpan Sinkronisasi/i })).toBeVisible();

      // Close modal
      const closeBtn = page.getByRole("button", { name: /Batal/i }).first();
      await closeBtn.click();

      await page.screenshot({ path: "test-results/screenshots/22-kaprogli-mapel-tab.png", fullPage: true });
    });
  });

  test.describe("3. Guru Bahan Ajar Catalog & Canvas (/guru/bahan-ajar & [mapelId])", () => {
    test("Guru navigates to /guru/bahan-ajar, filters classes, and enters Canvas", async ({ page }) => {
      // Login as Demo Guru
      await page.goto("/login");
      await page.getByRole("button", { name: /Demo Guru/i }).click();
      await expect(page).toHaveURL(/\/guru/, { timeout: 15000 });

      // Click quick access header button "Bahan Ajar & Jobsheet Mapel"
      const headerBtn = page.getByRole("link", { name: /Bahan Ajar & Jobsheet Mapel/i });
      await expect(headerBtn).toBeVisible();
      await headerBtn.click();

      // Verify navigation to /guru/bahan-ajar
      await expect(page).toHaveURL(/\/guru\/bahan-ajar/);
      await expect(page.locator("h1")).toContainText("Bahan Ajar, Jobsheet & Rubrik KKTP");

      // Verify class level tabs (X, XI, XII)
      await expect(page.getByRole("link", { name: "Kelas X", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Kelas XI", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Kelas XII", exact: true })).toBeVisible();

      // Click "Kelas XI" tab
      await page.getByRole("link", { name: "Kelas XI", exact: true }).click();
      await expect(page).toHaveURL(/tingkat=XI/);
      await expect(page.locator("text=Sistem Komputer Jaringan (SisKomJar)").first()).toBeVisible();

      await page.screenshot({ path: "test-results/screenshots/23-guru-bahan-ajar-catalog.png", fullPage: true });

      // Click "Susun Bahan Ajar" on first subject
      const susunBtn = page.getByRole("link", { name: /Susun Bahan Ajar/i }).first();
      await susunBtn.click();

      // Verify Canvas URL (/guru/bahan-ajar/[mapelId])
      await expect(page).toHaveURL(/\/guru\/bahan-ajar\//);

      // Verify Canvas components
      await expect(page.locator("text=Formula Pembobotan KKTP Tripartit")).toBeVisible();
      await expect(page.locator("text=20% Teori")).toBeVisible();
      await expect(page.locator("text=40% Praktik Mandiri")).toBeVisible();
      await expect(page.locator("text=40% Proyek PBL")).toBeVisible();

      // Test switching to "Simulator Penilaian KKTP" tab
      const calcTabBtn = page.getByRole("button", { name: /Simulator Penilaian KKTP/i });
      await expect(calcTabBtn).toBeVisible();
      await calcTabBtn.click();

      await expect(page.locator("text=Nilai Akhir Agregat")).toBeVisible();
      await expect(page.locator("text=TUNTAS PASSING GRADE")).toBeVisible();

      // Test Hard-Gate K3 toggle (simulate safety violation)
      const k3Checkbox = page.locator("input[type='checkbox']").first();
      await k3Checkbox.check();

      // Verify Hard-Gate K3 triggered "BELUM TUNTAS / REMEDIAL"
      await expect(page.locator("text=BELUM TUNTAS / REMEDIAL")).toBeVisible();
      await expect(page.locator("text=Pelanggaran SOP Keselamatan dan Kesehatan Kerja")).toBeVisible();

      await page.screenshot({ path: "test-results/screenshots/24-guru-kktp-canvas.png", fullPage: true });
    });
  });
});
