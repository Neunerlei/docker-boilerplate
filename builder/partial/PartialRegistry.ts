import {PartialDefinition, PartialFactory} from './types';
import {Partial, type PartialState} from './Partial.js';
import {BuildContext} from '../util/BuildContext';
import {PartialSummary} from '@builder/util/Summary.js';
import {PartialKeySorter} from '@builder/partial/PartialKeySorter.js';
import {RecursiveRequirementsResolver} from '@builder/partial/RecursiveRequirementsResolver.js';

export class PartialRegistry {
    private readonly _context: BuildContext;
    private readonly _requirementResolver: RecursiveRequirementsResolver;
    private readonly _usedKeys: Set<string> = new Set();
    private _sortedUsedKeys?: string[];
    private _appKey: string | undefined;
    private readonly _partials: Map<string, Partial> = new Map();
    private readonly _states: Map<string, PartialState> = new Map();

    public constructor(context: BuildContext) {
        this._context = context;
        this._requirementResolver = new RecursiveRequirementsResolver();
    }

    public get app(): Partial {
        return this.get('app')!;
    }

    public get partials(): Record<string, Partial> {
        return Object.fromEntries(this._partials);
    }

    public get all(): Partial[] {
        return Array.from(this._partials.values());
    }

    public get standalone(): Partial[] {
        return Array.from(this._partials.values())
            .filter(entry => entry.definition.standalone);
    }

    public get used(): Partial[] {
        return Array.from(this._usedKeys)
            .map(key => this._partials.get(key)!);
    }

    public get usedWithoutRoot(): Partial[] {
        return this.used.filter(partial => partial.key !== 'root');
    }

    public get sortedUsed(): Promise<Partial[]> {
        return new Promise(async (resolve) => {
            if (!this._sortedUsedKeys) {
                const allKeys = Array.from(this._usedKeys);
                const standaloneKeys = allKeys.filter(key => this._partials.get(key)!.definition.standalone);
                const nonStandaloneKeys = allKeys.filter(key => !standaloneKeys.includes(key));
                const sorter = new PartialKeySorter();
                standaloneKeys.forEach(key => sorter.addKey(key));
                nonStandaloneKeys.forEach(key => sorter.addKey(key));

                const promises: Array<Promise<void>> = [];
                for (const key of allKeys) {
                    const definition = this._partials.get(key)!.definition;
                    if (definition && definition.sort) {
                        const rules = sorter.getRules(key);
                        promises.push(definition.sort(rules));
                    }
                }

                await Promise.all(promises);

                this._sortedUsedKeys = sorter.getSorted();
            }

            resolve(this._sortedUsedKeys.map(key => this._partials.get(key)!));
        });
    }

    public get usedStandalone(): Partial[] {
        return Array.from(this._usedKeys)
            .filter(key => this._partials.get(key)!.definition.standalone)
            .map(key => this._partials.get(key)!);
    }

    public get nonStandaloneForUsed(): Promise<Partial[]> {
        return new Promise(async (resolve) => {
            const possibleKeys: string[] = [];
            const usedKeys = Array.from(this._usedKeys);

            for (const partial of this._partials.values()) {
                const {definition} = partial;
                if (definition.standalone) {
                    continue;
                }

                if (this._usedKeys.has(definition.key)) {
                    continue;
                }

                if (definition.selectable === false) {
                    continue;
                }

                if (typeof definition.selectable === 'function') {
                    if (await definition.selectable(usedKeys)) {
                        possibleKeys.push(definition.key);
                    }
                } else {
                    possibleKeys.push(definition.key);
                }
            }

            resolve(possibleKeys.map(key => this.get(key)!));
        });
    }

    public register(factory: PartialFactory) {
        const state: PartialState = {};
        const partial = new Partial(state, this._context, new PartialSummary());
        const definition = factory(partial);
        state.definition = definition;
        const key: any = definition.key;
        if (typeof key !== 'string' || key.trim() === '') {
            throw new Error('Partial key must be a non-empty string');
        }

        if (this._partials.has(key)) {
            throw new Error(`Partial with key "${key}" already exists`);
        }

        this._partials.set(key, partial);
        this._states.set(key, state);
    }

    public async use(key: string): Promise<void> {
        if (!this.has(key)) {
            throw new Error(`Partial with key "${key}" does not exist`);
        }
        delete this._sortedUsedKeys;
        this._usedKeys.add(key);
        await this._requirementResolver.resolveRequires(this.get(key)!);
    }

    public useAsApp(key: string): void {
        if (this._appKey) {
            throw new Error(`App partial key already set to "${this._appKey}"`);
        }
        if (!this.has(key)) {
            throw new Error(`Partial with key "${key}" does not exist`);
        }
        if (!this._usedKeys.has(key)) {
            throw new Error(`Partial with key "${key}" is not used, so it cannot be set as app`);
        }
        this._appKey = key;
        this._states.get(key)!.isApp = true;
    }

    public useVersionOf(key: string, version: string): void {
        if (!this.has(key)) {
            throw new Error(`Partial with key "${key}" does not exist`);
        }
        if (!this._usedKeys.has(key)) {
            throw new Error(`Partial with key "${key}" is not used, you can not use it in a specific version`);
        }
        this._states.get(key)!.version = version;
    }

    public useOutputDirectoryFor(key: string, outputDirectory: string): void {
        if (!this.has(key)) {
            throw new Error(`Partial with key "${key}" does not exist`);
        }
        if (!this._usedKeys.has(key)) {
            throw new Error(`Partial with key "${key}" is not used, so you can not set an output directory for it`);
        }
        this._states.get(key)!.outputDirectory = outputDirectory;
    }

    public isUsed(key: string): boolean {
        return this._usedKeys.has(this.normalizeKey(key));
    }

    public isApp(key: string): boolean {
        return this.get(key)?.isApp ?? false;
    }

    public has(key: string): boolean {
        return this._partials.has(this.normalizeKey(key));
    }

    public get(key: string): Partial | undefined {
        return this._partials.get(this.normalizeKey(key));
    }

    public getOrFail(key: string): Partial {
        const partial = this.get(key);
        if (!partial) {
            throw new Error(`Partial "${key}" not found`);
        }
        return partial;
    }

    public getStandalone(): PartialDefinition[] {
        return Array.from(this._partials.values())
            .filter(entry => entry.definition.standalone)
            .map(entry => entry.definition);
    }

    public normalizeKey(key: string): string {
        if (key === 'app') {
            if (!this._appKey) {
                throw new Error('App partial key not set');
            }
            return this._appKey;
        }
        return key;
    }
}
