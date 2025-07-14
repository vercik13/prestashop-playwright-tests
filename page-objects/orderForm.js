class OrderForm {
  constructor(page) {
    this.page = page;
  }

  async fillForm() {
    await this.page
      .locator('[name="deliveryAddress.email"]')
      .fill("vero.vokounova@gmail.com");
    await this.page.locator('[name="deliveryAddress.firstname"]').fill("test");
    await this.page
      .locator('[name="deliveryAddress.lastname"]')
      .fill("playwright");
    await this.page
      .locator('[name="deliveryAddress.addressLine1"]')
      .fill("test 25");
    await this.page
      .locator('[name="deliveryAddress.postalCode"]')
      .fill("12345");
    await this.page.locator('[name="deliveryAddress.city"]').fill("test");
    await this.page.locator('[name="deliveryAddress.phone"]').fill("123456789");
  }
}

module.exports = OrderForm;
