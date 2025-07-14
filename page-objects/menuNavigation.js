import { test, expect } from "@playwright/test";

class MenuNavigation {
    constructor(page) {
      this.page = page;
    }

    async goToErrorLogs() {
      const toolsMenu = this.page.locator('#subtab-AdminAdvancedParameters > a');
      await toolsMenu.click();

      await this.page.waitForSelector('#collapse-92');

      const errorLogsMenu = this.page.locator('#subtab-AdminLogs > a');
      await errorLogsMenu.click();
      await this.page.waitForLoadState('networkidle');
  }
  
    async goToPackages() {
      const packagesMenu = this.page.locator('#subtab-AdminAlzaPackagesList > a');
      await packagesMenu.click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async goToShipments() {
      const shipmentsMenu = this.page.locator('#subtab-AdminAlzaShipments > a');
      await shipmentsMenu.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForLoadState('networkidle');
    }
  
    async goToOrders() {
      const ordersMenu = this.page.locator('#subtab-AdminParentOrders > a');
      await ordersMenu.click();
      // Otevření podmenu a kliknutí na "Objednávky"
      const ordersSubmenu = this.page.locator('#subtab-AdminOrders > a');
      await ordersSubmenu.click();
      await this.page.waitForLoadState('networkidle');
    }

    async goToModuleManager() {
      const moduleMenu = this.page.locator('#subtab-AdminParentModulesSf > a');
      await moduleMenu.click()
    }
  }

  module.exports = MenuNavigation;
  