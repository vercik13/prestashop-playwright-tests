import { test, expect } from "@playwright/test";

class Shipment {

  constructor(page) {
    this.page = page;
    this.rowSelector = 'tr';
    //this.referenceColumnSelector = 'td.column-orders_numbers';
   
  }
  
  async checkShipment({orderAlzaTextPackageTrim, orderAlzaTextTrim, orderAlzaText}) {
    const shipmentTableRows = this.page.locator(this.rowSelector).filter({hasText: orderAlzaTextPackageTrim});
    const shipmentRowCount = await shipmentTableRows.count();
    if (shipmentRowCount > 0 ) {
      console.log(`Stránka Zásilky - řádek s objednávkou ${orderAlzaTextTrim} byl nalezen`);
      const sendShipment = shipmentTableRows.locator("text=Odeslat zásilku").first();
      try {
        await expect(sendShipment).toBeVisible({ timeout: 10000 });
        await sendShipment.click();
        console.log("Tlačítko 'Odeslat zásilku' je viditelné, kliknuto na tlačítko")
      } catch (error) {
        console.error("Chyba na stránce Zásilky - tlačítko 'Odeslat zásilku' není viditelné", error.message);
        throw error;
      }

      // Kliknutí na tlačítko "Označit jako odeslanou"
      const shipmentSent = this.page.locator("text=Označit jako odeslanou").first();
      try {
        await expect(shipmentSent).toBeVisible({ timeout: 10000 });
        await shipmentSent.click();
        console.log("Tlačítko 'Označit jako odeslanou' je viditelné, kliknuto na tlačítko");
      } catch (error) {
        console.error("Tlačítko 'Označit jako odeslanou' není viditelné.", error.message);
        throw error;
      }


    } else {
      const errorMessage = `Chyba - řádek s objednávkou ${orderAlzaTextTrim} nebyl nalezen - nevytvořila se zásilka`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    };

  }
}


module.exports = Shipment;