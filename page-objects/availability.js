import { test, expect } from "@playwright/test";

class Availability {

  constructor(page) {
    this.page = page;
   
  }
  
  async startAvailability() {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(5000);
    try {
      const availabilityPage = this.page.locator("body");
      await expect(availabilityPage).toHaveText("Success");
      console.log("Odeslání availability prošlo OK - Success.");
    } catch (error) {
      console.error("Error - odeslání availability nepřošlo:", error.message); // Výpis chyby
      throw error;
    }   
  }
}


module.exports = Availability;