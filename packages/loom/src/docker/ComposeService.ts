import type {DockerBuildStep} from '@loom/docker/DockerBuildStep.js';
import {ComposeServiceWriter} from '@loom/docker/internal/ComposeServiceWriter.js';
import deepmerge from 'deepmerge';
import type {DockerContext} from '@loom/docker/internal/DockerContext.js';


export class ComposeService {
    private readonly _key: string;
    private readonly _dev: ComposeServiceConfig;
    private readonly _prod: ComposeServiceConfig;

    public constructor(key: string, context: DockerContext) {
        this._key = key;
        this._dev = new ComposeServiceConfig(context);
        this._prod = new ComposeServiceConfig(context);
    }

    public get key(): string {
        return this._key;
    }

    public get dev(): ComposeServiceConfig {
        return this._dev;
    }

    public get prod(): ComposeServiceConfig {
        return this._prod;
    }

    public get writer(): ComposeServiceWriter {
        return new ComposeServiceWriter();
    }

    public configure(
        type: 'dev' | 'prod' | 'both',
        configurator: (config: ComposeServiceConfig) => void
    ) {
        if (type === 'dev' || type === 'both') {
            configurator(this._dev);
        }
        if (type === 'prod' || type === 'both') {
            configurator(this._prod);
        }
        return this;
    }

}

export class ComposeServiceConfig {
    private readonly _context: DockerContext;
    private _config: Record<string, any> = {};
    private _buildTarget: DockerBuildStep | undefined;

    public constructor(context: DockerContext) {
        this._context = context;
    }

    public get config(): Record<string, any> {
        return this._config;
    }

    public setConfig(config: Record<string, any>): this {


    }

    public mergeConfig(config: Record<string, any>, options?: deepmerge.Options): this {
        if (typeof config !== 'object') {
            throw new Error('Invalid config');
        }
        this._config = deepmerge(this._config, config, options);
        return this;
    }

    public setBuildTarget(step: DockerBuildStep): this {

    }

    public getBuildTarget(): DockerBuildStep | undefined {

    }

    public removeBuildTarget(): this {

    }
}
