import { Locator, Page, expect, test } from '@playwright/test';
import { BaseComponent } from './baseComponent';

export class MapConfigurationComponent extends BaseComponent {
    private root = this.page.getByRole('menu').filter({ has: this.page.getByRole('heading', { name: 'Configuration' }) });

    async shouldBeVisible() {
        await test.step('Map configuraton menu should be visible', async () => {
            await expect(this.root).toBeVisible();
        })
    }

    async waitForAllCheckboxesToBecomeEnabled() {
        await test.step('Wait for checkboxes to become enabled', async () => {
            const checkboxes = await this.root.getByRole('checkbox').all();
            for (const checkbox of checkboxes) {
                await expect(checkbox).toBeEnabled({ timeout: 60 * 1000 });
            }
        })
    }

    async checkOption(name: string) {
        await test.step(`Check option ${name}`, async () => {
            await this.root.getByRole('listitem').filter({ hasText: name }).getByRole('checkbox').check();
        })
    }

    async unselectAllCheckboxes() {
        await test.step('Unselect all checkboxes', async () => {
            await this.root.getByRole('button', { name: 'Unselect all' }).click();
        })
    }

    async closeConfigMenu() {
        await test.step('Close configuration menu', async () => {
            await this.root.press('Escape');;
        })
    }
}
