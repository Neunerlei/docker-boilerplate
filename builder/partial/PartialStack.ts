import {PartialDefinition, PartialList} from "./types";
import {RecursiveRequirementsResolver} from "./RecursiveRequirementsResolver";
import {PartialKeySorter} from "./PartialKeySorter";

export class PartialStack {
    private _partials: PartialList = {};
    private _requirementResolver: RecursiveRequirementsResolver;

    public constructor(requirementResolver: RecursiveRequirementsResolver) {
        this._requirementResolver = requirementResolver;
    }

    public has(key: string): boolean {
        return !!this._partials[key];
    }

    public async add(partial: PartialDefinition): Promise<this> {
        if (this._partials[partial.key]) {
            throw new Error(`Addon with key "${partial.key}" already present in the stack`);
        }

        this._partials[partial.key] = partial;
        await this._requirementResolver.resolveRequires(partial);

        return this;
    }

    public getKeys(): string[] {
        return Object.keys(this._partials);
    }

    public async getSortedKeys(): Promise<string[]> {
        const standaloneKeys = Object.keys(this._partials).filter(key => this._partials[key].standalone);
        const nonStandaloneKeys = Object.keys(this._partials).filter(key => !this._partials[key].standalone);
        const sorter = new PartialKeySorter();
        standaloneKeys.forEach(key => sorter.addKey(key));
        nonStandaloneKeys.forEach(key => sorter.addKey(key));

        for (const key in this._partials) {
            const definition = this._partials[key];
            if (definition.sort) {
                const rules = sorter.getRules(key);
                await definition.sort(rules);
            }
        }

        return sorter.getSorted();
    }
}
