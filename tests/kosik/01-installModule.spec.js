import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Test ověřuje instalaci modulu v administraci eshopu Prestashop.
 * 
 * Postup testu:
 * - Přihlášení do administrace eshopu.
 * - Instalace modulu ze zadaného ZIP souboru.
 * 
 * Cílem je zajistit, že instalace modulu proběhne bez chyb.
 */


test.setTimeout(120000);

const config = require("../../config.json");
const shop = config.shops["presta178-php74"];
const AdminLoginPage = require("../../page-objects/adminLoginPage");
const InstallModule = require("../../page-objects/installModule");

test("Instalace modulu", async ({ page }) => {
  const adminLoginPage = new AdminLoginPage(page);
  const installModule = new InstallModule(page);
  const modulePath = path.resolve(
    __dirname,
    "../assets/productconfigurator.zip"
  );

  await page.goto(`${shop.adminURL}`);
  await adminLoginPage.login(shop.admin.email, shop.admin.password);
  await installModule.installModule(modulePath);
});
