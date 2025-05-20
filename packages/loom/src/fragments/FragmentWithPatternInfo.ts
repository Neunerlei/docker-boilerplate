import {Fragment} from './Fragment.js';
import type {Pattern} from '../patterns/Pattern.js';

export class FragmentWithPatternInfo extends Fragment {
    private readonly _pattern: Pattern;

    public constructor(fragment: Fragment, pattern: Pattern) {
        super(
            (fragment as FragmentWithPatternInfo)._defRef,
            fragment.key,
            fragment.bundleKey
        );
        this._pattern = pattern;
    }

    public get givenKey(): string {

    }

    public get givenName(): string {

    }

    public get version(): string {
        return this._pattern.getFragmentVersion(this.fullKey) ?? 'latest';
    }

    public get supportedFragment(): FragmentWithPatternInfo | undefined {

    }

    public getNodeState(nodeKey: string): any | undefined {
        return this._pattern.getNodeState(this.fullKey, nodeKey);
    }
}
