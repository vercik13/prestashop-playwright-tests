import { test, expect } from "@playwright/test";

/**
 * Test ověřuje správné zobrazení a aplikaci slevového pravidla v košíku Prestashop 1.7.8.
 * 
 * Test provádí následující kroky:
 * - Přihlášení do administrace Prestashopu.
 * - Vytvoření nového pravidla slevy pro košík s fixní slevou 10 Kč.
 * - Nastavení konfigurace eshopu pro zobrazení dostupných slevových kódů v košíku.
 * - Přidání produktu do košíku na frontendu.
 * - Ověření, že se zobrazil kód slevy v košíku.
 * - Zjištění ceny košíku před aplikací slevy.
 * - Kliknutí na slevový kód pro jeho aplikaci.
 * - Zjištění ceny košíku po aplikaci slevy.
 * - Kontrola, že výsledná cena odpovídá očekávané slevě.
 * 
 */


test.setTimeout(200000);
const AdminLoginPage = require("../../page-objects/adminLoginPage");
const OpenCartConfiguration = require("../../page-objects/openCartConfiguration");
const AddToCart = require("../../page-objects/addToCart");
const WaitForRequest = require("../../page-objects/waitForRequest");
const config = require("../../config.json");
const shop = config.shops["presta178-php74"];

test("Zobrazení upozornění na slevy v košíku", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const openCartConfiguration = new OpenCartConfiguration(page);
  const addToCart = new AddToCart(page);
  const waitForRequest = new WaitForRequest(page);

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);

  //katalog - slevy - pravidlo pro košík
  await page.locator("li#subtab-AdminCatalog > a").click();
  await page.locator("ul#collapse-9").waitFor();
  await page.locator("li#subtab-AdminParentCartRules > a").click();

  //přidání nového pravidla pro košík
  await page.locator("#page-header-desc-cart_rule-new_cart_rule").click();
  //vyplnění slevy
  await page.locator("#name_1").fill("test sleva");
  await page.locator("#code").fill("PW10");

  await page.locator("#cart_rule_link_actions").click();
  await page.locator("#apply_discount_amount").click();
  await page.locator("#reduction_amount").fill("10");
  await page.locator('[name="reduction_tax"]').selectOption("S DPH");
  await page.locator("#cart_rule_link_informations").click();
  await page.locator("#highlight_on").click();
  await page.locator("#desc-cart_rule-save").click();

  //vyhledání a nastavení modulu
  await openCartConfiguration.goToConfiguration();
  await page.locator("#tab-link-4").click();

  //povolení volby pro zobrazení slevy
  const isShowAvailableDiscountCodesEnabled = await page.isChecked(
    "#show_discount_codes_on"
  );
  if (!isShowAvailableDiscountCodesEnabled) {
    await page.click("#show_discount_codes_on");
  } else {
    console.log("Volba byla povolena, pokračuje se do eshopu");
  }
  await page.click("#save_9");

  //přidání produktu do košíku
  await page.goto(`${shop.productURL}`);
  await addToCart.addToCart();
  await expect(page.getByText("PW10")).toBeVisible();
  await page.waitForSelector(".cc-price.cc-price--total", { state: "visible" });

  //získání hodnoty ceny celkem s dph před uplatněním slevy
  const totalPriceTextBefore = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log("Cena před:", totalPriceTextBefore);
  const totalPriceBefore = parseFloat(
    totalPriceTextBefore
      .replace(" Kč", "")
      .replace("&nbsp;", "")
      .trim()
      .replace(",", ".")
  );
  console.log("Celková cena před:", totalPriceBefore);

  //kliknutí na slevu
  await page
    .locator(".cc-voucher__price.cc-price.cc-price--voucher")
    .nth(1)
    .click();
  await waitForRequest.waitForAllRequestsFinished();

  //získaní ceny po přidání slevy
  const totalPriceTextAfter = await page
    .locator(".cc-price.cc-price--total")
    .nth(1)
    .innerText();
  console.log("Cena po:", totalPriceTextAfter);
  const totalPriceAfter = parseFloat(
    totalPriceTextAfter
      .replace(" Kč", "")
      .replace("&nbsp;", "")
      .trim()
      .replace(",", ".")
  );
  console.log("Celková cena po:", totalPriceAfter);

  //vyhodnocení
  expect(totalPriceAfter).toBeCloseTo(totalPriceBefore - 10, 2);
});
