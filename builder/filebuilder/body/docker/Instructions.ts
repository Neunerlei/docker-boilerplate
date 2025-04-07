import {SortedKeyedList} from '../../../util/SortedKeyedList';

export class Instructions {
    private readonly _list: SortedKeyedList<string, string> = new SortedKeyedList();
    private readonly _rootAlias: string;
    private readonly _serviceAlias: string;

    public constructor(rootAlias: string, serviceAlias: string) {
        this._rootAlias = rootAlias;
        this._serviceAlias = serviceAlias
    }

    public has(key: string): boolean {
        return this._list.has(key);
    }

    public get(key: string): string | undefined {
        return this._list.get(key)?.trim();
    }

    public addDefaultFrom(override?: boolean): this {
        this._list.prepend('from', `FROM ${this._rootAlias} AS ${this._serviceAlias}`, override);
        return this;
    }

    public add(key: string, value: string, override?: boolean): this {
        this._list.add(key, value, override);
        return this;
    }

    public addBefore(key: string, beforeKey: string, value: string, override?: boolean): this {
        this._list.addBefore(key, beforeKey, value, override);
        return this;
    }

    public addAfter(key: string, afterKey: string, value: string, override?: boolean): this {
        this._list.addAfter(key, afterKey, value, override);
        return this;
    }

    public remove(key: string): this {
        this._list.remove(key);
        return this;
    }

    public getInstructions(): [string, string][] {
        return this._list.entries().map(([key, value]) => [key, value.trim()]);
    }

    public getKeys(): string[] {
        return this._list.keys();
    }

    public toString(): string {
        return this._list.values().map(v => v.trim()).join('\n\n');
    }

    public clear(): void {
        this._list.clear();
    }

    public size(): number {
        return this._list.size();
    }
}
