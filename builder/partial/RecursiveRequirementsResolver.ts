import {PartialDefinition} from "./types";
import {BuildContext} from '../util/BuildContext';

export class RecursiveRequirementsResolver {
    private readonly _context: BuildContext;
    private _path: string[] = [];

    public constructor(context: BuildContext) {
        this._context = context;
    }

    public async resolveRequires(partial: PartialDefinition): Promise<void> {
        const key = partial.key;
        if (!partial.requires) {
            return;
        }

        try {
            if (this._path.includes(key)) {
                const path = this._path.join(' -> ');
                this._path = [];
                throw new Error(`Circular dependency detected: ${path} -> ${key}`);
            }

            this._path.push(key);

            const requiredPartials = Array.isArray(partial.requires) ? partial.requires : await partial.requires();
            const stack = this._context.getPartialStack();
            const registry = this._context.getPartialRegistry();

            for (const requiredKey of requiredPartials) {
                if (stack.has(requiredKey)) {
                    continue;
                }

                const requiredPartial = registry.get(requiredKey);
                if (!requiredPartial) {
                    throw new Error(`Required partial "${requiredKey}" not found`);
                }

                await stack.add(requiredPartial);
            }
        } finally {
            this._path.pop();
        }
    }
}
