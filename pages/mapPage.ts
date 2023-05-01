import { test, expect } from '@playwright/test';
import { BasePage } from "./basePage";
import { MapSidebarComponent } from '../components/mapSidebarComponent';
import { MapComponent } from '../components/mapComponent';

export class MapPage extends BasePage {
    readonly sidebar: MapSidebarComponent = new MapSidebarComponent(this.page);
    readonly map: MapComponent = new MapComponent(this.page);

    async open() {
        throw new Error('Method not implemented.');
    }

    async goToHomePage() {
        await test.step('Click the logo for getting back to the homepage.', async () => {
            await this.page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
        });
    }
}