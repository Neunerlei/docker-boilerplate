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

    public add(serviceName: string): ServiceSection {
        serviceName = this._context.getRealPartialKey(serviceName);
        if (this._services[serviceName]) {
            throw new Error(`Service ${serviceName} already exists`);
        }
        return this._services[serviceName] = new ServiceSection(serviceName);
    }

    public has(serviceName: string): boolean {
        serviceName = this._context.getRealPartialKey(serviceName);
        return Boolean(this._services[serviceName]);
    }

    public get(serviceName: string): ServiceSection {
        serviceName = this._context.getRealPartialKey(serviceName);
        if (!this._services[serviceName]) {
            throw new Error(`Service ${serviceName} does not exist`);
        }
        return this._services[serviceName];
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
