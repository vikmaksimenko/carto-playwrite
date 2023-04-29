import { test, expect } from '@playwright/test';

test('Test 1. Open map and validate info', async ({ page, baseURL, request }) => {
    await test.step(`Load the page ${baseURL}`, async () => {
        await page.goto('/');
    });

    await test.step('Navigate to the map', async () => {
        await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
    });

    await test.step('Check that the map is visible', async () => {
        await expect(page.locator('#deckgl-overlay')).toBeVisible();
    });

    await test.step(`Check the default information shown in the left panel 
        is the "Introduction" with the appropriate content`, async () => {
        await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible();

        const response = await page.request.get('/data/information.json');
        const body = await response.json();
        const info = body['info'];
        expect(info).toBeTruthy();

        const sectionValidations = {
            image: async (data) => {
                // The image src is not checked, because it's changed on the server
                const imageEl = page.getByRole('img', { name: data['alt'] });
                await expect(imageEl).toBeVisible();
                await expect(imageEl.locator('xpath=./following-sibling::span[contains(@class, "caption")]')).toHaveText(data['caption'].toString());
            },
            title: async (title) => {
                await expect(page.getByRole('heading', { name: title })).toBeVisible();
            },
            userInfo: async (data) => {
                await expect(page.getByRole('heading', { name: data['name'] })).toBeVisible();
                await expect(page.getByRole('img', { name: data['name'] })).toBeVisible();
                await expect(page.getByText(data['position'])).toBeVisible();
            },
            info: async (text) => {
                await expect(page.getByText(text)).toBeVisible();
            },
            widget: async (data) => {
                await expect(page.getByRole('button', { name: data['title'] })).toBeVisible();
            },
            nextHazard: async (data) => {
                const next = page.locator(`//a[contains(@href, "${data['toRoute']}")]`);
                await expect(next.filter({ has: page.getByRole('heading', { name: 'Next' }) })).toBeVisible();
                await expect(next.filter({ has: page.getByRole('heading', { name: data['title'] }) })).toBeVisible();
            },
            footer: async () => {
                // Leaving empty as it's not clear how to test footer
            }
        };

        for (const infoIndex in info) {
            // I do not validate sections order, because they are not in the same DOM element (footer is different)
            const infoSection = info[infoIndex];
            for (const widget in infoSection) {
                const validation = sectionValidations[widget];
                expect(validation).toBeTruthy();
                await validation(infoSection[widget]);
            }
        }
    });

    await test.step('Check the widget of data showed in the map', async () => {
        // I was not able to find a propper way to request the test data 
        // so I compare the actual data with the static values. 
        // However, this test may be false-negative and potentially will require a lot of maintenance, 
        // becase the data my change.
        // Also, the numbers differ on different browser window size.
        // Ideally, the data for comparison should be taken from the source service 
        // and compared with actual one. 

        const data = {
            "Bridge": 370,
            "Roadway": 330, 
            "Culvert": 68,
            "Tunnel": 6
        };

        await expect(page.getByText('All selected')).toBeVisible({timeout: 30 * 1000});

        for(const key in data) {
            const assetEl = page.getByText(key, { exact: true });
            await expect(assetEl).toBeVisible();
            await expect(assetEl.locator('xpath=./following-sibling::span')).toHaveText(data[key].toString());
        }
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

test('Test 3. Check that the "Facilities and structure" layer shows the correct data and is working correctly', async ({ page }) => {
    await test.step('Open map', async () => {
        await page.goto('https://climate-resilience.hidot.hawaii.gov/map/information/info');
        await expect(page.locator('#deckgl-overlay')).toBeVisible();
    });

    await test.step('Enable the "Facilities and structure" layer (available on "More Layers")', async () => {
        await page.getByRole('button', { name: 'More Layers' }).click();
        await page.getByRole('listitem').filter({ hasText: 'Facilities and Structure' }).getByRole('checkbox').check();
        await page.getByText('Configuration').press('Escape');
    });

    await test.step('Disable all the "HDOT Assets" (to be able to check in the map that all is working properly)', async () => {
        await page.getByRole('button', { name: 'HDOT Assets', exact: true }).click();
        await page.getByRole('button', { name: 'Unselect all' }).click();
        await page.getByRole('button', { name: 'HDOT Assets', exact: true }).click();
    })


    await test.step('Open the Insights of Thematic indices', async () => {
        await page.getByRole('tab', { name: 'Thematic Indices' }).click();
        await page.getByRole('tab', { name: 'Insights' }).click();
    })

    await test.step('Check that the widget is visible and the data is correct and properly showed in the map', async () => {
        await expect(page.getByRole('region', { name: 'Facilities and Structures' })).toBeVisible();

        // TODO: and the data is correct 

        // TODO: and properly showed in the map
    });

    // Then, you should zoom to the Honolulu island 

    // check that the widget values are adapted to the data shown for that zoom level.

    // filter the data by selecting one of the 3 available facilities in the widget 
    // check that all works as expected and that the map has applied the filter changes.

    // simulate the "hover" over one of the facilities in the map 
    // check that the popup is shown with the proper information.

});

test('Test 4. Main page navigation', async ({ page, baseURL }) => {
    await test.step(`Load the page ${baseURL}`, async () => {
        await page.goto('/');
    });

    //  use the navigation bar to go to each entry going back to the start of the page between navigating to each section. 
    // You should check that the section's name is the proper one when navigating it.

    // After that, the test should go to the first section again and then directly to the second one.

    // After that, we should go to the "Explore Map" section 
    // check that, if we click the logo, we get back to the homepage. 

    // Also, we would like to go back to the map 
    // check that, if we click the map's zoom, the number (zoom level) is appropriately updated.
});