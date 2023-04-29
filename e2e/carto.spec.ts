import { test, expect } from '@playwright/test';

test('Test 1. Open map and validate info', async ({ page, baseURL }) => {
    await test.step(`Load the page ${baseURL}`, async () => {
        await page.goto('/');
    });

    await test.step('Navigate to the map', async () => {
        await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
    });

    await test.step('Check that the map is visible', async () => {
        await expect(page.locator('#deckgl-overlay')).toBeVisible();
    });

    await test.step('Check the default information shown in the left panel is the "Introduction" with the appropriate content', async () => {
        await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();
        // TODO: check that the content is "appropriate" ???
    });

    await test.step('Check the widget of data showed in the map', async () => {
        // TODO
    });
});

test('Test 2. The app should hide the button to configure the failing dataset', async ({ page }) => {
    await test.step('On /data/datasets.json request, remove index from response body', async () => {
        await page.route('**/data/datasets.json', async route => {
            const response = await route.fetch();
            const body = await response.text();

            let json = JSON.parse(body);
            delete json.commons.index;

            route.fulfill({
                json: json
            });
        });
    })

    await test.step('Open map', async () => {
        await page.goto('https://climate-resilience.hidot.hawaii.gov/map/information/info');
        await expect(page.locator('#deckgl-overlay')).toBeVisible();
    });

    await test.step('The map should hide the button related to the Indices', async () => {
        await expect(page.getByRole('button', { name: 'Thematic Indices' })).toBeHidden();
    })
});
