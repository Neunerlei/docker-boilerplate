import type {LoomFragment} from './types.js';

export interface FragmentDefRef {
    current?: LoomFragment;
}

export class Fragment {
    public constructor(
        private readonly defRef: FragmentDefRef,
        private readonly _key: string,
        private readonly _bundleKey: string
    ) {
    }

    public get fullKey() {
        return `${this._bundleKey}/${this._key}`;
    }

    public get key() {
        return this._key;
    }

    public get bundleKey() {
        return this._bundleKey;
    }

    public get name() {
        return this.defRef.current?.name ?? this._key;
    }

    public get description() {
        return this.defRef.current?.description;
    }

    public get definition() {
        if (!this.defRef.current) {
            throw new Error(`Definition of fragment ${this.fullKey} is not loaded`);
        }
        return this.defRef.current;
    }

    protected get _defRef() {
        return this.defRef;
    }
}
