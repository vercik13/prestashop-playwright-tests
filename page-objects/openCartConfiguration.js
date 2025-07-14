import { test, expect } from "@playwright/test";

class OpenCartConfiguration {
  constructor(page) {
    this.page = page;
  }

  async goToConfiguration() {
    // Vyhledání modulu "košík" a přepnutí do konfigurace
    await this.page.getByRole("link", { name: "extension Moduly" }).waitFor();
    await this.page.getByRole("link", { name: "extension Moduly" }).click();
    await this.page.getByRole("link", { name: "Správce modulu" }).click();
    await this.page.waitForSelector(".pstaggerAddTagInput");
    await this.page.click(".pstaggerAddTagInput");
    await this.page.fill(".pstaggerAddTagInput", "košík");
    await this.page.press(".pstaggerAddTagInput", "Enter");

    const moduleName = await this.page
      .locator("h3.module-name-list", { hasText: "Košík" })
      .innerText();
    expect(moduleName).toContain("Košík");
    await this.page.getByRole("link", { name: "Konfigurace" }).first().click();
    await this.page.waitForLoadState("networkidle");
  }

  async goToParcelshopConfiguration() {
    await this.page.getByRole("link", { name: "extension Moduly" }).waitFor();
    await this.page.getByRole("link", { name: "extension Moduly" }).click();
    await this.page.getByRole("link", { name: "Správce modulu" }).click();
    await this.page.waitForSelector(".pstaggerAddTagInput");
    await this.page.click(".pstaggerAddTagInput");
    await this.page.fill(".pstaggerAddTagInput", "shaim");
    await this.page.press(".pstaggerAddTagInput", "Enter");
    await this.page.locator('div[data-tech-name="shaim_pplparcelshop"] a:has-text("Konfigurace")').click();
    await this.page.waitForLoadState("networkidle");
  }
}

module.exports = OpenCartConfiguration;
