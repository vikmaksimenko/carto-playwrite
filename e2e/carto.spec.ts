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

        await expect(page.getByText('All selected')).toBeVisible({ timeout: 30 * 1000 });

        for (const key in data) {
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

    await test.step('Disable all the "HDOT Assets" (to be able to check in the map that all is working properly)', async () => {
        // Selects become available before the data is loaded completely. 
        // As result, the checkboxes we set might be reset by the app itself.
        // Looks like a bug to me, map settings should be disabled while info loading

        // The only way I found (beside the hardcoded wait) was to change steps order, 
        // open the HDOT Assets menu first and wait for all checkboxes to become available. 
        // However, it sould be great to have attribute or JS variable set when the data is loaded.
        await page.getByRole('button', { name: 'HDOT Assets', exact: true }).click();

        const menuEl = page.getByRole('menu').filter({has: page.getByRole('heading', { name: 'Configuration' })});
        const checkboxes = await menuEl.getByRole('checkbox').all();
        for(const checkbox of checkboxes) {
            await expect(checkbox).toBeEnabled({timeout: 60 * 1000});
        }

        await page.getByRole('button', { name: 'Unselect all' }).click();
        await menuEl.press('Escape');
    })

    await test.step('Enable the "Facilities and structure" layer (available on "More Layers")', async () => {
        await page.getByRole('button', { name: 'More Layers' }).click();
        await page.getByRole('listitem').filter({ hasText: 'Facilities and Structure' }).getByRole('checkbox').check();
        await page.getByText('Configuration').press('Escape');
    });

    await test.step('Open the Insights of Thematic indices', async () => {
        await page.getByRole('tab', { name: 'Thematic Indices' }).click();
        await page.getByRole('tab', { name: 'Insights' }).click();
    });

    await test.step('Check that the widget is visible and the data is correct', async () => {
        await expect(page.getByRole('region', { name: 'Facilities and Structures' })).toBeVisible();

        const widgetData = {
            "Pre-School": 493,
            "Fire Station": 101,
            "Police Station": 38,
        };

        await expect(page.getByText('All selected')).toBeVisible({ timeout: 30 * 1000 });

        for (const key in widgetData) {
            const assetEl = page.getByText(key, { exact: true });
            await expect(assetEl).toBeVisible();
            await expect(assetEl.locator('xpath=./following-sibling::span')).toHaveText(widgetData[key].toString());
        }
    });

    await test.step('Check that data properly showed in the map', async () => {
        await expect(page.locator('#deckgl-wrapper')).toHaveScreenshot();
    });

    await test.step('Zoom to the Honolulu island',async () => {

         // The starting coordinates for the mouse (approx. center of the Honolulu island)
        let startX = 750;
        let startY = 120;

        // The ending coordinates are the meedle of the canvas element
        const canvasBox = await page.$eval('#deckgl-overlay', (el) => el.getBoundingClientRect());
        const endX = canvasBox.left + (canvasBox.width / 2);
        const endY = canvasBox.top + (canvasBox.height / 2);

        await page.mouse.move(startX, startY, {steps: 5});
        await page.mouse.down();
        await page.mouse.move(endX, endY, {steps: 5});
        await page.mouse.up();    


        // Zooming 
        const increaseZoomEl = page.getByRole('button', { name: 'Increase zoom' });
        await increaseZoomEl.click();
        await increaseZoomEl.click();

        // Fine-tuning island position 
        startX = 750;
        startY = 250;

        await page.mouse.move(startX, startY, {steps: 5});
        await page.mouse.down();
        await page.mouse.move(endX, endY, {steps: 5});
        await page.mouse.up();    

        await expect(page.locator('#deckgl-wrapper')).toHaveScreenshot();
    });

    await test.step('Check that the widget values are adapted to the data shown for that zoom level.', async () => {
        await expect(page.getByRole('region', { name: 'Facilities and Structures' })).toBeVisible();

        const widgetData = {
            "Pre-School": 331,
            "Fire Station": 44,
            "Police Station": 11,
        };

        for (const key in widgetData) {
            await expect(page.locator(`xpath=//p[text() = "${key}"]/following-sibling::span[text()="${widgetData[key]}"]`)).toBeVisible();
        }
    });

    await test.step('Filter the data by selecting one of the 3 available facilities in the widget', async () => {
        await page.getByText('Police Station').click();
        await expect(page.getByText('1 selected')).toBeVisible();
    });

    await test.step('Check that all works as expected and that the map has applied the filter changes.', async () => {
        await expect(page.locator('#deckgl-wrapper')).toHaveScreenshot();
    });

    await test.step('Simulate the "hover" over one of the facilities in the map', async () => {
        await page.mouse.move(720, 350);;
    });

    await test.step('Check that the popup is shown with the proper information.', async () => {
        await expect(page.getByText('Name: Waianae Substation (Police Station)')).toBeVisible();
    });
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