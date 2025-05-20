import type {LoadedLoomPattern} from './types.js';
import type {FragmentList} from '../fragments/FragmentList.js';
import type {FragmentNodeList} from '../fragments/types.js';
import {FragmentWithPatternInfo} from '@loom/fragments/FragmentWithPatternInfo.js';

export class Pattern {
    public constructor(
        protected readonly definition: LoadedLoomPattern,
        protected readonly _fragments: FragmentList,
        protected readonly _nodeListGetter: () => FragmentNodeList
    ) {
    }

    public get key(): string {
        return this.definition.key;
    }

    public get name(): string {
        return this.definition.name;
    }

    public get description(): string | undefined {
        return this.definition.description;
    }

    public get fragmentKeys(): string[] {
        return Object.keys(this.definition.fragments);
    }

    public get fragments(): FragmentWithPatternInfo[] {
        return this.fragmentKeys.map(key => {
            const fragment = this._fragments.get(key);
            if (!fragment) {
                throw new Error(`Fragment "${key}" defined in the pattern is no loaded!`);
            }
            return new FragmentWithPatternInfo(fragment, this);
        });
    }

    public get nodes(): FragmentNodeList {
        return this._nodeListGetter();
    }

    public get provides(): string[] {
        const allProvides: string[] = [];
        for (const fragment of this.fragments) {
            allProvides.push(...fragment.definition.provides?.(fragment.version) ?? []);
        }
        return [...new Set(allProvides)];
    }

    public getFragment(fullKey: string): FragmentWithPatternInfo | undefined {
        if (!this.definition.fragments[fullKey]) {
            return undefined;
        }

    }

    public getFragmentVersion(fullKey: string): string | undefined {
        const fragment = this.definition.fragments[fullKey];

        if (fragment) {
            return fragment.version ?? 'latest';
        }

        return undefined;
    }

    public getNodeState(fragmentFullKey: string, nodeKey: string): any | undefined {
        const fragment = this.definition.fragments[fragmentFullKey];

        if (fragment) {
            return fragment.nodes[nodeKey];
        }

        return undefined;
    }
}
