import { expect, test } from '@playwright/test';
import { BasePage } from "./basePage";
import { TabInfo } from '../data/tabInfo';

export class HomePage extends BasePage {
    async open() {
        await test.step(`Load the main page`, async () => {
            await this.page.goto('/');
        });
    }

    async shouldBeOpened() {
        await test.step('Main page should be opened', async () => {
            await expect(this.page.locator('#explore-map')).toBeVisible();
        });
    }

    async navigateToMap() {
        await test.step('Navigate to the map', async () => {
            await this.page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
        });
    }

    async goToTab(tab: TabInfo) {
        await test.step(`Go to tab ${tab.tabName} and check it's opened`, async () => {
            await this.page.getByRole('tab', { name: tab.tabName }).click();

            const section = this.page.locator(`#${tab.id}.MuiGrid-root`);
            await expect(section).toBeInViewport();
            await expect(section.getByRole('heading').first()).toHaveText(tab.sectionName);
        });
    }

    async goToTop() {
        await test.step('Go to page top', async () => {
            // Somehow `await page.evaluate(() => window.scrollTo(0, 0));` does not work, 
            // so I decided to go to the top with click on logo 
            await this.page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
            await expect(this.page.locator('#back-to-top-anchor')).toBeInViewport();
        });
    }
}