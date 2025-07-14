import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Test: Instalace demo modulu Alza a dokončení objednávky
 *
 * Cíl testu:
 * - Nainstalovat modul Alza do PrestaShopu
 * - Provést konfiguraci testu (T010)
 * - Spustit dostupnost produktů (availability.php) a ověřit logy v administraci
 * - Spustit test objednávky (test.php) a ověřit úspěšné vytvoření objednávky
 * - Zkontrolovat shodu čísla Alza objednávky v systému a v logu
 * - Zadat sledovací číslo k objednávce
 * - Vygenerovat balík a ověřit jej na stránkách „Balíky“ a „Zásilky“
 * - Potvrdit kroky TNT (Depot, Delivery, Delivered)
 * - Ověřit v logu, že test byl dokončen úspěšně a že záznam vznikl po spuštění test.php
 *
 */

test.setTimeout(400000);

const config = require("../../config.json");
const shop = config.shops["presta-alza-demo"];
const AdminLoginPage = require("../../page-objects/adminLoginPage");
const InstallModule = require("../../page-objects/installModule");
const TestConfigT010 = require("../../page-objects/testConfigT010");
const Availability = require("../../page-objects/availability");
const LogAvailability = require("../../page-objects/logAvailability");
const Testing = require("../../page-objects/testing");
const LogTesting = require("../../page-objects/logTesting");
const MenuNavigation = require("../../page-objects/menuNavigation");
const AlzaOrderNumber = require("../../page-objects/alzaOrderNumber")
const Packages = require("../../page-objects/packages");
const Shipment = require("../../page-objects/shipment");
const TntButtons = require("../../page-objects/tntButtons")

test("Instalace modulu Alza a dokončení objednávky", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const installModule = new InstallModule(page);
  const testConfigT010 = new TestConfigT010(page);
  const availability = new Availability(page);
  const logAvailability = new LogAvailability(page);
  const testing = new Testing(page);
  const logTesting = new LogTesting(page);
  const menu = new MenuNavigation(page);
  const alzaOrderNumber = new AlzaOrderNumber(page);
  const packages = new Packages(page);
  const shipment = new Shipment(page);
  const tnt = new TntButtons(page);

  const modulePath = path.resolve(
    __dirname,
    "../assets/demoAlzaModul.zip"
  );

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await installModule.installModule(modulePath);
  await testConfigT010.setupTestConfiguration();

  //odeslání availability
  const availabilityStartTime = new Date();
  await page.goto(`${shop.eshopURL}${shop.availability}`);
  await availability.startAvailability();

  //otevření stránky chybové záznamy a ověření success availability
  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await menu.goToErrorLogs();
  await logAvailability.checkLogAvailability(availabilityStartTime);

  //spuštění test.php
  const testingStartTime = new Date();
  await page.goto(`${shop.eshopURL}${shop.testing}`);
  console.log(`Čas spuštění test.php: ${testingStartTime}`);

  //vyhodnocení jestli se zobrazuje požadovaný text - vytvoření objednávky
  await testing.startTesting();

  //otevření stránky chybové záznamy a ověření vytvoření objednávky
  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await menu.goToErrorLogs();
  const logOrderNumberAlza = await logTesting.checkLogTesting(testingStartTime)

  //stránka objednávek
  await menu.goToOrders();
  await expect(page).toHaveTitle(/Objednávky/);

  //ověření, že se čísla Alza objednávek shodují 
  const {firstOrderRow, orderAlzaText, orderAlzaNumber, orderAlzaTextTrim } = await alzaOrderNumber.findOrderNumber()
  expect(orderAlzaNumber).toBe(logOrderNumberAlza);
  console.log(
      `Čísla objednávky se shodují: logOrderNumberAlza (${logOrderNumberAlza}) a orderAlzaNumber (${orderAlzaNumber})`
    );
  await firstOrderRow.click();

  //zadání sledovácího čísla
  await page.locator("#orderShippingTab").click();
  await page.locator(".js-update-shipping-btn").click();
  await page
    .locator("#update_order_shipping_tracking_number")
    .fill("00222222225000000000000P");
  await page.locator("button.btn.btn-primary", { hasText: "Upravit" }).click();
  await page.waitForSelector("#main-div");
  const contentDiv = page.locator("#main-div");
  await expect(contentDiv).toContainText("Úspěšná aktualizace");
  console.log("Text 'Úspěšná aktualizace' nalezena.");
  await page.locator("li#subtab-AdminOrders").click();
  await page.waitForLoadState("networkidle");

  //vybrání poslední objednávky a generování zásilky přes hromadné akce
  await page.locator("td.bulk_action-type").nth(0).click();
  console.log("Označení poslední objednávky");
  await page.locator("button.js-bulk-actions-btn").click();
  await page.locator("text=Alza - Generovat zásilky").click();
  console.log("Generování zásilky");
  await page.waitForLoadState("networkidle");

  //vygenerovat balík
  await page.locator(".delete_package").nth(1).click();
  await page.locator(".move_to_package").nth(2).click();
  await page.locator("#generatePackages").click();

 
  //simulace chyby na stránce Balíky
  await page.pause();
  //znovu otevření stránky Balíky
  await menu.goToPackages();
  await expect(page).toHaveTitle(/Balíky/);
  
  //stránka balíky
  const { orderAlzaTextPackageTrim } = await packages.checkPackages(orderAlzaTextTrim);

  //simulace chyby na stránce Zásilky
  await page.pause();
  //znovu otevření stránky zásilek 
  await menu.goToShipments();
  await expect(page).toHaveTitle(/Zásilky/);

  //zásilky 
  await shipment.checkShipment({ orderAlzaTextPackageTrim, orderAlzaTextTrim });
  
  //otevření objednávek
  await menu.goToOrders();
  await expect(page).toHaveTitle(/Objednávky/);
  await firstOrderRow.click();

  //potvrzení Tnt tlačítek
  await tnt.confirmTntDepot();
  await tnt.confirmTntDelivery();
  await tnt.confirmTntDelivered();

  //otevření chybových záznamů a ověření dokončení scénáře
  await menu.goToErrorLogs();

  const successRow = page.locator("tr").filter({
    hasText: "The test case is completed successfully",
  }).first();

  await expect(successRow).toBeVisible(); 

  if (await successRow.count() > 0) {
    console.log("OK - Text: 'The test case is completed successfully' byl nalezen.");
    
    const successRowTime = await successRow.locator('td.column-date_add time').getAttribute('datetime');
    const successTime = new Date(successRowTime);

    console.log(`Čas záznamu v tabulce: ${successTime}`);
    console.log(`Čas spuštění test.php: ${testingStartTime}`);

    // Ověření, že se text zobrazuje až po spuštění test.php
    expect(successTime > testingStartTime).toBeTruthy();
    console.log("Záznam byl vytvořen po spuštění test.php.");
  } else {
    console.error("Chyba - Text: 'The test case is completed successfully' nebyl nalezen.");
  }


});
