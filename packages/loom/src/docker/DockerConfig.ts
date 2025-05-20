import deepmerge from 'deepmerge';
import {ComposeService} from '@loom/docker/ComposeService.js';
import type {Fragment} from '@loom/fragments/Fragment.js';
import type {DockerContext} from '@loom/docker/internal/DockerContext.js';
import {DockerConfigWriter} from '@loom/docker/internal/DockerConfigWriter.js';
import {DockerBuildStep} from '@loom/docker/DockerBuildStep.js';
import {ComposeFileWriter} from '@loom/docker/internal/ComposeFileWriter.js';
import {DockerfileWriter} from '@loom/docker/internal/DockerfileWriter.js';

interface ServiceQuery {
    key?: string | null;
    fragment?: Fragment;
}

interface BuildStepQuery {
    key?: string | null;
    fragment?: Fragment;
}

export class DockerConfig {
    private readonly _context: DockerContext;
    private readonly _services: Map<string, ComposeService> = new Map();
    private readonly _buildSteps: Map<string, DockerBuildStep> = new Map();
    private _compose: Record<string, any> = {};

    public constructor(context: DockerContext) {
        this._context = context;
        context.setConfig(this);
    }

    public get writer(): DockerConfigWriter {
        return new DockerConfigWriter(
            new ComposeFileWriter(
                this._compose,
                Array
                    .from(this._services.values())
                    .map(service => service.writer)
            ),
            new DockerfileWriter()
        );
    }

    public hasService(query?: ServiceQuery): boolean {
        return this._services.has(this._resolveServiceKey(query));
    }

    public addService(query?: ServiceQuery): ComposeService {
        const key = this._resolveServiceKey(query);
        if (this._services.has(key)) {
            throw new Error(`Service ${key} already exists`);
        }

        const service = new ComposeService(this._resolveServiceKey(query), this._context);
        this._services.set(key, service);

        return service;
    }

    public getService(query?: ServiceQuery): ComposeService {
        const key = this._resolveServiceKey(query);
        if (!this._services.has(key)) {
            throw new Error(`Service ${key} does not exist`);
        }

        return this._services.get(key)!;
    }

    public mergeCompose(config: Record<string, any>, options?: deepmerge.Options): this {
        if (typeof config !== 'object') {
            throw new Error('Invalid config');
        }
        if (typeof config.services !== 'undefined') {
            throw new Error('Invalid config: services is not allowed here. Please use the dedicated service methods instead.');
        }

        this._compose = deepmerge(this._compose, config, options);

        return this;
    }

    public hasBuildStep(query?: BuildStepQuery | DockerBuildStep): boolean {
        if (query instanceof DockerBuildStep) {
            return this._buildSteps.has(query.key);
        }
        return this._buildSteps.has(this._resolveBuildStepKey(query));
    }

    public addBuildStep(from: string | DockerBuildStep, query?: BuildStepQuery): DockerBuildStep {
        const key = this._resolveBuildStepKey(query);
        if (this._buildSteps.has(key)) {
            throw new Error(`Build step ${key} already exists`);
        }

        const step = new DockerBuildStep(key, this._context);
        step.setFrom(from);
        this._buildSteps.set(key, step);

        return step;
    }

    public getBuildStep(query?: BuildStepQuery): DockerBuildStep {
        const key = this._resolveBuildStepKey(query);
        if (!this._buildSteps.has(key)) {
            throw new Error(`Build step ${key} does not exist`);
        }

        return this._buildSteps.get(key)!;
    }

    private _resolveServiceKey(query?: ServiceQuery): string {
        let fragmentKey = query?.fragment?.key;
        if (!fragmentKey) {
            fragmentKey = this._context.fragment.key;
        }

        if (!query?.key) {
            return fragmentKey;
        }

        return normalizeName(`${fragmentKey}-${query.key}`, '-');
    }

    private _resolveBuildStepKey(query?: BuildStepQuery): string {
        let {key, fragment} = query || {};
        if (!key) {
            key = 'root';
        }

        let fragmentKey = fragment?.key;
        if (!fragmentKey) {
            fragmentKey = this._context.fragment.key;
        }
        return normalizeName(`${fragmentKey}_${key}`, '_');
    }
}

function normalizeName(key: string, delimiter: string): string {
    return key.replace(new RegExp(`[^a-zA-Z0-9_-${delimiter}]`, 'g'), delimiter)
        .toLowerCase()
        .replace(new RegExp(`${delimiter}{2,}`, 'g'), delimiter);
}
