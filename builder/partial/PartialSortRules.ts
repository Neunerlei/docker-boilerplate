import {PartialKeySorter} from "./PartialKeySorter";

export class PartialSortRules {
    private readonly _key: string;
    private _sorter: PartialKeySorter;

    public constructor(key: string, sorter: PartialKeySorter) {
        this._key = key;
        this._sorter = sorter;
    }

    public before(key: string) {
        this._sorter.before(this._key, key);
        return this;
    }

    public after(key: string) {
        this._sorter.after(this._key, key);
        return this;
    }
}
