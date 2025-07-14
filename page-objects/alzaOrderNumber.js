import { test, expect } from "@playwright/test";

class AlzaOrderNumber {
  constructor(page) {
    this.page = page;
    this.rowSelector = 'tr';
    this.referenceColumnSelector = 'td.column-reference';
  }
  
  async findOrderNumber() {
    const firstOrderRow = this.page.locator(this.rowSelector).filter({hasText:  'ALZA_'}).first();
    const orderAlzaText = await firstOrderRow.locator(this.referenceColumnSelector).innerText();
    const orderAlzaNumber = orderAlzaText.replace('ALZA_', '').trim();
    const orderAlzaTextTrim = orderAlzaText.trim();
    console.log(`Nalezena objednávka s číslem: ${orderAlzaNumber}`);
    return { firstOrderRow, orderAlzaText, orderAlzaNumber, orderAlzaTextTrim };
  }
}


module.exports = AlzaOrderNumber;