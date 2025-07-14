import { test, expect } from "@playwright/test";

class AddToCart {
  constructor(page) {
    this.page = page;
  }

  async addToCart() {
    await this.page.locator(".add-to-cart").first().click();
    const modal = this.page.locator("#blockcart-modal .modal-body");
    await modal.locator("a.btn-primary").click();
    await this.page.getByText("Obsah košíku");
  }
}

module.exports = AddToCart;
