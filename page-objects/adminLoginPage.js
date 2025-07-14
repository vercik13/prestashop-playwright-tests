class AdminLoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="passwd"]';
    this.loginButton = 'button[name="submitLogin"]';
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email); // Vyplní email
    await this.page.fill(this.passwordInput, password); // Vyplní heslo
    await this.page.click(this.loginButton); // Klikne na přihlášení
    await this.page.waitForLoadState("domcontentloaded"); // Počká na načtení stránky
  }
}

// Export pomocí CommonJS
module.exports = AdminLoginPage;
