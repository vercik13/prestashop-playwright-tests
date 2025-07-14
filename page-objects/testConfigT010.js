import { expect } from "@playwright/test";

class TestConfigT010 {

  constructor(page) {
    this.page = page;
  }
  
  async setupTestConfiguration() {
    await this.page.locator("#DEMO_ALZA").fill("1=1");
    await this.page.selectOption("select#DEMO_NUMBER", "t010");
    const selectedValue = await this.page
      .locator("select#DEMO_NUMBER")
      .inputValue();
    expect(selectedValue).toBe("t010");
    await this.page.locator("#DEMO_PRODUCTS").fill("19, 7");
    await this.page.click("#save_1");
  }
}

module.exports = TestConfigT010;