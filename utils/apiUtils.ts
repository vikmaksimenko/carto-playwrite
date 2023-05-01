import { expect, APIRequestContext } from "@playwright/test";

export class ApiUtils {
    readonly request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async getInformation(): Promise<object> {
        const response = await this.request.get('/data/information.json');
        const body = await response.json();
        expect(body).toBeTruthy();
        return body;
    }
}