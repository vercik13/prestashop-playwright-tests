import { test, expect } from "@playwright/test";

class TntButtons {
    constructor(page) {
        this.page = page;
    }

    async confirmTntDepot() {
        this.page.once('dialog', async (dialog) => {
            //console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        const tntDepot = this.page.locator('a.btn.btn-primary', { hasText: 'Doručeno na depo' });
        await expect(tntDepot).toBeVisible();
        await tntDepot.click();
    }

    async confirmTntDelivery() {
        this.page.once('dialog', async (dialog) => {
            //console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        const tntDelivery = this.page.locator('a.btn.btn-primary', { hasText: 'Dokončit doručení' });
        await expect(tntDelivery).toBeVisible();
        await tntDelivery.click();
    }

    async confirmTntDelivered() {
        this.page.once('dialog', async (dialog) => {
            //console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        const tntDelivered = this.page.locator('a.btn.btn-primary', { hasText: 'Doručeno na cílovou adresu' });
        await expect(tntDelivered).toBeVisible();
        await tntDelivered.click();
    }
}

module.exports = TntButtons;