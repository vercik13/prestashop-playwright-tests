import { test, expect } from "@playwright/test";
import path from "path";

/**
 *  Test kompatibility mezi demo modulem Produktový konfigurátor a modulem Parcelshop (PPL)
 * 
 * Tento test simuluje tři různé scénáře zapnutí/vypnutí výdejních míst (ParcelShop, ParcelBox, AlzaBox)
 * a ověřuje, že konfigurace v administraci PrestaShopu se správně promítá do výběru výdejních míst při dokončování objednávky.
 * 
 *  Scénář 1: Pouze ParcelShop (PBOX a ABOX jsou vypnuté)
 *   - Ověří, že se zobrazují pouze ParcelShop výdejní místa
 *   - Potvrdí, že PBOX a ABOX nejsou v nabídce
 *   - Dokončí objednávku s výběrem ParcelShop místa
 * 
 *  Scénář 2: Zapnuté ParcelBoxy, vypnuté AlzaBoxy
 *   - V konfiguraci modulu se povolí ParcelBoxy
 *   - Test ověří, že se zobrazují pouze PBOX výdejní místa
 *   - Potvrdí, že ABOX nejsou v nabídce
 *   - Dokončí objednávku s výběrem ParcelBox místa
 * 
 *  Scénář 3: Vypnuté ParcelBoxy, zapnuté AlzaBoxy
 *   - V konfiguraci se povolí ABOX a deaktivují PBOX
 *   - Test ověří, že se zobrazují pouze AlzaBox výdejní místa
 *   - Potvrdí, že ParcelBoxy nejsou k dispozici
 *   - Dokončí objednávku s výběrem AlzaBox místa
 * 
 */

test.setTimeout(500000);

const config = require("../../config.json");
const shop = config.shops["presta178-php74"];

const AdminLoginPage = require("../../page-objects/adminLoginPage");
const InstallModule = require("../../page-objects/installModule"); 
const AddToCart = require("../../page-objects/addToCart");
const SelectCountry = require("../../page-objects/selectCountry");
const WaitForRequest = require("../../page-objects/waitForRequest");
const Carrier = require("../../page-objects/carrier");
const Payment = require("../../page-objects/payment");
const SelectPrefix = require("../../page-objects/selectPrefix");
const OrderForm = require("../../page-objects/orderForm");
const OrderButton = require("../../page-objects/orderButton");
const MenuNavigation = require("../../page-objects/menuNavigation");
const OpenCartConfiguration = require("../../page-objects/openCartConfiguration");
const UninstallModule = require("../../page-objects/uninstallModule");

