import { test, expect, Page } from '@playwright/test';
import { MapPage } from '../pages/mapPage';
import { MapConfigurationComponent } from '../components/mapConfigurationComponent';
import { MapSidebarWidgetComponent } from '../components/mapSidebarWidgetComponent';
import { SimpleCoordinates } from '../data/simpleCoordinates';


test.describe('Map page tests', () => {
    let mapPage: MapPage;

    test.beforeEach(async ({ page }) => {
        mapPage = new MapPage(page);
    });

    test('Test 2. The app should hide the button to configure the failing dataset', async ({ page }) => {
        await removeThematicIndecesFromDataset(page);
        await mapPage.open();
        await mapPage.map.shouldBeVisible();
        await mapPage.map.checkControlToBeHidden('Thematic Indices');
    });

    test('Test 3. Check that the "Facilities and structure" layer shows the correct data and is working correctly', async ({ page }) => {        
        await mapPage.open();
        await mapPage.shouldBeVisible();

        await test.step('Open the Insights of Thematic indices', async () => {
            await mapPage.sidebar.openTab('Thematic Indices');
            await mapPage.sidebar.openTab('Insights');
            await mapPage.sidebar.checkPanelSectionName('Thematic Indices');
        });

        const mapWidget = new MapSidebarWidgetComponent(page, 'Facilities and Structures');
        await test.step('Check that the widget is visible and the data is correct', async () => {
            const widgetData = {
                "Pre-School": 493,
                "Fire Station": 101,
                "Police Station": 38,
            };

            await mapWidget.shouldBeVisible();
            await mapWidget.waitForDataLoaded();
            await mapWidget.validateData(widgetData);
        });

        await test.step('Disable all the "HDOT Assets" (to be able to check in the map that all is working properly)', async () => {
            // Selects become available before the data is loaded completely. 
            // As result, the checkboxes we set might be reset by the app itself.
            // Looks like a bug to me, map settings should be disabled while info loading

            // The only way I found (beside the hardcoded wait) was to change steps order, 
            // open the HDOT Assets menu first and wait for all checkboxes to become available. 
            // However, it sould be great to have attribute or JS variable set when the data is loaded.

            await mapPage.map.openConfiguration('HDOT Assets');
            const mapConfig = new MapConfigurationComponent(page);
            await mapConfig.shouldBeVisible();
            await mapConfig.waitForAllCheckboxesToBecomeEnabled();
            await mapConfig.unselectAllCheckboxes();
            await mapConfig.closeConfigMenu();
        });

        await test.step('Enable the "Facilities and structure" layer (available on "More Layers")', async () => {
            await mapPage.map.openConfiguration('More Layers');
            const mapConfig = new MapConfigurationComponent(page);
            await mapConfig.shouldBeVisible();
            await mapConfig.waitForAllCheckboxesToBecomeEnabled();
            await mapConfig.checkOption('Facilities and Structure');
            await mapConfig.closeConfigMenu();
        });

        await mapPage.map.checkMapScreenshot('test3-default-map.png');


        await test.step('Zoom to the Honolulu island', async () => {
            // The starting coordinates for the mouse (approx. center of the Honolulu island)
            let start = new SimpleCoordinates(750, 120);

            // The ending coordinates are the meedle of the canvas element
            const canvasCenter = await mapPage.map.getCanvasCenter();

            await mapPage.map.moveMap(start, canvasCenter);
            await mapPage.map.zoomIn(2);

            // Fine-tuning island position 
            start = new SimpleCoordinates(750, 250);
            await mapPage.map.moveMap(start, canvasCenter);
            await mapPage.map.checkMapScreenshot('test3-honolulu-map.png')
        });

        await test.step('Check that the widget values are adapted to the data shown for that zoom level.', async () => {
            const widgetData = {
                "Pre-School": 331,
                "Fire Station": 44,
                "Police Station": 11,
            };

            await mapWidget.shouldBeVisible();
            await mapWidget.waitForDataLoaded();
            await mapWidget.validateData(widgetData);
        });

        await mapWidget.filterBy('Police Station', '1 selected');
        await mapPage.map.checkMapScreenshot('test3-honolulu-police-station-map.png');

        await mapPage.map.hoverOverMap(new SimpleCoordinates(720, 350));
        await mapPage.map.checkMapPopup('Name: Waianae Substation (Police Station)');
    });
});

const removeThematicIndecesFromDataset = async (page: Page) => {
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
}