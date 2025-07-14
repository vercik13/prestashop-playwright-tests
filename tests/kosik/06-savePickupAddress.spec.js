import { test, expect } from "@playwright/test";

/**
 * Test ověřuje správné uložení adresy osobního odběru (Pickup in Store) do databáze v Prestashopu 1.7.8.
 * 
 * Test simuluje kompletní proces:
 * - Přihlášení do administrace Prestashopu.
 * - Kontrolu a nastavení dopravce "Click and collect" s aktivovanou možností osobního odběru.
 * - Vyplnění polí adresy osobního odběru (ulice, město, PSČ) v administraci a uložení změn.
 * - Provedení objednávky produktu přes frontend, kde je zvolen způsob doručení "Click and collect" a platba při převzetí.
 * - Přihlášení do databázového rozhraní a ověření, že se správně uložily hodnoty adresy osobního odběru zadané v administraci.
 * 
 */


test.setTimeout(300000);

const AdminLoginPage = require("../../page-objects/adminLoginPage");
const AddToCart = require("../../page-objects/addToCart");
const SelectCountry = require("../../page-objects/selectCountry");
const Carrier = require("../../page-objects/carrier");
const Payment = require("../../page-objects/payment");
const SelectPrefix = require("../../page-objects/selectPrefix");
const OrderButton = require("../../page-objects/orderButton");
const config = require("../../config.json");
const shop = config.shops["presta178-php74"];

test("Test uložení adresy osobního odběru v DB", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const addToCart = new AddToCart(page);
  const payment = new Payment(page);
  const carrier = new Carrier(page);
  const selectCountry = new SelectCountry(page);
  const selectPrefix = new SelectPrefix(page);
  const orderButton = new OrderButton(page);
  const streetField = page.locator('#pickup_in_store_street');
  const cityField = page.locator('#pickup_in_store_city');
  const postCodeField = page.locator("#pickup_in_store_post_code");

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await installModule.installModule(modulePath);

  //ověření polí u dopravce My Cyrrier
  const rowMyCarrier = page.locator('tr:has-text("My carrier")');
  await rowMyCarrier.locator('a[title="Upravit"]').click()
  const pickupInStoreRadio = page.locator('#pickup_in_store_on');
  await expect(pickupInStoreRadio).not.toBeChecked();
  console.log("Volba 'Pickup in store je správně vypnutá");
  await expect(streetField).not.toBeVisible();
  console.log("Pole 'Ulice' správně není viditelné na stránce.");
  await expect(cityField).not.toBeVisible();
  console.log("Pole 'Město' správně není viditelné");
  await expect(postCodeField).not.toBeVisible();
  console.log("Pole 'PSČ' správně není viditelné");

  await page.locator('li.breadcrumb-current a', { hasText: "Košík" }).click();

  //ověření polí u Osobního odběru
  const rowClickAndCollect = page.locator('tr:has-text("Click and collect")');
  await rowClickAndCollect.locator('a[title="Upravit"]').click();

  await expect(pickupInStoreRadio).toBeChecked();
  console.log("Volba 'Pickup in store' je zapnutá.");

  await expect(streetField).toBeVisible();
  console.log("Pole 'Ulice' je viditelné na stránce.");
  await page.locator("#pickup_in_store_street").fill("playwright2");

  await expect(cityField).toBeVisible();
  console.log("Pole město je viditelné");
  await page.locator("#pickup_in_store_city").fill("test");

  await expect(postCodeField).toBeVisible();
  console.log("Pole pro PSČ je viditelné");
  await page.locator("#pickup_in_store_post_code").fill("222 33");
  await page.locator('#save_5').click();

  // Povolení možnosti "Enabled"
  await page.locator('#ps_cashondelivery_on').click();
  await page.locator("#save_6").click();
  await page.waitForLoadState("networkidle");

  await page.goto(`${shop.productURL}`);
  await addToCart.addToCart();
  await selectCountry.selectCountry();
  await carrier.selectClickAndCollect();
  await payment.selectCashPayment();
  await selectPrefix.selectPrefix();

  await page
  .locator('[name="deliveryAddress.email"]')
  .fill("vero.vokounova@gmail.com");
  await page.locator('[name="deliveryAddress.firstname"]').fill("verča");
  await page
    .locator('[name="deliveryAddress.lastname"]')
    .fill("vokounova");
  await page.locator('[name="deliveryAddress.phone"]').fill("123456789");
  await orderButton.clickOrderButton();

  await page.goto(`${shop.db.dbURL}`);
  await page.locator("#username").fill(`${shop.db.username}`)
  await page.locator("input[type='password']").fill(`${shop.db.password}`);
  await page.locator("input[type='submit']").first().click();

  //kliknutí na SQL příkaz
  await page.locator('a', { hasText: 'SQL command' }).click();

  //SQL dotaz
  const sqlQuery = "SELECT lastname, firstname, address1, postcode, city FROM ps_address ORDER BY id_customer DESC LIMIT 1";
  
  await page.fill('pre.sqlarea', sqlQuery);
  await page.locator("input[type='submit'][value='Execute']").click();
  await page.waitForSelector("table");
  
  const tableRows = page.locator('table tbody tr');
  const lastname = await tableRows.locator('td').nth(0).innerText();
  console.log(lastname);
  const firstname = await tableRows.locator('td').nth(1).innerText();
  console.log(firstname);
  const address = await tableRows.locator('td').nth(2).innerText();
  const postcode = await tableRows.locator('td').nth(3).innerText();
  const city = await tableRows.locator('td').nth(4).innerText();

  expect(lastname).toBe('vokounova');
  expect(firstname).toBe('verča')
  expect(address).toBe('playwright2');
  expect(postcode).toBe('222 33');
  expect(city).toBe('test');
});
