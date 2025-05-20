import {Pattern} from './Pattern.js';
import type {Fragment} from '../fragments/Fragment.js';
import {askForFragmentVersion} from './creation/askForFragmentVersion.js';
import {askForFragmentName} from './creation/askForFragmentName.js';

export class PatternWriter extends Pattern {
    public get json() {
        return JSON.stringify(this.definition, null, 2);
    }

    public async updateFragments(newFragments: Fragment[], oldFragments: Fragment[]) {
        for (const fragment of oldFragments) {
            if (!newFragments.includes(fragment)) {
                this.disableFragment(fragment);
            }
        }
        for (const fragment of newFragments) {
            if (!this.fragmentKeys.includes(fragment.fullKey)) {
                await this.enableFragment(fragment);
            }
        }
    }

    protected async enableFragment(fragment: Fragment) {
        if (this.definition.fragments[fragment.fullKey]) {
            return;
        }

        this.definition.fragments[fragment.fullKey] = {
            ...(await askForFragmentName(fragment, this.fragments) ?? {}),
            isApp: false,
            version: await askForFragmentVersion(fragment),
            nodes: {}
        };
    }

    protected disableFragment(fragment: Fragment) {
        delete this.definition.fragments[fragment.fullKey];
    }

    public setAppFragment(fragment: Fragment) {
        if (!this.definition.fragments[fragment.fullKey]) {
            throw new Error(`Fragment "${fragment.fullKey}" is not enabled in the pattern!`);
        }
        this.definition.fragments[fragment.fullKey].isApp = true;
    }

    public setNodeState(fragmentKey: string, nodeKey: string, state: any) {
        if (!this.definition.fragments[fragmentKey]) {
            throw new Error(`Fragment "${fragmentKey}" is not enabled in the pattern!`);
        }
        this.definition.fragments[fragmentKey].nodes[nodeKey] = state;
    }
}
