import { test, expect } from "@playwright/test";

class Testing {

  constructor(page) {
    this.page = page;
   
  }
  
  async startTesting() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(8000);
    try {
      const testingPage = this.page.locator("body");
      await expect(testingPage).toHaveText(
        `array(2) { ["errorCode"]=> int(0) ["errorMessage"]=> string(0) "" }`
      );
      console.log("Odeslání test.php prošlo OK");
    } catch (error) {
      console.error("Error - odeslání test.php nepřošlo:", error.message); // Výpis chyby
      throw error;
    }   
  }
}


module.exports = Testing;