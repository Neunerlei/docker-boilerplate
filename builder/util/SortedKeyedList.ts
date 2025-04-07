export class SortedKeyedList<K = string, V = any> {
    private _data: Map<K, V> = new Map();
    private _order: K[] = [];

    public has(key: K): boolean {
        return this._data.has(key);
    }

    public get(key: K): V | undefined {
        return this._data.get(key);
    }

    public add(key: K, value: V, override?: boolean): this {
        this.failOnDuplicateKey(key, override);
        if (!this.has(key)) {
            this._order.push(key);
        }
        this._data.set(key, value);
        return this;
    }

    public prepend(key: K, value: V, override?: boolean): this {
        this.failOnDuplicateKey(key, override);
        if (this.has(key)) {
            this._order = this._order.filter(k => k !== key);
        }
        this._order.unshift(key);
        this._data.set(key, value);
        return this;
    }

    public append(key: K, value: V, override?: boolean): this {
        this.failOnDuplicateKey(key, override);
        if (this.has(key)) {
            this._order = this._order.filter(k => k !== key);
        }
        this._order.push(key);
        this._data.set(key, value);
        return this;
    }

    public addBefore(key: K, beforeKey: K, value: V, override?: boolean): this {
        this.failOnDuplicateKey(key, override);
        if (!this.has(beforeKey)) {
            throw new Error(`Key "${beforeKey}" does not exist.`);
        }
        if (!this.has(key)) {
            this._order.splice(this._order.indexOf(beforeKey), 0, key);
        }
        this._data.set(key, value);
        return this;
    }

    public addAfter(key: K, afterKey: K, value: V, override?: boolean): this {
        this.failOnDuplicateKey(key, override);
        if (!this.has(afterKey)) {
            throw new Error(`Key "${afterKey}" does not exist.`);
        }
        if (!this.has(key)) {
            this._order.splice(this._order.indexOf(afterKey) + 1, 0, key);
        }
        this._data.set(key, value);
        return this;
    }

    public remove(key: K): this {
        if (this.has(key)) {
            this._order = this._order.filter(k => k !== key);
            this._data.delete(key);
        }
        return this;
    }

    public keys(): K[] {
        return this._order;
    }

    public values(): V[] {
        return this._order.map(k => this._data.get(k)!);
    }

    public entries(): [K, V][] {
        return this._order.map(k => [k, this._data.get(k)!]);
    }

    public clear(): this {
        this._data.clear();
        this._order = [];
        return this;
    }

    public size(): number {
        return this._order.length;
    }

    private failOnDuplicateKey(key: K, override: boolean | undefined): void {
        if (!override && this.has(key)) {
            throw new Error(`Key "${key}" already exists. To override existing keys, use the "override" parameter.`);
        }
    }
}
