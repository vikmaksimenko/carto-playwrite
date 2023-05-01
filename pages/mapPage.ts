import { test, expect } from '@playwright/test';
import { BasePage } from "./basePage";
import { MapSidebarComponent } from '../components/mapSidebarComponent';
import { MapComponent } from '../components/mapComponent';

export class MapPage extends BasePage {
    readonly sidebar: MapSidebarComponent = new MapSidebarComponent(this.page);
    readonly map: MapComponent = new MapComponent(this.page);

    async open() {
        await test.step('Open map', async () => {
            await this.page.goto('/map/information/info');
        });
    }

    async shouldBeVisible() {
        await this.map.shouldBeVisible();
    }

    async goToHomePage() {
        await test.step('Click the logo for getting back to the homepage.', async () => {
            await this.page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
        });
    }
}