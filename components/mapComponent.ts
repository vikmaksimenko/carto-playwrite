import { Locator, expect, test } from '@playwright/test';
import { BaseComponent } from '../components/baseComponent';
import { SimpleCoordinates } from '../data/simpleCoordinates';

export class MapComponent extends BaseComponent {
    private readonly canvasLocator = '#deckgl-overlay';
    private readonly canvasWrapper = '#deckgl-wrapper';


    async shouldBeVisible() {
        await test.step('Check that the map is visible', async () => {
            await expect(this.page.locator(this.canvasLocator)).toBeVisible();
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

            await expect(parseInt(initialZoomValue!) + steps).toEqual(parseInt(updatedZoomValue!));
        });
    }

    async checkControlToBeHidden(name: string) {
        await test.step(`Check the button related to the ${name} is hidden`, async () => {
            await expect(this.getConfigButtonLocatorFor(name)).toBeHidden();
        })
    }

    async openConfiguration(name: string) {
        await test.step(`Open ${name} configuration`, async () => {
            await this.getConfigButtonLocatorFor(name).click();
        })
    }

    async checkMapScreenshot(screenshot: string) {
        await test.step('Check that data properly showed in the map', async () => {
            await expect(this.page.locator(this.canvasWrapper)).toHaveScreenshot(screenshot);
        });
    }

    async getCanvasCenter(): Promise<SimpleCoordinates> {
        const canvasBox = await this.page.$eval(this.canvasLocator, (el) => el.getBoundingClientRect());
        return new SimpleCoordinates(
            canvasBox.left + (canvasBox.width / 2),
            canvasBox.top + (canvasBox.height / 2)
        );
    }

    async moveMap(start: SimpleCoordinates, end: SimpleCoordinates) {
        await test.step(`Move map by coordinates from ${JSON.stringify(start)} to ${JSON.stringify(end)}`, async () => {
            await this.page.mouse.move(start.x, start.y, { steps: 5 });
            await this.page.mouse.down();
            await this.page.mouse.move(end.x, end.y, { steps: 5 });
            await this.page.mouse.up();
        });
    }

    async hoverOverMap(position: SimpleCoordinates) {
        await test.step(`Simulate the "hover" over the position ${JSON.stringify(position)}`, async () => {
            await this.page.mouse.move(position.x, position.y);
        });
    }

    async checkMapPopup(text: string) {
        await test.step(`Check that the popup is shown with text "${text}"`, async () => {
            await expect(this.page.getByText(text)).toBeVisible();
        });
    }

    private getConfigButtonLocatorFor(name: string): Locator {
        return this.page.getByRole('button', { name: name, exact: true });
    }
}
