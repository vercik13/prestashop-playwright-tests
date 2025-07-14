class SelectCountry {
  constructor(page) {
    this.page = page;
  }

  async selectCountry() {
    await this.page
      .locator('[name="deliveryAddress.country"]')
      .first()
      .selectOption("16");
  }
}

module.exports = SelectCountry;
