import type {Context} from '@loom/Context.js';
import type {BundleList, LoadedLoomBundle} from '@loom/bundles/types.js';
import type {Fragment} from '@loom/fragments/Fragment.js';
import type {
    FragmentNode,
    FragmentNodeList,
    LoadedFragmentTypeDefinition,
    LoomFragment
} from '@loom/fragments/types.js';
import type {LoadedLoomPattern} from '@loom/patterns/types.js';
import type {Pattern} from '@loom/patterns/Pattern.js';
import type {Command} from 'commander';
import type {PatternWriter} from '@loom/patterns/PatternWriter.js';
import type {DockerConfig} from '@loom/docker/DockerConfig.js';


export interface AsyncEventTypes {
    'booted': { context: Context },

    'bundle:list:filter': { bundles: LoadedLoomBundle[] },
    'fragment:type:list:filter': { bundles: BundleList, list: Array<LoadedFragmentTypeDefinition> },
    'fragment:definition:filter': { bundleKey: string, key: string, definition: LoomFragment },
    'fragment:list:filter': { bundles: BundleList, list: Array<Fragment> },
    'fragment:list:selected': { pattern: PatternWriter }
    'fragment:nodes:list:filter': { pattern: Pattern, list: Array<FragmentNode> },
    'fragment:nodes:ready': { nodes: FragmentNodeList },
    'pattern:list:filter': { bundles: BundleList, list: Array<LoadedLoomPattern> },
    'pattern:created': { pattern: Pattern },
    'pattern:ready': { pattern: Pattern },
    'docker:ready': { state: DockerConfig },
    'commands:define': { program: Command },
    // 'filebuilder:collect:specialFactories': { factories: Record<string, FileBuilderBodyFactory> };

    /**
     * Executed when an error occurs.
     * This hook is executed before the error is printed to the console.
     */
    'error:before': { error: Error };
    /**
     * Executed when an error occurs.
     * This hook is executed after the error was printed to the console.
     */
    'error:after': { error: Error };
}

export interface SyncEventTypes {
    'ui:filter:errorHeader': { value: string };
    'ui:filter:welcome': { value: string };
}

export class EventBus {
    private readonly _async: Map<keyof AsyncEventTypes, Set<(arg: AsyncEventTypes[keyof AsyncEventTypes]) => Promise<void>>> = new Map();
    private readonly _sync: Map<keyof SyncEventTypes, Set<(arg: SyncEventTypes[keyof SyncEventTypes]) => void>> = new Map();

    public async trigger<E extends keyof AsyncEventTypes>(event: E, arg: AsyncEventTypes[E]): Promise<AsyncEventTypes[E]> {
        const callbacks = this._async.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                await callback(arg);
            }
        }
        return arg;
    }

    public triggerSync<E extends keyof SyncEventTypes>(event: E, arg: SyncEventTypes[E]): SyncEventTypes[E] {
        const callbacks = this._sync.get(event);
        if (callbacks) {
            for (const callback of callbacks) {
                callback(arg);
            }
        }
        return arg;
    }

    public on<E extends keyof AsyncEventTypes>(event: E, callback: (arg: AsyncEventTypes[E]) => Promise<void>): this {
        if (!this._async.has(event)) {
            this._async.set(event, new Set());
        }
        this._async.get(event)!.add(callback as (arg: AsyncEventTypes[keyof AsyncEventTypes]) => Promise<void>);
        return this;
    }

    public onSync<E extends keyof SyncEventTypes>(event: E, callback: (arg: SyncEventTypes[E]) => void): this {
        if (!this._sync.has(event)) {
            this._sync.set(event, new Set());
        }
        this._sync.get(event)!.add(callback as any);
        return this;
    }
}
