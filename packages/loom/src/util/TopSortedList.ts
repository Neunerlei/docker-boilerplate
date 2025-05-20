import {Sorter} from '@hapi/topo';

type DependencyOptions = {
    before?: string | string[];
    after?: string | string[];
}

type NormalizedDependencyOptions = {
    before: string[];
    after: string[];
}

export class TopSortedList<T = any> {
    private readonly _items: Map<string, T> = new Map();
    private readonly _dependencies: Map<string, NormalizedDependencyOptions> = new Map();
    private _sortedKeys: string[] | undefined;

    public get items(): Array<T> {
        if (!this._sortedKeys) {
            this._sort();
        }

        return this._sortedKeys!.map(key => this._items.get(key) as T);
    }

    public has(key: string): boolean {
        return this._items.has(key);
    }

    public add(key: string, value: T): this {
        return this._add(key, value, {});
    }

    public addBefore(key: string, value: T, dependencies: string | string[]): this {
        return this._add(key, value, {before: dependencies});
    }

    public addAfter(key: string, value: T, dependencies: string | string[]): this {
        return this._add(key, value, {after: dependencies});
    }

    public remove(key: string): this {
        this._items.delete(key);
        this._dependencies.delete(key);
        this._sortedKeys = undefined;
        return this;
    }

    private _add(key: string, value: T, dependencies: DependencyOptions): this {
        if (this._items.has(key)) {
            throw new Error(`Key "${key}" already exists.`);
        }
        this._items.set(key, value);
        this._dependencies.set(key, normalizeOptions(dependencies));
        this._sortedKeys = undefined;
        return this;
    }

    private _sort(): void {
        const sorter = new Sorter<string>();
        this._dependencies.forEach((dependencies, key) => {
            sorter.add(key, {...dependencies, manual: true});
        });
        this._sortedKeys = sorter.sort();
    }
}

function normalizeOptions(options: DependencyOptions): NormalizedDependencyOptions {
    return {
        before: Array.isArray(options.before) ? options.before : options.before ? [options.before] : [],
        after: Array.isArray(options.after) ? options.after : options.after ? [options.after] : []
    };
}
