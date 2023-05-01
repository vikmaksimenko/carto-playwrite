import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { MapPage } from '../pages/mapPage';
import { MapSidebarWidgetComponent } from '../components/mapSidebarWidgetComponent';
import { ApiUtils } from '../utils/apiUtils';

test('Test 1. Open map and validate info', async ({ page, baseURL }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.navigateToMap();

    const mapPage = new MapPage(page);
    await mapPage.checkMapVisibility();

    await mapPage.sidebar.checkPanelSectionName('Introduction');
    const information = await new ApiUtils(page.request).getInformation();
    const info = information['info'];
    expect(info).toBeTruthy();
    await mapPage.sidebar.validateSectionInfo(info);

    // I was not able to find a propper way to request the test data 
    // so I compare the actual data with the static values. 
    // However, this test may be false-negative and potentially will require a lot of maintenance, 
    // becase the data my change.
    // Also, the numbers differ on different browser window size.
    // Ideally, the data for comparison should be taken from the source service 
    // and compared with actual one. 
    const widgetData = {
        "Bridge": 370,
        "Roadway": 330,
        "Culvert": 68,
        "Tunnel": 6
    };

    const mapWidget = new MapSidebarWidgetComponent(page, 'HDOT Assets by Type');
    await mapWidget.shouldBeVisible();
    await mapWidget.waitForDataLoaded();
    await mapWidget.validateData(widgetData);
});

// test('Test 4. Main page navigation', async ({ page, baseURL }) => {
//     class TabInfo {
//         tabName: string;
//         sectionName: string;
//         id: string;

//         constructor(tabName: string, sectionName: string, id: string) {
//             this.tabName = tabName;
//             this.sectionName = sectionName;
//             this.id = id;
//         }
//     }

//     const tabs = [
//         new TabInfo('Climate resilience', 'Climate resilience', 'climate-resilience'),
//         // There are two elements with id = action-plan, which make HTML invalid
//         new TabInfo('Action Plan', 'The HDOT Action Plan', 'action-plan'),
//         new TabInfo('Climate stressor', 'Climate stressor', 'climate-stressor'),
//         new TabInfo('The Urgency', 'The Urgency', 'the-urgency'),
//         new TabInfo('HDOT Map', 'HDOT Asset and Hazard Map', 'explore-map'),
//         new TabInfo('Map components', 'Map components', 'map-components'),
//     ]

//     const goToTab = async (tab: TabInfo) => {
//         await page.getByRole('tab', { name: tab.tabName }).click();

//         const section = page.locator(`#${tab.id}.MuiGrid-root`);
//         await expect(section).toBeInViewport();
//         await expect(section.getByRole('heading').first()).toHaveText(tab.sectionName);
//     }

//     await test.step(`Load the page ${baseURL}`, async () => {
//         await page.goto('/');
//     });

//     await test.step(`Use the navigation bar to go to each entry and check that secction name is propper`, async () => {
//         for (const tab of tabs) {
//             await goToTab(tab)

//             // Somehow `await page.evaluate(() => window.scrollTo(0, 0));` does not work, 
//             // so I decided to go to the top with click on logo 
//             await page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
//             await expect(page.locator('#back-to-top-anchor')).toBeInViewport();
//         }

//     });

//     await test.step('Go to the first section again and then directly to the second one', async () => {
//         await goToTab(tabs[0]);
//         await goToTab(tabs[1]);
//     });

//     await test.step('Go to the "Explore Map" section', async () => {
//         await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
//         await expect(page.locator('#deckgl-overlay')).toBeVisible({ timeout: 30 * 1000 });
//     });

//     await test.step('If we click the logo, we get back to the homepage.', async () => {
//         await page.locator('a').filter({ hasText: 'Hawai\'i HighwaysClimate Insights for Infrastructure' }).click();
//         await expect(await page.locator('#explore-map')).toBeVisible();
//     });

//     await test.step('Go back to the map ', async () => {
//         await page.locator('#explore-map').getByRole('button', { name: 'Explore map' }).click();
//         await expect(page.locator('#deckgl-overlay')).toBeVisible();
//     });

//     await test.step('If we click the map\'s zoom, the number (zoom level) should be appropriately updated', async () => {
//         const increaseButtonEl = page.getByRole('button', { name: 'Increase zoom' });
//         const zoomValueEl = increaseButtonEl.locator('xpath=./preceding-sibling::div/span');

//         const initialZoomValue = await zoomValueEl.textContent();
//         await increaseButtonEl.click();
//         const updatedZoomValue = await zoomValueEl.textContent();

//         expect(parseInt(initialZoomValue!) + 1).toEqual(parseInt(updatedZoomValue!));
//     });
// });