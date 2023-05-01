import { BaseComponent } from '../components/baseComponent';

export abstract class BasePage extends BaseComponent {
    abstract open(): Promise<void>;
}