import { Locator, Page, expect } from '@playwright/test';
import { BaseComponent } from '../components/baseComponent';

export class MapSidebarWidgetComponent extends BaseComponent {
    private root: Locator;

    constructor(page: Page, name: string) {
        super(page);
        this.root = page.getByRole('region', { name: name });
    }

    async shouldBeVisible() {
        await expect(this.root).toBeVisible();
    }

    async waitForDataLoaded() {
        await expect(this.root.getByText('All selected')).toBeVisible({ timeout: 60 * 1000 });
    }

    async validateData(data: object) {
        for (const key in data) {
            await expect(this.root.getByText(key, { exact: true })).toBeVisible();
            await expect(this.root.locator(`xpath=//p[text() = "${key}"]/following-sibling::span[text()="${data[key]}"]`)).toBeVisible();
        }
    }
}