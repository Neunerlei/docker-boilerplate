import {PartialDefinition} from './types';
import {BuildContext} from '../util/BuildContext';
import type {PartialSummary} from '@builder/util/Summary.js';

export interface PartialState {
    /**
     * True if the partial is the main service of the application.
     */
    isApp?: boolean;

    /**
     * The definition of the partial
     */
    definition?: PartialDefinition;

    /**
     * The selected version of the partial. If not set, the first available version will be used, if the partial
     * does not define any version, the version is set to "latest".
     */
    version?: string;

    /**
     * The path where the partial files will be copied/dumped to. This is the directory inside
     * the output directory of the builder. Normally this directory has the same name as the partial key,
     * however, if the partial is the main service, the directory will be named "app".
     */
    outputDirectory?: string;
}

export class Partial {
    private readonly _state: PartialState;
    private readonly _buildContext: BuildContext;
    private readonly _summary: PartialSummary;

    public constructor(
        state: PartialState,
        buildContext: BuildContext,
        summary: PartialSummary
    ) {
        this._state = state;
        this._buildContext = buildContext;
        this._summary = summary;
    }

    /**
     * Returns the unique key/id for this partial
     * Note: If this partial is the "app" partial, the key will be "app" instead of the key in the definition!
     * You can always access the real key via the `definition.key` property.
     */
    public get key(): string {
        if (this._state.isApp) {
            return 'app';
        }

        return this.definition.key;
    }

    /**
     * Returns a human-readable name to display to the user
     */
    public get name(): string {
        return this.definition.name;
    }

    /**
     * Returns the raw definition of the partial as it was returned by the factory function.
     */
    public get definition(): PartialDefinition {
        if (!this._state.definition) {
            throw new Error('Partial definition is not set, this is probably the case because you are currently executing the partial factory function');
        }
        return this._state.definition;
    }

    /**
     * Returns the summary object of this partial. The summary can be used to add messages to show to the user after the environment has been created.
     */
    public get summary(): PartialSummary {
        return this._summary;
    }

    /**
     * Returns true if this partial is the main service of the created environment.
     */
    public get isApp(): boolean {
        return this._state.isApp ?? false;
    }

    /**
     * Returns true if this partial is used in the current environment.
     */
    public get isUsed(): boolean {
        return this._buildContext.partials.isUsed(this.definition.key);
    }

    /**
     * Returns the selected version of the partial.
     */
    public get version(): string {
        return this._state.version ?? this.definition.versions?.[0] ?? 'latest';
    }

    /**
     * Returns the path of the directory where the partial files will be copied/dumped to.
     * This is the directory inside the output directory of the builder.
     * The path will always start with a slash, bust MUST be understood as relative to the output directory!
     */
    public get outputDirectory(): string {
        if (this.isApp) {
            return '/app';
        }

        if (this._state.outputDirectory) {
            return '/' + this._state.outputDirectory.replace(/^\//, '');
        }

        return '/' + this.definition.key;
    }

    /**
     * The build context gives you low level access to the builder and the environment.
     * Note: It is not recommended to use this in your own code, because the build context may change in the future!
     */
    public get buildContext(): BuildContext {
        return this._buildContext;
    }

    /**
     * Returns the instance of another partial that has been registered in the builder.
     * @param key
     */
    public getOtherPartial(key: string): Partial | undefined {
        return this._buildContext.partials.get(key);
    }

    /**
     * Returns the instance of another partial that has been registered in the builder.
     * The same as "getOtherPartial", but throws an error if the partial is not found.
     * @param key
     */
    public getOtherPartialOrFail(key: string): Partial {
        const partial = this.getOtherPartial(key);
        if (!partial) {
            throw new Error(`Partial "${key}" not found`);
        }
        return partial;
    }
}
