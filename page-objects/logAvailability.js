import { expect } from "@playwright/test";

class LogAvailability {
  constructor(page) {
    this.page = page;
  }
  
  async checkLogAvailability(availabilityStartTime) {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("table tbody");
    //první řádek, který má uvedený text
    const firstFullAvailabilityRow = this.page.locator("table tbody tr").filter({hasText: 'FullAvailability: success'}).first();

    if (!firstFullAvailabilityRow) {
    throw new Error("Řádek nebyl nalezen.");
    }
    //získá čas záznamu z prvního odpovídajícího řádku
    const availabilityRecordTime = await firstFullAvailabilityRow
    .locator('td.column-date_add time')
    .getAttribute('datetime');

    //převede se na objekt Date
    const availabilityTime = new Date(availabilityRecordTime);
    console.log(`Čas spuštění availability: ${availabilityStartTime}`);
    console.log(`Čas posledního záznamu: ${availabilityTime}`);

    // Ověření, že první záznam byl vytvořen po spuštění availability
    expect(availabilityTime > availabilityStartTime).toBeTruthy();
    console.log("Poslední záznam 'FullAvailability' byl vytvořen po spuštění availability.");
      
  }
}


module.exports = LogAvailability;