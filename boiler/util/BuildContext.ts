import {Paths} from './Paths';
import {IFs} from 'memfs';
import {PartialRegistry} from '../partial/PartialRegistry';
import type {Summary} from '@boiler/util/Summary.js';
import type {EventBus} from '@boiler/util/EventBus.js';
import type {Context} from '@boiler/core/Context.js';

export class BuildContext implements Context {
    private readonly _paths: Paths;
    private readonly _fs: IFs;
    private readonly _registryResolver: () => PartialRegistry;
    private readonly _summary: Summary;
    private readonly _events: EventBus;
    private _registry: PartialRegistry | undefined;

    public constructor(
        paths: Paths,
        fs: IFs,
        registryResolver: () => PartialRegistry,
        summary: Summary,
        events: EventBus
    ) {
        this._paths = paths;
        this._fs = fs;
        this._registryResolver = registryResolver;
        this._summary = summary;
        this._events = events;
    }

    /**
     * Returns an object containing all relevant filesystem paths for this environment.
     */
    public get paths(): Paths {
        return this._paths;
    }

    /**
     * Returns the instance of the memory filesystem used to collect all files for the generated environment
     * before dumping them to the output directory.
     */
    public get fs(): IFs {
        return this._fs;
    }

    /**
     * Returns the partial registry, which holds all partials, information on their usage and it tracks the
     * selected "app" partial.
     */
    public get partials(): PartialRegistry {
        if (!this._registry) {
            this._registry = this._registryResolver();
        }

        return this._registry;
    }

    /**
     * The summary is shown at the end of the build process. It contains information about the used partials,
     * their versions and the output directory.
     */
    public get summary(): Summary {
        return this._summary;
    }

    /**
     * Returns the event bus, which can be used to register and trigger events.
     */
    public get events(): EventBus {
        return this._events;
    }
}
