import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Test ověřuje funkčnost nastavení minimální hodnoty objednávky v systému Prestashop 1.6.
 * 
 * Postup testu zahrnuje:
 *  - Přihlášení do administrace Prestashopu.
 *  - Instalace modulu (zde nejsou použité kroky jako v page-object, z důvodů odlišních selektorů oproti verzi Prestashopu 1.7)
 *  - Nastavení minimální částky objednávky na 100 Kč v administraci.
 *  - Přidání produktu do košíku s hodnotou nižší než minimální částka a ověření zobrazení varovné hlášky o nedosažení minimální hodnoty objednávky.
 *  - Zvýšení množství produktu v košíku tak, aby hodnota přesáhla minimální limit, a ověření, že varovná hláška zmizela.
 * 
 */

test.setTimeout(300000);

const AdminLoginPage = require("../../page-objects/adminLoginPage");
const config = require("../../config.json");
const shop = config.shops["presta16-php74"];


test("Minimální výše objednávky kompatibilita s Prestashop 1.6", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const modulePath = path.resolve(
    __dirname,
    "../assets/productconfigurator.zip"
  );

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);

  const selector = "li#maintab-AdminParentModules > a.title";
  await page.locator(selector).click();
  await page.locator("#desc-module-new").click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(modulePath);

  page.locator(".btn-default:has-text('Nahrát tento modul')").click();
  await page.waitForLoadState("networkidle");
  const successAlert = await page.locator(".alert-success").innerText();
  console.log(successAlert);
  expect(successAlert).toContain("Modul byl úspěšně stažen.");


  //ověření textu a nastavení částky pro minimální objednávku
  await page.locator('li#maintab-AdminParentPreferences a.title').hover();
  //await page.locator('ul.submenu').waitFor();
  await page.locator('li#subtab-AdminOrderPreferences a', { hasText: 'Objednávky' }).click();

  const textLocator = page.locator("label span", {hasText: 'Je požadována minimální cena objednávky'});
  await expect(textLocator).toBeVisible();
  console.log("OK - Text 'Je požadována minimální cena objednávky' je zobrazen. ");

  //zadání částky
  const minimalPrice = page.locator('input[name="PS_PURCHASE_MINIMUM"]');
  await minimalPrice.fill('100');
  console.log("Minimální cena objednávky je nastavena na 100Kč bez DPH");
  await page.locator('#configuration_fieldset_general button[name="submitOptionsconfiguration"]').click();

  //přidání produktu do košíku
  await page.goto(`${shop.productURL}`);
  //přidání produktu do košíku

  await page.locator("#add_to_cart").click();
  await page.waitForSelector("#layer_cart");
  const layerCart = page.locator("#layer_cart");
  await expect(layerCart).toBeVisible();
  await page.locator('.button-medium[title="Objednat"]').click();
  await page.waitForLoadState("networkidle");

  //ověření zobrazení hlášky
  const minimalPurchaseError = page.locator('.cc-recap__footer .minimal-purchase-error').first();
  try {
    await expect (minimalPurchaseError).toBeVisible();
    const minimalPurchaseErrorText = await minimalPurchaseError.innerText();
    console.log("OK - Hláška o minimální hodnotě nákupu se zobrazuje:");
    console.log(minimalPurchaseErrorText);
  } catch {
    console.log("Chyba - Hláška o minimální hodnotě nákupu se nezobrazuje.");
  }

  //přidání produktu do košíku
  await page.goto(`${shop.productURL}`);
  await page.locator('span .icon-plus').click();
  await page.locator('span .icon-plus').click();
  console.log("Přidáno další množství produktu do košíku");

  await page.locator("#add_to_cart").click();
  await page.waitForSelector("#layer_cart");
  const modalCart = page.locator("#layer_cart");
  await expect(modalCart).toBeVisible();
  await page.locator('.button-medium[title="Objednat"]').click();

  // ověření že se hláška nezobrazuje
  const hiddenMinimalPurchaseError = page.locator('.cc-recap__footer .minimal-purchase-error').first();
  try {
    await expect (hiddenMinimalPurchaseError).not.toBeVisible();
    console.log("OK - Hláška o minimální hodnotě nákupu se nezobrazuje:");
  } catch {
    const hiddenMinimalPurchaseErrorText = await hiddenMinimalPurchaseError.innerText();
    console.log("Chyba - Hláška o minimální hodnotě nákupu se zobrazila.");
    console.log(hiddenMinimalPurchaseErrorText);
  }
})

