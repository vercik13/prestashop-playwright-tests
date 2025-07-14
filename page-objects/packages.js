import { test, expect } from "@playwright/test";

class Packages {
  constructor(page) {
    this.page = page;
    this.rowSelector = 'tr';
    this.referenceColumnSelector = 'td.column-orders_numbers';
  }

  async checkPackages(orderAlzaTextTrim) {
    const firstPackageOrderRow = this.page.locator(this.rowSelector).filter({ hasText: orderAlzaTextTrim });
    const orderRowCount = await firstPackageOrderRow.count();

    if (orderRowCount === 0) {
      const errorMessage = `Chyba na stránce Balíky - řádek s objednávkou ${orderAlzaTextTrim} nebyl nalezen`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const orderAlzaTextPackage = await firstPackageOrderRow.locator(this.referenceColumnSelector).innerText();
    const orderAlzaTextPackageTrim = orderAlzaTextPackage.replace(/"/g, '').trim();

    const packageTableRows = this.page.locator(this.rowSelector).filter({ hasText: orderAlzaTextPackageTrim });
    const packageRowCount = await packageTableRows.count();

    if (packageRowCount > 0) {
      console.log(`Stránka balíky - řádek s objednávkou ${orderAlzaTextPackageTrim} byl nalezen`);
      const createShipment = packageTableRows.locator("text=Vytvořit zásilku").first();
      try {
        await expect(createShipment).toBeVisible({ timeout: 10000 });
        await createShipment.click();
        console.log("Tlačítko 'Vytvořit zásilku' je viditelné, kliknuto na tlačítko");
      } catch (error) {
        console.error(`Tlačítko 'Vytvořit zásilku' není viditelné pro objednávku ${orderAlzaTextPackageTrim}`, error.message);
        throw error;
      }
    } else {
      const errorMessage = `Chyba na stránce Balíky - řádek s objednávkou ${orderAlzaTextPackageTrim} nebyl nalezen v tabulce balíků - nevytvořil se balík`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return { orderAlzaTextPackageTrim };
  }
}

module.exports = Packages;
