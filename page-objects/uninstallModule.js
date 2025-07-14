import { test, expect } from "@playwright/test";
import path from "path";

class UninstallModule {
  constructor(page) {
    this.page = page;
  }

  async uninstallModule(modulePath) {
    await this.page.getByRole("link", { name: "extension Moduly" }).waitFor();
    await this.page.getByRole("link", { name: "extension Moduly" }).click();
    await this.page.getByRole("link", { name: "Správce modulu" }).click();
    await this.page.waitForSelector(".pstaggerAddTagInput");
    await this.page.click(".pstaggerAddTagInput");
    await this.page.fill(".pstaggerAddTagInput", "košík");
    await this.page.press(".pstaggerAddTagInput", "Enter");

    const moduleName = await this.page
      .locator("h3.module-name-list", { hasText: "Košík" })
      .innerText();
    expect(moduleName).toContain("Košík");
    
    await this.page.click(`.module-item[data-tech-name="cart"] .dropdown-toggle`);
    await this.page.click(`.module-item[data-tech-name="cart"] .module_action_menu_uninstall`);

    const modal = this.page.locator('#module-modal-confirm-cart-uninstall');
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    console.log('OK - Modální okno je viditelné');

    const checkbox = modal.locator('input#force_deletion');
    await checkbox.waitFor({ state: 'attached', timeout: 3000 });
    console.log('OK - Checkbox nalezen');

    await checkbox.check();
    console.log('OK - Checkbox zaškrtnut');

    const isChecked = await checkbox.isChecked();
    console.log(`OK - Checkbox je zaškrtnutý: ${isChecked}`);
    expect(isChecked).toBeTruthy();

    await modal.locator('.module_action_modal_uninstall').click();
    console.log('OK - Kliknuto na "Ano, odinstalovat"');


    // zobrazení notifikace
    const notification = this.page.locator('.growl-message', { hasText: 'Akce Uninstall v modulu cart proběhla úspěšně.' });
    await notification.waitFor({ state: 'visible', timeout: 5000 });

    // ověření hlášky
    const messageText = await notification.innerText();
    expect(messageText).toContain('Akce Uninstall v modulu cart proběhla úspěšně');
    console.log("OK - Notifikace o odinstalaci se zobrazuje.");
    }
  }
module.exports = UninstallModule;