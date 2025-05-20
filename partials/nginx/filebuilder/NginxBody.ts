import {AbstractBody} from '@boiler/filebuilder/body/AbstractBody';
import {Location, Locations} from './Locations.js';
import type {Partial} from '@boiler/partial/Partial.js';

type NginxLocationItem = {
    route: string;
    config: string;
}

export class NginxBody extends AbstractBody {
    private _dev: Locations = new Locations();
    private _devSsl: Locations = new Locations();
    private _prod: Locations = new Locations();

    private _locations: Record<string, NginxLocationItem> = {};

    public get dev(): Locations {
        return this._dev;
    }

    public get devSsl(): Locations {
        return this._devSsl;
    }

    public get prod(): Locations {
        return this._prod;
    }

    public addToAll(location: Location): this {
        this._dev.set(location);
        this._devSsl.set(location);
        this._prod.set(location);
        return this;
    }

    public addToAllDev(location: Location): this {
        this._dev.set(location);
        this._devSsl.set(location);
        return this;
    }

    public getPartialLocation(partial: Partial, config: string): Location {
        const {definition: {key, name}, outputDirectory} = partial;
        return {
            key,
            label: name,
            route: `${outputDirectory.replace(/[^a-zA-Z0-9\-äöü\/]/g, '-')}`,
            config: config.trim()
        };
    }

    public getValue() {
        return {
            locations: this._locations
        };
    }
}
