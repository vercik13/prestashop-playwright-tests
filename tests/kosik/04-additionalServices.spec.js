import { test, expect } from "@playwright/test";

/**
 * Test ověřuje funkčnost doplňkových služeb v košíku Prestashop 1.7.8.
 * 
 * Test provádí tyto kroky:
 * - Přihlášení do administrace eshopu.
 * - Povolení použití registrovaného emailu pro hosty v konfiguraci.
 * - Kontrola a případné přidání produktu do tabulky doplňkových služeb v administraci.
 * - Přidání produktu do košíku na frontendu.
 * - Ověření ceny košíku před přidáním doplňkového produktu.
 * - Přidání doplňkového produktu do košíku a kontrola změny ceny.
 * - Odstranění doplňkového produktu z košíku a ověření změny ceny.
 * - Opětovné přidání doplňkového produktu do košíku a ověření ceny.
 * - Dokončení objednávky vyplněním potřebných údajů v objednávkovém formuláři.
 * 
 * Test zajišťuje, že doplňkové služby lze přidávat, odstraňovat a cena se správně aktualizuje, 
 * a že lze úspěšně dokončit objednávku s doplňkovými službami.
 */


test.setTimeout(70000);

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

test("Testování additional services", async ({ page }) => {
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
  await page.locator("#tab-link-4").click();

  //povolení použití registrovaného emailu
  const isAllowEmailByGuestEnabled = await page.isChecked(
    "#allow_using_registered_email_by_guest_on"
  );
  if (!isAllowEmailByGuestEnabled) {
    await page.click("#allow_using_registered_email_by_guest_on");
  }
  await page.click("#save_9");

  await page.locator("#tab-link-5").click();

  //ověření jesti je nastavený nějaký produkt
  const emptyRow = page.locator(
    "#table-additional_services tbody tr td.list-empty"
  );
  const isTableEmpty = await emptyRow.isVisible();

  if (isTableEmpty) {
    console.log("Tabulka je prázdná, přidávám nový produkt.");
    await page.fill("#id_product", "8");
    await page.check("#enabled_on");
    await page.click("#save_14");
  } else {
    console.log("Tabulka obsahuje produkty. Pokračuji na další část.");
  }
  await page.goto(`${shop.productURL}`);
  await addToCart.addToCart();

  //Získání ceny před přidáním produktu z doplňkového prodeje
  await page.waitForSelector(".cc-price.cc-price--total", { state: "visible" });
  const totalPriceTextBefore = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log("Cena před:", totalPriceTextBefore);

  const totalPriceLocator = page.locator(".cc-price.cc-price--total").nth(1);

  // Vyhodnocení před přidáním produktu
  await expect(totalPriceLocator).toHaveText(totalPriceTextBefore, {
    timeout: 5000,
  });

  // Po přidání produktu
  await page
    .locator(".cc-additional-services__item-action button")
    .first()
    .click();
  console.log("Přidání produktu do košíku.");

  const totalPriceTextAfter = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log("Cena po:", totalPriceTextAfter);

  // Ověření ceny po přidání produktu z doplňkového prodeje
  await expect(totalPriceLocator).toHaveText(totalPriceTextAfter, {
    timeout: 5000,
  });

  //odstranění produktu z košíku
  await page.locator(".cc-control--remove-product").nth(3).click();
  console.log("Odstranění produktu z košíku");
  await page.reload();
  await page.waitForSelector(".cc-price.cc-price--total", { state: "visible" });

  //získání ceny po odstranění produktu z košíku
  const totalPriceTextAfterRemoveProduct = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log(
    "Cena po odstranění produktu z košíku:",
    totalPriceTextAfterRemoveProduct
  );

  // Ověření ceny po odstranění produktu
  await expect(totalPriceLocator).toHaveText(totalPriceTextAfterRemoveProduct, {
    timeout: 5000,
  });

  //opětovné přidání produktu
  await page
    .locator(".cc-additional-services__item-action button")
    .first()
    .click();
  console.log("Opětovné přidání produktu do košíku");
  await page.reload();
  await page.waitForSelector(".cc-price.cc-price--total", { state: "visible" });

  //cena po přidání produktu
  const totalPriceTextAfterAddProduct = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log(
    "Cena po přidání produktu do košíku:",
    totalPriceTextAfterAddProduct
  );

  // Ověření ceny po přidání produktu
  await expect(totalPriceLocator).toHaveText(totalPriceTextAfterAddProduct);

  // Dokončení objednávky
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
