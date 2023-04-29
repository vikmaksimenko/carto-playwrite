import { test, expect } from '@playwright/test';

test('Test 1. Open map and validate info', async ({ page }) => {
    await page.goto('/');

    await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
    await expect(page.locator('#deckgl-overlay')).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
    // TODO: Find a way to check Introduction content

    // TODO: The widget of data showed in the map

});

test('Test 2. The app should hide the button to configure the failing dataset', async ({ page }) => {

    await page.route('**/data/datasets.json', async route => {
        const response = await route.fetch();
        const body = await response.text();

        let json = JSON.parse(body);
        delete json.commons.index;

        route.fulfill({
            json: json
        });
    });


    await page.goto('https://climate-resilience.hidot.hawaii.gov/map/information/info');

    await expect(page.locator('#deckgl-overlay')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Thematic Indices' })).toBeHidden();
});