test("Kompatibilita s modulem Parcelshop", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const installModule = new InstallModule(page);
  const uninstallModule = new UninstallModule(page);
  const openConfiguration = new OpenCartConfiguration(page);
  const modulePath = path.resolve(
    __dirname,
    "../assets/productconfigurator.zip"
  );

  const moduleParcelshop = path.resolve(
    __dirname,
    "../assets/demoModuleParcelshop.zip"
  )
  const addToCart = new AddToCart(page);
  const selectCountry = new SelectCountry(page);
  const waitForRequest = new WaitForRequest(page);
  const payment = new Payment(page);
  const carrier = new Carrier(page);
  const selectPrefix = new SelectPrefix(page);
  const orderForm = new OrderForm(page);
  const orderButton = new OrderButton(page);
  const menu = new MenuNavigation(page);

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await page.waitForLoadState("networkidle"); 

  await installModule.installModule(modulePath);
  //po kliknutí na konfiguraci povolit dopravce
  await page.locator('tr:has(td.pointer.column-carrier:has-text("My carrier")) td.text-right a.edit').click();
  // Povolení možnosti "Enabled"
  await page.locator('#ps_wirepayment_on').click();
  await page.locator('#save_6').click();
  await page.waitForLoadState("networkidle"); 
  await page.pause();

  await installModule.installModule(moduleParcelshop);
  //nastavení dopravce v modulu Parcelshop
  await page.selectOption('select[name="dopravce_cz"]', { label: "My carrier" });
  const newVersion = page.locator('input[name="nova_verze"]').first();
  await newVersion.click();
  await page.click('button[name="submit_text"]');
  await page.waitForLoadState("networkidle");

  //nastaveno pouze na Parcelshopy (PBOX a ABOX se správně nemají zobrazit)
  //otevření Url produktu
  await page.goto(`${shop.productURL}`, { waitUntil: "networkidle" }); // Znovu načte stránku
  await addToCart.addToCart();
  await selectCountry.selectCountry();
  await waitForRequest.waitForAllRequestsFinished();
  await carrier.selectMyCarrier();
  await waitForRequest.waitForAllRequestsFinished();
  await page.waitForLoadState("networkidle");

  //zobrazení modalního okna - mapy pro výběr místa PPL 
  await page.waitForSelector('div.cc-popup.cc-show', { state: 'visible' });
  console.log('Modální okno je viditelné');

  //připojení k iframe
  const iframe = page.frameLocator('#ppl_parcelshop_iframe');
  await iframe.locator('body').waitFor({ state: "attached" });

  //zadání města do inputu PPL
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').click();
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').fill('Jiráskova Jihlava');
  await iframe.locator('div.control-panel__search-form-group-results-item').first().click();

  console.log("\n");
  console.log("Výchozí nastavení - ParcleBoxy a Alzaboxy jsou vypnuté, nabízet se mají jen ParcelShopy:")
  // čekání na zobrazení alespoň jednoho nadpisu
  await iframe.locator('span.result__item-title').first().waitFor({ state: 'visible', timeout: 10000 });

  //získání všech textů z výsledků
  const resultTexts = await iframe.locator('span.result__item-title').allTextContents();

  // filtr na texty obsahující "PBOX"
  const pboxTexts = resultTexts.filter(text => text.includes("PBOX"));
  if (pboxTexts.length > 0) {
    console.log(`Chyba - nalezeny položky s textem 'PBOX':`, pboxTexts);
  } else {
    console.log('OK - na stránce nebyly nalezeny žádné položky s textem PBOX');
  }

  // filtr na texty obsahující "ABOX"
  const aboxTexts = resultTexts.filter(text => text.includes("ABOX"));
  if (aboxTexts.length > 0) {
    console.log(`Chyba - nalezeny položky s textem 'ABOX':`, aboxTexts);
  } else {
    console.log('Ok - na stránce nebyly nalezeny žádné položky s textem ABOX');
  }

  // filtr pro ParcelShop
  await iframe.locator('.result__link').first().click();
  const controlPanelBox = iframe.locator('.control-panel__content');
  const textContent = await controlPanelBox.textContent();
  if (textContent.includes("ParcelShop")) {
    console.log("OK - Text 'ParcelShop' nalezen.");
  } else {
    console.log("Chyba - Text 'ParcelShop' nebyl nalezen.");
  }
  // potrvzení dopravce a dokončení objednávky
  await iframe.locator('button:has-text("Vybrat toto místo")').click();
  await payment.selectBankTransferPayment();
  await waitForRequest.waitForAllRequestsFinished();

  //vybrání prefix tel.
  await selectPrefix.selectPrefix();
  await waitForRequest.waitForAllRequestsFinished();
  //vyplnění formuláře
  await orderForm.fillForm();
  await waitForRequest.waitForAllRequestsFinished();
  //odeslání objednávky
  await orderButton.clickOrderButton();
  await page.pause();


  console.log("\n");
  console.log("ParcleBoxy jsou zapnuté, Alzaboxy vypnuté:")
  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await menu.goToModuleManager();
  await openConfiguration.goToParcelshopConfiguration();

  await page.locator('#zobrazit_parcelbox_on').click();
  console.log("V konfiguraci Povolit Parcelboxy - volba 'ANO' byla povolena.");

  await page.locator('button[name="submit_text"]').click();
  await page.waitForLoadState("networkidle");


  //otevření Url produktu
  await page.goto(`${shop.productURL}`, { waitUntil: "networkidle" }); // Znovu načte stránku
  await addToCart.addToCart();
  //vybrání země
  await selectCountry.selectCountry();
  await waitForRequest.waitForAllRequestsFinished();
  //vybrání dopravce My carrier
  await carrier.selectMyCarrier();
  await waitForRequest.waitForAllRequestsFinished();
  await page.waitForLoadState("networkidle");

  //zobrazení modalního okna - mapy pro výběr místa PPL 
  await page.waitForSelector('div.cc-popup.cc-show', { state: 'visible' });
  console.log('Modální okno je viditelné');

 
  //připojení k iframe
  //const iframe = page.frameLocator('#ppl_parcelshop_iframe');
  await iframe.locator('body').waitFor({ state: "attached" });

  //zadání města do inputu PPL
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').click();
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').fill('Jiráskova Jihlava');
  await iframe.locator('div.control-panel__search-form-group-results-item').first().click();

  // Čekání na zobrazení alespoň jednoho nadpisu
  await iframe.locator('span.result__item-title').first().waitFor({ state: 'visible', timeout: 10000 });

  // Získání všech textů z výsledků
  const pboxResultTexts = await iframe.locator('span.result__item-title').allTextContents();

  // Filtr na texty obsahující "PBOX"
  const onPboxTexts = pboxResultTexts.filter(text => text.includes("PBOX"));
  if (onPboxTexts.length > 0) {
    console.log(`OK - nalezeny položky s textem 'PBOX':`, onPboxTexts);
  } else {
    console.log('Chyba - na stránce nebyly nalezeny žádné položky s textem PBOX');
  }

  // Filtr na texty obsahující "ABOX"
  const offAboxTexts = pboxResultTexts.filter(text => text.includes("ABOX"));
  if (offAboxTexts.length > 0) {
    console.log(`Chyba - nalezeny položky s textem 'ABOX':`, offAboxTexts);
  } else {
    console.log('Ok - na stránce nebyly nalezeny žádné položky s textem ABOX');
  }

  //kliknutí na první nalezený PBOX
  await iframe.locator('.result__link').first().click();
  //dokončení objednávky
  await iframe.locator('button:has-text("Vybrat toto místo")').click();
  await payment.selectBankTransferPayment();
  await waitForRequest.waitForAllRequestsFinished();

  //vybrání prefix tel.
  await selectPrefix.selectPrefix();
  await waitForRequest.waitForAllRequestsFinished();
  //vyplnění formuláře
  await orderForm.fillForm();
  await waitForRequest.waitForAllRequestsFinished();
  //odeslání objednávky
  await orderButton.clickOrderButton();
  await page.pause();

  console.log("\n");
  console.log("ParcelBoxy jsou vypnuté, AlzaBoxy jsou zapnuté: ")
  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await menu.goToModuleManager();
  await openConfiguration.goToParcelConfiguration();
  //vypnutí parcelboxů
  await page.locator('#zobrazit_parcelbox_off').click();
  console.log("V konfiguraci Povolit Parcelboxy - volba byla vypnuta - nastaveno volba 'NE'.");
  //zapnutí Alzaboxů
  await page.locator('#zobrazit_alzabox_on').click();
  console.log('V konfiguraci "Zobrazit Alzalboxy" - volba byla zapnuta - nastaveno volba "ANO"')
  await page.locator('button[name="submit_text"]').click();
  await page.waitForLoadState("networkidle");

  //simulace chyby - povolení parcelboxu
  await page.pause();
  //otevření Url produktu
  await page.goto(`${shop.productURL}`, { waitUntil: "networkidle" }); // Znovu načte stránku
  await addToCart.addToCart();
  //vybrání země
  await selectCountry.selectCountry();
  await waitForRequest.waitForAllRequestsFinished();
  //vybrání dopravce My carrier
  await carrier.selectMyCarrier();
  await waitForRequest.waitForAllRequestsFinished();
  await page.waitForLoadState("networkidle");

  //zobrazení modalního okna - mapy pro výběr místa PPL 
  await page.waitForSelector('div.cc-popup.cc-show', { state: 'visible' });
  console.log('Modální okno je viditelné');

  //zadání města do inputu PPL
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').click();
  await iframe.locator('input[placeholder="Hledejte město, ulici nebo PSČ"]').fill('Jiráskova Jihlava');
  await iframe.locator('div.control-panel__search-form-group-results-item').first().click();

  // Čekání na zobrazení alespoň jednoho nadpisu
  await iframe.locator('span.result__item-title').first().waitFor({ state: 'visible', timeout: 10000 });

  // Získání všech textů z výsledků
  const aboxResultTexts = await iframe.locator('span.result__item-title').allTextContents();

  // Filtr na texty obsahující "PBOX"
  const offPboxTexts = aboxResultTexts.filter(text => text.includes("PBOX"));
  if (offPboxTexts.length > 0) {
    console.log(`Chyba - nalezeny položky s textem 'PBOX':`, offPboxTexts);
  } else {
    console.log('OK - na stránce nebyly nalezeny žádné položky s textem PBOX');
  }

  // Filtr na texty obsahující "ABOX"
  const onAboxTexts = aboxResultTexts.filter(text => text.includes("ABOX"));
  if (onAboxTexts.length > 0) {
    console.log(`OK - nalezeny položky s textem 'ABOX':`, onAboxTexts);
  } else {
    console.log('Chyba - na stránce nebyly nalezeny žádné položky s textem ABOX');
  }

  //kliknutí na první nalezený ABOX
  await iframe.locator('.result__link').first().click();
  //dokončení objednávky
  await iframe.locator('button:has-text("Vybrat toto místo")').click();
  await payment.selectBankTransferPayment();
  await waitForRequest.waitForAllRequestsFinished();

  //vybrání prefix tel.
  await selectPrefix.selectPrefix();
  await waitForRequest.waitForAllRequestsFinished();
  //vyplnění formuláře
  await orderForm.fillForm();
  await waitForRequest.waitForAllRequestsFinished();
  //odeslání objednávky
  await orderButton.clickOrderButton();
  await page.pause();

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  console.log("Odinstalování modulu: ")
  await uninstallModule.uninstallModule(modulePath);

});