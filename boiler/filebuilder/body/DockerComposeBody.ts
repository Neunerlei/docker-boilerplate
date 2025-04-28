import {AbstractBody} from './AbstractBody';
import deepmerge from 'deepmerge';
import {BuildContext} from '../../util/BuildContext';
import {FileBuilderParser} from '../FileBuilder';

export class DockerComposeBody extends AbstractBody {
    private _value: Record<string, any> = {services: {}};
    private _context: BuildContext;

    constructor(context: BuildContext) {
        super();
        this._context = context;
    }

    public hasService(serviceName: string): boolean {
        return Boolean(this._value.services[this._getServiceNameFromPartialKey(serviceName)]);
    }

    public setService(serviceName: string, value: Record<any, any>): void {
        serviceName = this._getServiceNameFromPartialKey(serviceName);
        this._value.services[serviceName] = value;
    }

    public mergeService(serviceName: string, value: Record<any, any>): void {
        serviceName = this._getServiceNameFromPartialKey(serviceName);
        if (!this._value.services[serviceName]) {
            throw new Error(`Service ${serviceName} does not exist`);
        }
        this._value.services[serviceName] = deepmerge(this._value.services[serviceName], value);
    }

    public getValue(): any {
        return this._value;
    }

    public merge(value: Record<string, any>): void {
        this._value = deepmerge(this._value, value);
    }

    public outputParser(): FileBuilderParser {
        return 'yaml'
    }

    private _getServiceNameFromPartialKey(partialKey: string): string {
        return this._context.partials.isApp(partialKey) ? 'app' : partialKey;
    }
}
