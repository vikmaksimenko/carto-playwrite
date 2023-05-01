import { test, expect } from '@playwright/test';
import { BasePage } from "./basePage";
import { MapSidebarComponent } from '../components/mapSidebarComponent';

export class MapPage extends BasePage {
    readonly sidebar: MapSidebarComponent = new MapSidebarComponent(this.page);

    async open() {
        throw new Error('Method not implemented.');
    }

    async checkMapVisibility() {
        await test.step('Check that the map is visible', async () => {
            await expect(this.page.locator('#deckgl-overlay')).toBeVisible();
        });
    }

}