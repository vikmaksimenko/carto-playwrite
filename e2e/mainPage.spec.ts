import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { MapPage } from '../pages/mapPage';
import { MapSidebarWidgetComponent } from '../components/mapSidebarWidgetComponent';
import { ApiUtils } from '../utils/apiUtils';
import { TabInfo } from '../data/tabInfo';

test.describe('Main page tests', () => {

    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.open();
    });

    test('Test 1. Open map and validate info', async ({ page }) => {
        await homePage.navigateToMap();

        const mapPage = new MapPage(page);
        await mapPage.map.checkVisibility();

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

    test('Test 4. Main page navigation', async ({ page, baseURL }) => {
        const tabs = [
            new TabInfo('Climate resilience', 'Climate resilience', 'climate-resilience'),
            // There are two elements with id = action-plan, which make HTML invalid
            new TabInfo('Action Plan', 'The HDOT Action Plan', 'action-plan'),
            new TabInfo('Climate stressor', 'Climate stressor', 'climate-stressor'),
            new TabInfo('The Urgency', 'The Urgency', 'the-urgency'),
            new TabInfo('HDOT Map', 'HDOT Asset and Hazard Map', 'explore-map'),
            new TabInfo('Map components', 'Map components', 'map-components'),
        ]

        await test.step(`Use the navigation bar to go to each entry and check that secction name is propper`, async () => {
            for (const tab of tabs) {
                await homePage.goToTab(tab)
                await homePage.goToTop();
            }
        });

        await test.step('Go to the first section again and then directly to the second one', async () => {
            await homePage.goToTab(tabs[0]);
            await homePage.goToTab(tabs[1]);
        });

        await homePage.navigateToMap();
        const mapPage = new MapPage(page);
        await mapPage.map.checkVisibility();

        await mapPage.goToHomePage();
        await homePage.shouldBeOpened();

        await homePage.navigateToMap();
        await mapPage.map.checkVisibility();

        await mapPage.map.zoomIn(1);
    });
});