import {AbstractBody} from './AbstractBody';
import {BuildContext} from '../../util/BuildContext';
import {input} from '@inquirer/prompts';
import {indentText} from '../../util/textUtils';
import {uiLogInfoOnce, uiTextBlock, uiTextNs} from '@builder/util/uiUtils.js';

export const nginxFileTypes = ['prod', 'dev', 'devSsl'] as const;
export type NginxFileType = typeof nginxFileTypes[number];

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

    public hasLocation(key: string, type?: NginxFileType): boolean {
        if (type) {
            return Boolean(this._locations[key + type]);
        }

        for (const fileType of nginxFileTypes) {
            if (this.hasLocation(key, fileType)) {
                return true;
            }
        }

        return false;
    }

    public setLocation(key: string, route: string, config: string, type?: NginxFileType | NginxFileType[]): this {
        const gatedType = type || nginxFileTypes;
        const types = Array.isArray(gatedType) ? gatedType : [type];

        if (!route.startsWith('/')) {
            throw new Error('Route must start with /');
        }

        for (const fileType of types) {
            const realKey = key + fileType;
            this._locations[realKey] = {route, config: config.trim()};
        }

        return this;
    }

    public getLocation(key: string, type: NginxFileType): NginxLocationItem {
        if (!this.hasLocation(key, type)) {
            throw new Error(`Location ${key} does not exist`);
        }
        return this._locations[key + type];
    }

    public async setPartialLocation(partialKey: string, config: string, type?: NginxFileType | NginxFileType[]): Promise<this> {
        const partial = this._context.partials.getOrFail(partialKey);
        const {key, definition: {name}, outputDirectory, isApp} = partial;

        let route: string;

        if (isApp) {
            route = '/';
        } else {
            uiLogInfoOnce(
                'nginx.multiLocation',
                uiTextBlock(`When using multiple services, we need to make sure that each service has a unique route. 
The "main" service is automatically assigned the route "/". For all other services, you will be asked to provide a unique route.`),
                'Service routes'
            );

            route = await input({
                message: uiTextNs('nginx', `Route for service: ${name}`),
                default: outputDirectory,
                validate: (value) => {
                    if (value.startsWith('/')) {
                        return true;
                    }
                    return 'Route must start with /';
                }
            });
        }

        return this.setLocation(key, route, config, type);
    }

    public getRealServiceName(serviceName: string): string {
        return this._context.partials.normalizeKey(serviceName);
    }

    public getValue() {
        return {
            locations: this._locations
        };
    }

    public toLocationString(type: NginxFileType): string {
        return Object.entries(this._locations)
            .filter(([key]) => {
                return key.endsWith(type);
            })
            .map(([_, item]) => {
                return `location ${item.route} {\n${indentText(item.config)}\n}`;
            }).join('\n\n');
    }
}
