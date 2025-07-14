import { test, expect } from "@playwright/test";

/**
 * Test ověřuje kompletní proces objednávky v eshopu Prestashop 1.7.8.
 * 
 * Test provádí tyto kroky:
 * - Přihlášení do administrace eshopu.
 * - Povolení používání registrovaného emailu hostem v konfiguraci eshopu.
 * - Uložení změn konfigurace.
 * - Na frontendu přidání produktu do košíku.
 * - Čekání na zobrazení tlačítka pro dokončení objednávky.
 * - Výběr země doručení.
 * - Výběr dopravce.
 * - Výběr způsobu platby (bankovní převod).
 * - Výběr země doručení v adresním formuláři.
 * - Vyplnění objednávkového formuláře s potřebnými údaji.
 * - Odeslání objednávky.
 * 
 * Test ověřuje, že objednávka může být úspěšně dokončena se zapnutou možností použití registrovaného emailu hostem.
 */


test.setTimeout(80000);

const AdminLoginPage = require("../../page-objects/adminLoginPage");
const OpenCartConfiguration = require("../../page-objects/openCartConfiguration");
const AddToCart = require("../../page-objects/addToCart");
const SelectCountry = require("../../page-objects/selectCountry");
const Carrier = require("../../page-objects/carrier");
const Payment = require("../../page-objects/payment");
const OrderForm = require("../../page-objects/orderForm");
const OrderButton = require("../../page-objects/orderButton");
const config = require("../../config.json");
const shop = config.shops["presta178-php74"];

test("Test objednávky", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const openCartConfiguration = new OpenCartConfiguration(page);
  const addToCart = new AddToCart(page);
  const selectCountry = new SelectCountry(page);
  const payment = new Payment(page);
  const carrier = new Carrier(page);
  const orderForm = new OrderForm(page);
  const orderButton = new OrderButton(page);

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await openCartConfiguration.goToConfiguration();

  //povolení používání registrováného emailu
  await page.locator("#tab-link-4").click();
  const isAllowEmailByGuestEnabled = await page.isChecked(
    "#allow_using_registered_email_by_guest_on"
  );
  if (!isAllowEmailByGuestEnabled) {
    await page.click("#allow_using_registered_email_by_guest_on");
  }
  await page.click("#save_9");
  await page.goto(`${shop.productURL}`);
  await addToCart.addToCart();

  let buttonOrder = page.locator(".cc-theme__recap .cc-button--order");
  await buttonOrder.waitFor({ timeout: 20000 });
  await selectCountry.selectCountry();
  await carrier.selectMyCarrier();
  await payment.selectBankTransferPayment();
  await page
    .locator('[name="deliveryAddress.country"]')
    .first()
    .selectOption("16");
  await orderForm.fillForm();
  await orderButton.clickOrderButton();
});
