import {ServiceSection} from './docker/ServiceSection';
import {Partial} from '../../partial/Partial.js';
import {AbstractBody} from './AbstractBody';
import {BuildContext} from '../../util/BuildContext';
import {Error} from 'memfs/lib/internal/errors';
import {FileBuilderParser} from '../FileBuilder';
import {Hooks, type WellKnownHooks} from '@builder/filebuilder/body/docker/PartialHookConsumer.js';

export class DockerfileBody extends AbstractBody {
    private readonly _services: Record<string, ServiceSection> = {};
    private readonly _context: BuildContext;
    private readonly _hooks: Hooks;

    constructor(context: BuildContext) {
        super();
        this._context = context;
        this._hooks = new Hooks();
    }

    public add(serviceNameOrPartialKey: string): ServiceSection {
        const partialKey = this._getServiceNameFromPartialKey(serviceNameOrPartialKey);
        if (this._services[partialKey]) {
            throw new Error(`Service ${partialKey} already exists`);
        }
        return this._services[partialKey] = new ServiceSection(partialKey, this._hooks);
    }

    public has(serviceNameOrPartialKey: string): boolean {
        return Boolean(this._services[this._getServiceNameFromPartialKey(serviceNameOrPartialKey)]);
    }

    public get(serviceNameOrPartialKey: string): ServiceSection {
        const partialKey = this._getServiceNameFromPartialKey(serviceNameOrPartialKey);
        if (!this._services[partialKey]) {
            throw new Error(`Service ${partialKey} does not exist`);
        }
        return this._services[partialKey];
    }

    public getApp(): ServiceSection {
        return this.get('app');
    }

    public getForPartial(partial: Partial): ServiceSection {
        const key = this._getServiceNameFromPartialKey(partial.key);
        if (!this.has(key)) {
            this.add(key);
        }
        return this.get(key);
    }

    /**
     * Hooks are one way to allow partials to extend the dockerfiles of each other.
     * Instead of explicitly checking for "keys" in the instruction set, every dockerfile body may define some of the
     * well-known hooks other partials can extend upon. This is especially useful for installing dependencies or copying
     * data to an app container.
     */
    public addHook(serviceNameOrPartialKey: string, hookName: WellKnownHooks | string, command: string): this {
        this._hooks.addToHook(this._getServiceNameFromPartialKey(serviceNameOrPartialKey), hookName, command);
        return this;
    }

    public getValue(): any {
        return this._services;
    }

    public toString(): string {
        if (this.has('app')) {
            const appService = this.get('app');

            // The app service should always be the last one in the Dockerfile
            return (Object.values(this._services)
                    .filter(service => service !== appService)
                    .map(service => service.toString())
                    .join('\n\n\n')
                + '\n\n\n'
                + appService.toString()).trim();
        }

        return Object.values(this._services)
            .map(service => service.toString())
            .join('\n\n\n');
    }

    public outputParser(): FileBuilderParser {
        return 'string'
    }

    private _getServiceNameFromPartialKey(partialKey: string): string {
        return this._context.partials.isApp(partialKey) ? 'app' : partialKey;
    }
}
