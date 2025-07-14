import { expect } from "@playwright/test";

class OrderButton {
  constructor(page) {
    this.page = page;
  }

  async clickOrderButton() {
    await this.page.locator(".cc-button--order").first().click();

    const successLocator = this.page.locator(
      "h3.card-title:has-text('Vaše objednávka')"
    );
    const iconLocator = successLocator.locator("i.material-icons.done");

    try {
      await expect(iconLocator).toBeVisible({ timeout: 60000 });
      await expect(successLocator).toBeVisible({ timeout: 60000 });

      console.log("Objednávka byla úspěšně potvrzena.");
    } catch (error) {
      console.error("Chyba: Text potvrzení objednávky nebyl nalezen.");
      throw error;
    }
  }
}

module.exports = OrderButton;
