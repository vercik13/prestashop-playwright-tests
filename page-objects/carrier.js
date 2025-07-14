import { test, expect } from "@playwright/test";

class Carrier {
  constructor(page) {
    this.page = page;
  }
  async selectMyCarrier() {
    const myCarrier = await this.page.locator(".cc-carrier", {
      hasText: "My carrier",
    });
    await myCarrier.locator(".cc-selector--radio").click();
  }

  async selectClickAndCollect() {
    const clickAndCollect = await this.page.locator(".cc-carrier", {
      hasText: "Click and collect",
    });
    await clickAndCollect.locator(".cc-selector--radio").click();
  }
}

module.exports = Carrier;
