import { test, expect } from "@playwright/test";

class Payment {
  constructor(page) {
    this.page = page;
  }

  async selectBankTransferPayment() {
    const bankTransferPayment = await this.page.locator(".cc-payment", {
      hasText: "Zaplatit bankovním převodem",
    });
    await bankTransferPayment.locator(".cc-selector--radio").click();
  }

  async selectCashPayment() {
    const cashPayment = await this.page.locator(".cc-payment", {
      hasText: "Zaplatit hotově při doručení",
    });
    await cashPayment.locator(".cc-selector--radio").click();
  }
}

module.exports = Payment;
