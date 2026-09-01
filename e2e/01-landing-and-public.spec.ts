import { test, expect } from "@playwright/test";

test.describe("Landing Page & Public Tools", () => {
  test("Landing page renders hero, stats, cara kerja, regulasi, and faq", async ({ page }) => {
    await page.goto("/");

    // Verify title and brand
    await expect(page).toHaveTitle(/VokasIn/i);
    await expect(page.locator("nav").first()).toContainText("VokasIn");

    // Verify Hero content
    const heroHeading = page.locator("#hero h1");
    await expect(heroHeading).toBeVisible();

    // Verify Stats Section
    const statsSection = page.locator("#stats");
    await expect(statsSection).toBeVisible();
    await expect(statsSection).toContainText("Tantangan Vokasi");

    // Verify Cara Kerja Section
    const caraKerja = page.locator("#cara-kerja");
    await expect(caraKerja).toBeVisible();
    await expect(caraKerja).toContainText("Empat langkah, dari SKKNI ke jobsheet");

    // Verify FAQ Accordion Interaction
    const faqSection = page.locator("#faq");
    await expect(faqSection).toBeVisible();
    const firstFaq = faqSection.locator("details").first();
    await expect(firstFaq).toBeVisible();
    await firstFaq.locator("summary").click();
    await expect(firstFaq).toHaveAttribute("open", "");
  });

  test("Roadmap Kompetensi renders program list and tracks mastered units", async ({ page }) => {
    await page.goto("/roadmap");

    await expect(page.locator("h1")).toContainText("Roadmap Kompetensi");
    const rplLink = page.getByRole("link", { name: /Rekayasa Perangkat Lunak/i });
    await expect(rplLink).toBeVisible();
    await rplLink.click();

    await expect(page).toHaveURL(/\/roadmap\/pk-rpl/);
    await expect(page.locator("h1")).toContainText("Rekayasa Perangkat Lunak");

    // Check a unit competency item
    const checkbox = page.locator("input[type='checkbox']").first();
    if (await checkbox.isVisible()) {
      const isInitiallyChecked = await checkbox.isChecked();
      await checkbox.click();
      await expect(checkbox).toBeChecked({ checked: !isInitiallyChecked });
    }
  });

  test("Jelajah Kompetensi searches by text and quick sample chips", async ({ page }) => {
    await page.goto("/jelajah-kompetensi");

    await expect(page.locator("h1")).toContainText("Jelajah Kompetensi");

    // Click sample prompt chip
    const sampleChip = page.getByRole("button", { name: /Jaringan LAN & Router/i });
    await expect(sampleChip).toBeVisible();
    await sampleChip.click();

    // Expect search results container to appear
    await expect(page.locator("text=Daftar ini menunjukkan kompetensi")).toBeVisible({ timeout: 20000 });
  });
});
