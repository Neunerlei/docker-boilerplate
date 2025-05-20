import type {FileBuilderBodyFactory} from '@boiler/filebuilder/FileBuilder.js';

export interface AsyncEventTypes {
    'filebuilder:collect:specialFactories': { factories: Record<string, FileBuilderBodyFactory> };
}

export interface SyncEventTypes {
    'noop': undefined;
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
        this._async.get(event)!.add(callback);
        return this;
    }

    public onSync<E extends keyof SyncEventTypes>(event: E, callback: (arg: SyncEventTypes[E]) => void): this {
        if (!this._sync.has(event)) {
            this._sync.set(event, new Set());
        }
        this._sync.get(event)!.add(callback);
        return this;
    }
}
