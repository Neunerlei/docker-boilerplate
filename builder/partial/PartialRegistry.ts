import {Partial, PartialDefinition} from "./types";
import {PartialContext} from "./PartialContext";
import {BuildContext} from "../util/BuildContext";

interface AddonRegistryEntry {
    id: Symbol;
    context: PartialContext;
    definition: PartialDefinition;
}

export class PartialRegistry {
    private readonly _context: BuildContext;
    private readonly _partials: Map<string, AddonRegistryEntry> = new Map();
    private readonly _keysById: Map<Symbol, string> = new Map();

    public constructor(context: BuildContext) {
        this._context = context;
    }

    public register(partial: Partial) {
        if (!partial.__partialId) {
            partial.__partialId = Symbol('partial-' + this._partials.size);
        }

        const id = partial.__partialId;
        const context = new PartialContext(id, this._context);

        const definition = partial(context);
        const key: any = definition.key;
        if (typeof key !== 'string' || key.trim() === '') {
            throw new Error('Partial key must be a non-empty string');
        }

        if (this._partials.has(key)) {
            throw new Error(`Partial with key "${key}" already exists`);
        }

        this._partials.set(key, {id, context, definition});
        this._keysById.set(id, key);
    }

    public has(key: string): boolean {
        return this._partials.has(key);
    }

    public get(key: string): PartialDefinition | undefined {
        return this._partials.get(key)?.definition;
    }

    public getById(id: Symbol): PartialDefinition | undefined {
        const key = this._keysById.get(id);

        if (!key) {
            return undefined;
        }

        return this.get(key);
    }

    public getStandalone(): PartialDefinition[] {
        return Array.from(this._partials.values())
            .filter(entry => entry.definition.standalone)
            .map(entry => entry.definition);
    }

    public getNonStandalone(): PartialDefinition[] {
        return Array.from(this._partials.values())
            .filter(entry => !entry.definition.standalone)
            .map(entry => entry.definition);
    }

    public async getNonStandaloneForSelectedStandaloneKeys(keys: string[]): Promise<PartialDefinition[]> {
        const possibleKeys: string[] = [];
        for (const item of Array.from(this._partials.values())) {
            if (item.definition.standalone) {
                continue;
            }

            if (keys.includes(item.definition.key)) {
                continue;
            }

            if (item.definition.selectable === false) {
                continue;
            }

            if (typeof item.definition.selectable === 'function') {
                if (await item.definition.selectable(keys)) {
                    possibleKeys.push(item.definition.key);
                }
            } else {
                possibleKeys.push(item.definition.key);
            }
        }

        return possibleKeys.map(key => this.get(key)!);
    }

    public getKeys(): string[] {
        return Array.from(this._partials.keys());
    }
}
