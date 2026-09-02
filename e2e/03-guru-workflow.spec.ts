import { test, expect } from "@playwright/test";

test.describe("Guru Workflow & Lesson Plan Assembly", () => {
  test.beforeEach(async ({ page }) => {
    // Login as Demo Guru
    await page.goto("/login");
    await page.getByRole("button", { name: /Demo Guru/i }).click();
    await expect(page).toHaveURL(/\/guru/, { timeout: 15000 });
  });

  test("Guru can select specialization, pick unit, add suggestions, and review export", async ({ page }) => {
    // Verify Guru landing page
    await expect(page.locator("h1")).toContainText("Pilih Unit Kompetensi SKKNI");

    // Start draft by picking specialization if prompted
    const tkjBtn = page.getByRole("button", { name: /Teknik Komputer dan Jaringan/i }).first();
    if (await tkjBtn.isVisible()) {
      await tkjBtn.click();
    }

    // Click the first unit card to enter builder
    const firstUnitCard = page.locator("a[href^='/guru/susun/']").first();
    await expect(firstUnitCard).toBeVisible();
    await firstUnitCard.click();

    // Verify Builder Page
    await expect(page).toHaveURL(/\/guru\/susun\//);
    await expect(page.locator("text=Kartu saran").first()).toBeVisible();

    // If specialization selection is on the right side of builder page, activate it
    const builderTkjBtn = page.getByRole("button", { name: /Teknik Komputer dan Jaringan/i }).first();
    if (await builderTkjBtn.isVisible()) {
      await builderTkjBtn.click();
    }

    // Add a suggestion card to the lesson plan
    const addCardBtn = page.getByRole("button", { name: /Tambahkan ke modul ajar/i }).first();
    await expect(addCardBtn).toBeVisible();
    await page.screenshot({ path: "test-results/screenshots/08-guru-builder-step.png", fullPage: true });

    await addCardBtn.click();

    // Go to Review & Export page
    const tinjauBtn = page.getByRole("link", { name: /Tinjau & ekspor/i }).first();
    await expect(tinjauBtn).toBeVisible();
    await tinjauBtn.click();

    // Verify Review Page
    await expect(page).toHaveURL(/\/guru\/tinjau/);
    await expect(page.locator("h1")).toContainText("Tinjau akhir sebelum ekspor");

    // Verify Export Action Buttons
    const mdExportBtn = page.getByRole("button", { name: "MD" });
    const docxExportBtn = page.getByRole("button", { name: "DOCX" });
    const pdfExportBtn = page.getByRole("button", { name: "PDF" });

    await expect(mdExportBtn).toBeVisible();
    await expect(docxExportBtn).toBeVisible();
    await expect(pdfExportBtn).toBeVisible();

    await page.screenshot({ path: "test-results/screenshots/09-guru-review-export.png", fullPage: true });
  });
});
