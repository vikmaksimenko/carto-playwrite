import { expect, test } from '@playwright/test';
import { BaseComponent } from '../components/baseComponent';

export class MapComponent extends BaseComponent {
    async checkVisibility() {
        await test.step('Check that the map is visible', async () => {
            await expect(this.page.locator('#deckgl-overlay')).toBeVisible();
        });
    }

    async zoomIn(steps: number) {
        await test.step('Zoom in and check value', async () => {
            const increaseButtonEl = this.page.getByRole('button', { name: 'Increase zoom' });
            const zoomValueEl = increaseButtonEl.locator('xpath=./preceding-sibling::div/span');

            const initialZoomValue = await zoomValueEl.textContent();

            for(let i = 0; i < steps; i++) {
                await increaseButtonEl.click();
            }

            const updatedZoomValue = await zoomValueEl.textContent();

            expect(parseInt(initialZoomValue!) + steps).toEqual(parseInt(updatedZoomValue!));
        });
    }
}
