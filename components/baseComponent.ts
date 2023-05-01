import { Page } from '@playwright/test';

export abstract class BaseComponent {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}