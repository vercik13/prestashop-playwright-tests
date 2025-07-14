import { test, expect } from "@playwright/test";

class LogTesting {
  constructor(page) {
    this.page = page;
  }
  
  async checkLogTesting(testingStartTime) {
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("table tbody");

    try {
        const confirmOrderResponse = this.page.locator("table tbody tr").filter({hasText: 'ConfirmOrderResponse: Success []'}).first();
        const confirmOrderRequest = await this.page.locator("td.column-message").filter({hasText: 'ConfirmOrderRequest'}).first().innerText();
        const logOrderNumberAlzaMatch = confirmOrderRequest.match(/\order\/(\d+)\//);
 
        const logOrderNumberAlza = logOrderNumberAlzaMatch[1];
        console.log(`Číslo objednávky Alza na stránce Chybové záznamy: ${logOrderNumberAlza}`);
        
        const confirmOrderRecordTime = await confirmOrderResponse
        .locator("td.column-date_add time")
        .getAttribute("datetime");

        const logConfirmOrderTime = new Date(confirmOrderRecordTime);
        console.log(`Čas záznamu: ${logConfirmOrderTime}`);

        //ověření, že čas záznamu je po spuštění testing.php
        expect(logConfirmOrderTime > testingStartTime).toBeTruthy();
        console.log("Záznam byl vytvořen po spuštění testing.php.");

        return logOrderNumberAlza;      

        } catch (error) {
            console.error("Chyba při ověřování záznamu:", error.message);
            throw error; // Ukončí test, pokud dojde k chybě
        }

       
    }
}

module.exports = LogTesting;