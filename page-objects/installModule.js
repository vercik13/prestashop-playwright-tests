const { expect } = require("@playwright/test");

class InstallModule {
  constructor(page) {
    this.page = page;
  }

  async installModule(modulePath) {
    await this.page.getByRole("link", { name: "extension Moduly" }).waitFor();
    await this.page.getByRole("link", { name: "extension Moduly" }).click();
    await this.page.getByRole("link", { name: "Správce modulu" }).waitFor({ state: 'visible', timeout: 50000 });
    await this.page.getByRole("link", { name: "Správce modulu" }).click();
    await this.page.locator("#page-header-desc-configuration-add_module").click();

    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(modulePath);
    await this.page.waitForLoadState("networkidle");

    await this.page.waitForSelector(".module-import-success", { timeout: 50000 });

    const successMessage = await this.page.locator(".module-import-success").innerText();
    console.log(successMessage);
    expect(successMessage).toContain("Modul nainstalován!");

    const configureButton = this.page
      .locator(".module-import-success-configure")
      .filter({ hasText: "Konfigurace" });
    await expect(configureButton).toBeVisible();

    console.log("Tlačítko 'Konfigurace' je viditelné.");
    await configureButton.click();
  }
}

module.exports = InstallModule;
