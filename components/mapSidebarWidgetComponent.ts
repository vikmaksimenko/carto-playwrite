import { Locator, Page, expect, test } from '@playwright/test';
import { BaseComponent } from '../components/baseComponent';

export class MapSidebarWidgetComponent extends BaseComponent {
    private root: Locator;

    constructor(page: Page, name: string) {
        super(page);
        this.root = page.getByRole('region', { name: name });
    }

    async shouldBeVisible() {
        await test.step('Sidebar widget should be visible', async () => {
            await expect(this.root).toBeVisible();
        });
    }

    async waitForDataLoaded() {
        await test.step('Wait for data loaded', async () => {
            await expect(this.root.getByText('All selected')).toBeVisible({ timeout: 60 * 1000 });
        });
    }

    async validateData(data: object) {
        await test.step('Validate widget data', async () => {
            for (const key in data) {
                await expect(this.root.getByText(key, { exact: true })).toBeVisible();
                await expect(this.root.locator(`xpath=//p[text() = "${key}"]/following-sibling::span[text()="${data[key]}"]`)).toBeVisible();
            }
        });
    }

    async filterBy(name: string, message: string) {
        await test.step(`Filter the data by ${name}`, async () => {
            await this.page.getByText(name).click();
            await expect(this.page.getByText(message)).toBeVisible();
        });
    }
}