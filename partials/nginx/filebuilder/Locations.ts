import {indentText} from '@boiler/util/textUtils.js';
import crypto from 'node:crypto';

export interface Location {
    key: string;
    label: string;
    route: string;
    config: string;
}

export class Locations {
    private _all: Record<string, Location> = {};

    public get all(): Location[] {
        return Object.values(this._all).map(location => ({...location}));
    }

    public has(key: string): boolean {
        return Boolean(this._all[key]);
    }

    public set(location: Location): this {
        if (!location.key) {
            throw new Error('Location key is required');
        }
        if (!location.route) {
            throw new Error('Location route is required');
        }
        if (!location.route.startsWith('/')) {
            throw new Error('Location route must start with a slash');
        }
        if (!location.config) {
            throw new Error('Location config is required');
        }
        this._all[location.key] = location;
        return this;
    }

    public get(key: string): Location | undefined {
        if (!this._all[key]) {
            return undefined;
        }
        
        return {...this._all[key]};
    }

    public toString(): string {
        return Object.values(this._all)
            .map(location => `location ${location.route} {\n${indentText(location.config)}\n}`)
            .join('\n\n');
    }

    public toHash(): string {
        const content = this.toString();
        const hash = crypto.createHash('sha256');
        hash.update(content);
        return hash.digest('hex');
    }
}
