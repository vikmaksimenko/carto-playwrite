import { test } from '@playwright/test';
import { BasePage } from "./basePage";

export class HomePage extends BasePage {
    async open() {
        await test.step(`Load the main page`, async () => {
            await this.page.goto('/');
        });
    }

    async navigateToMap() {
        await test.step('Navigate to the map', async () => {
            await this.page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
        }); 
    }
}