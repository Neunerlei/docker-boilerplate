import type {DockerfileEntrypoint} from './DockerfileEntrypoint.js';
import type {DockerContext} from '@loom/docker/internal/DockerContext.js';

export class DockerBuildStep {
    private readonly _key: string;
    private readonly _context: DockerContext;
    private _requiredSteps: Set<DockerBuildStep> = new Set();
    private _from: string | DockerBuildStep | undefined;

    public constructor(key: string, context: DockerContext) {
        this._key = key;
        this._context = context;
    }

    public get key(): string {
        return this._key;
    }

    public get requiredSteps(): DockerBuildStep[] {
        const requiredSteps = Array.from(this._requiredSteps);

        if (this._from instanceof DockerBuildStep) {
            if (!requiredSteps.includes(this._from)) {
                requiredSteps.push(this._from);
            }
        }

        return requiredSteps;
    }

    public get from(): string {
        if (this._from instanceof DockerBuildStep) {
            return this._from.key;
        }

        return this._from ?? 'scratch';
    }

    public setFrom(from: string | DockerBuildStep): this {
        if (from instanceof DockerBuildStep && !this._context.config.hasBuildStep(from)) {
            throw new Error(`Build step ${from.key} is not part of the dockerfile!`);
        }
        this._from = from;
    }

    public addRequiredStep(step: DockerBuildStep): this {
        if (!this._context.config.hasBuildStep(step)) {
            throw new Error(`Build step ${step.key} is not part of the dockerfile!`);
        }
        this._requiredSteps.add(step);
        return this;
    }

    public enableEntrypoint(filename: string): DockerfileEntrypoint {

    }

    public hasEntrypoint(): boolean {

    }

    public getEntrypoint(): DockerfileEntrypoint {

    }

    public clear(): void {
        this._requiredSteps.clear();
        this._from = undefined;
    }
}
