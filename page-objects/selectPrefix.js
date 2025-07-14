class SelectPrefix {
  constructor(page) {
    this.page = page;
  }

  async selectPrefix() {
    await this.page
      .locator("#deliveryAddress\\.phonePrefix")
      .first()
      .selectOption("16");
  }
}

module.exports = SelectPrefix;
