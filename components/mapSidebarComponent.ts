import { expect } from '@playwright/test';
import { BaseComponent } from '../components/baseComponent';

export class MapSidebarComponent extends BaseComponent {
    private readonly sectionValidations = {
        image: async (data: object) => {
            // The image src is not checked, because it's changed on the server
            const imageEl = this.page.getByRole('img', { name: data['alt'] });
            await expect(imageEl).toBeVisible();
            await expect(imageEl.locator('xpath=./following-sibling::span[contains(@class, "caption")]')).toHaveText(data['caption'].toString());
        },
        title: async (title: string) => {
            await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
        },
        userInfo: async (data: object) => {
            await expect(this.page.getByRole('heading', { name: data['name'] })).toBeVisible();
            await expect(this.page.getByRole('img', { name: data['name'] })).toBeVisible();
            await expect(this.page.getByText(data['position'])).toBeVisible();
        },
        info: async (text: string) => {
            await expect(this.page.getByText(text)).toBeVisible();
        },
        widget: async (data: object) => {
            await expect(this.page.getByRole('button', { name: data['title'] })).toBeVisible();
        },
        nextHazard: async (data: object) => {
            const next = this.page.locator(`//a[contains(@href, "${data['toRoute']}")]`);
            await expect(next.filter({ has: this.page.getByRole('heading', { name: 'Next' }) })).toBeVisible();
            await expect(next.filter({ has: this.page.getByRole('heading', { name: data['title'] }) })).toBeVisible();
        },
        footer: async () => {
            // Leaving empty as it's not clear how to test footer
        }
    };

    async checkPanelSectionName(name: string) {
        await expect(this.page.getByRole('heading', { name: name })).toBeVisible();
    }

    async validateSectionInfo(info: object) {
        for (const infoIndex in info) {
            // I do not validate sections order, because they are not in the same DOM element (footer is different)
            const infoSection = info[infoIndex];
            for (const widget in infoSection) {
                const validation = this.sectionValidations[widget];
                expect(validation).toBeTruthy();
                await validation(infoSection[widget]);
            }
        }
    }
}
