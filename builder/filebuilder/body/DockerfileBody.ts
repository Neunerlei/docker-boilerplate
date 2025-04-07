import {ServiceSection} from "./docker/ServiceSection";
import {PartialContext} from "../../partial/PartialContext";
import {AbstractBody} from "./AbstractBody";
import {BuildContext} from '../../util/BuildContext';
import {Error} from 'memfs/lib/internal/errors';
import {FileBuilderParser} from '../FileBuilder';

export class DockerfileBody extends AbstractBody {
    private _services: Record<string, ServiceSection> = {};
    private _context: BuildContext;

    constructor(context: BuildContext) {
        super();
        this._context = context;
    }

    public add(serviceNameOrPartialKey: string): ServiceSection {
        serviceNameOrPartialKey = this._context.getRealPartialKey(serviceNameOrPartialKey);
        if (this._services[serviceNameOrPartialKey]) {
            throw new Error(`Service ${serviceNameOrPartialKey} already exists`);
        }
        return this._services[serviceNameOrPartialKey] = new ServiceSection(serviceNameOrPartialKey);
    }

    public has(serviceNameOrPartialKey: string): boolean {
        serviceNameOrPartialKey = this._context.getRealPartialKey(serviceNameOrPartialKey);
        return Boolean(this._services[serviceNameOrPartialKey]);
    }

    public get(serviceNameOrPartialKey: string): ServiceSection {
        serviceNameOrPartialKey = this._context.getRealPartialKey(serviceNameOrPartialKey);
        if (!this._services[serviceNameOrPartialKey]) {
            throw new Error(`Service ${serviceNameOrPartialKey} does not exist`);
        }
        return this._services[serviceNameOrPartialKey];
    }

    public getApp(): ServiceSection {
        return this.get(this._context.getAppPartialKey());
    }

    public getForContext(context: PartialContext): ServiceSection {
        const serviceName = this._context.getRealPartialKey(context.getKey());
        if (!this.has(serviceName)) {
            this.add(serviceName);
        }
        return this.get(serviceName);
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
}
