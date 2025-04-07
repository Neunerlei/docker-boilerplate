import {AbstractBody} from './AbstractBody';
import {BuildContext} from '../../util/BuildContext';
import {input} from '@inquirer/prompts';
import {textUtils} from '../../util/textUtils';

type NginxLocationItem = {
    route: string;
    config: string;
}

export class NginxBody extends AbstractBody {
    private _context: BuildContext;
    private _locations: Record<string, NginxLocationItem> = {};

    constructor(context: BuildContext) {
        super();
        this._context = context;
    }

    public hasLocation(key: string): boolean {
        return Boolean(this._locations[key]);
    }

    public setLocation(key: string, route: string, config: string): this {
        if (!route.startsWith('/')) {
            throw new Error('Route must start with /');
        }
        this._locations[key] = {route, config: config.trim()};
        return this;
    }

    public getLocation(key: string): NginxLocationItem {
        if (!this.hasLocation(key)) {
            throw new Error(`Location ${key} does not exist`);
        }
        return this._locations[key];
    }

    public async setServiceLocation(serviceName: string, config: string): Promise<this> {
        const key = serviceName;
        serviceName = this._context.getRealPartialKey(serviceName);

        let route = '';

        if (serviceName === 'app') {
            route = '/';
        } else {
            route = await input({
                message: `Route for service: ${key}`,
                default: '/' + this._context.getPartialDir(key, key).replace(/^\/+/, ''),
                validate: (value) => {
                    if (value.startsWith('/')) {
                        return true;
                    }
                    return 'Route must start with /';
                }
            });
        }

        return this.setLocation(key, route, config);
    }

    public getRealServiceName(serviceName: string): string {
        return this._context.getRealPartialKey(serviceName);
    }

    public getValue() {
        return {
            locations: this._locations
        };
    }

    public toLocationString(): string {
        return Object.values(this._locations).map((item) => {
            return `location ${item.route} {\n${textUtils(item.config)}\n}`;
        }).join('\n\n');
    }
}
