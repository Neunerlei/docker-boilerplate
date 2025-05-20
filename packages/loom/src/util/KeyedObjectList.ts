export class KeyedObjectList<C extends object, K extends keyof C = any> {
    public constructor(
        protected readonly items: Array<C>,
        protected readonly keyPropertyName: K = 'key' as K
    ) {
    }

    public get keys(): Array<string> {
        return this.items.map(item => item[this.keyPropertyName] + '');
    }

    public get size(): number {
        return this.items.length;
    }

    public has(key: string): boolean {
        return this.items.some(item => item[this.keyPropertyName] === key);
    }

    public get(key: string): C | undefined {
        return this.items.find(item => item[this.keyPropertyName] === key);
    }

    public filter(predicate: (item: C) => boolean): Array<C> {
        return this.items.filter(predicate);
    }

    public [Symbol.iterator](): Iterator<C> {
        return this.items[Symbol.iterator]();
    }
}
