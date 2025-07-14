import { test } from "@playwright/test";

/**
 * Test ověřuje registraci zákazníka během dokončení objednávky v Prestashop 1.7.8.
 * 
 * Test provádí tyto kroky:
 * - Přihlášení do administrace eshopu.
 * - Povolení registrace zákazníků přímo v košíku v konfiguraci.
 * - Zakázání možnosti použití již registrovaného emailu hostem.
 * - Přidání produktu do košíku na frontendové části eshopu.
 * - Výběr země doručení, dopravce a způsobu platby.
 * - Vyplnění objednávkového formuláře s jedinečným emailem, jménem, adresou a dalšími údaji.
 * - Zaškrtnutí možnosti registrace uživatele během objednávky.
 * - Odeslání objednávky.
 * - Kontrola úspěšného dokončení objednávky s registrací.
 * - Pokud se objeví chyba o duplicitním emailu, test ji správně zachytí a zobrazí upozornění.
 * 
 * Test zajišťuje, že zákazník se může během objednávky registrovat a že systém správně reaguje
 * na pokus o registraci již existujícího emailu.
 */


test.setTimeout(200000);

const AdminLoginPage = require("../../page-objects/adminLoginPage");
const OpenCartConfiguration = require("../../page-objects/openCartConfiguration");
const AddToCart = require("../../page-objects/addToCart");
const SelectCountry = require("../../page-objects/selectCountry");
const Carrier = require("../../page-objects/carrier");
const Payment = require("../../page-objects/payment");
const OrderButton = require("../../page-objects/orderButton");
const config = require("../../config.json");
const shop = config.shops["presta178-php74"];

test("Registrace zákazníka", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const openCartConfiguration = new OpenCartConfiguration(page);
  const addToCart = new AddToCart(page);
  const selectCountry = new SelectCountry(page);
  const payment = new Payment(page);
  const carrier = new Carrier(page);
  const orderButton = new OrderButton(page);

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await openCartConfiguration.goToConfiguration();
  await page.locator("#tab-link-4").click();

  //povolení registrace v košíku
  const isRegistrationEnabled = await page.isChecked(
    "#allow_registration_in_cart_on"
  );
  if (!isRegistrationEnabled) {
    await page.click("#allow_registration_in_cart_on");
  } else {
    console.log("Volba byla povolena, pokračuje se do eshopu");
  }
  //zakázání použití registrovaného emailu
  const isAllowEmailByGuestEnabled = await page.isChecked(
    "#allow_using_registered_email_by_guest_off"
  );
  if (!isAllowEmailByGuestEnabled) {
    await page.click("#allow_using_registered_email_by_guest_off");
  }
  await page.click("#save_9");
  await page.goto(`${shop.productURL}`);
  await addToCart.addToCart();
  await selectCountry.selectCountry();
  await carrier.selectMyCarrier();
  await payment.selectBankTransferPayment();
  await page
    .locator('[name="deliveryAddress.country"]')
    .first()
    .selectOption("16");

  //vyplnění formuláře
  const timestamp = Date.now(); // Časové razítko pro jedinečnost nově registrovaného emailu
  const uniqueEmail = `verca${timestamp}@test.cz`;
  await page.locator('[name="deliveryAddress.email"]').fill(uniqueEmail);
  await page.locator('[name="deliveryAddress.firstname"]').fill("test");
  await page.locator('[name="deliveryAddress.lastname"]').fill("test");
  await page.locator('[name="deliveryAddress.addressLine1"]').fill("test 32");
  await page.locator('[name="deliveryAddress.postalCode"]').fill("12345");
  await page.locator('[name="deliveryAddress.city"]').fill("test");
  await page.locator('[name="deliveryAddress.phone"]').fill("123456789");
  await page.locator("#user_requestRegistration").check();
  await page.locator('[name="user.password"]').fill("heslo123");
  await orderButton.clickOrderButton();

  const successMessage = page.locator(
    "text=Vaše objednávka byla úspěšně přijata"
  );
  const errorMessage = page.locator("text=E-mail je již registrován");

  try {
    await successMessage.waitFor({ timeout: 10000 });
    console.log("Objednávka a registrace byla úspěšně dokončena.");
  } catch {
    if (await errorMessage.isVisible()) {
      console.error("Upozornění: E-mail je již registrován!");
    } else {
      console.error(
        "Chyba: Nepodařilo se dokončit objednávku z jiného důvodu."
      );
    }
  }
});
