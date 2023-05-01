export class TabInfo {
    tabName: string;
    sectionName: string;
    id: string;

    constructor(tabName: string, sectionName: string, id: string) {
        this.tabName = tabName;
        this.sectionName = sectionName;
        this.id = id;
    }
}