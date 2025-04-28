import type {Partial} from '@boiler/partial/Partial.js';

export class RecursiveRequirementsResolver {
    private _path: string[] = [];

    public async resolveRequires(partial: Partial): Promise<void> {
        const {key, definition, buildContext: {partials: partialRegistry}} = partial;
        if (!definition.requires) {
            return;
        }

        try {
            if (this._path.includes(key)) {
                const path = this._path.join(' -> ');
                this._path = [];
                throw new Error(`Circular dependency detected: ${path} -> ${key}`);
            }

            this._path.push(key);

            const requiredKeys = Array.isArray(definition.requires) ? definition.requires : await definition.requires();

            for (const requiredKey of requiredKeys) {
                if (partialRegistry.isUsed(requiredKey)) {
                    continue;
                }

                if (!partialRegistry.has(requiredKey)) {
                    throw new Error(`The partial "${key}" requires "${requiredKey}", but it is not available`);
                }

                await partialRegistry.use(requiredKey);
            }
        } finally {
            this._path.pop();
        }
    }
}
