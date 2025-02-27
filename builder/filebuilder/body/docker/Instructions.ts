type InstructionItem = {
    key: string;
    value: string;
}

export class Instructions {
    private readonly _rootAlias: string;
    private readonly _serviceAlias: string;
    private _instructions: InstructionItem[] = [];

    public constructor(rootAlias: string, serviceAlias: string) {
        this._rootAlias = rootAlias;
        this._serviceAlias = serviceAlias
    }

    public has(key: string): boolean {
        return this._instructions.some(item => item.key === key);
    }

    public get(key: string): string | undefined {
        const item = this._instructions.find(item => item.key === key);
        return item ? item.value.trim() : undefined;
    }

    public addDefaultFrom(): this {
        if (this.has('from')) {
            throw new Error('Instruction with key "from" already exists. Remove it before adding a default one.');
        }

        this._instructions.unshift({key: 'from', 'value': `FROM ${this._rootAlias} AS ${this._serviceAlias}`});
        return this;
    }

    public add(key: string, value: string, override?: boolean): this {
        if (this.handleAddOverride(key, value, override, (key, value) => {
            this._instructions.map(item => {
                if (item.key === key) {
                    item.value = value;
                }
            });
        })) {
            return this;
        }

        this._instructions.push({key, value});
        return this;
    }

    public addBefore(key: string, beforeKey: string, value: string, override?: boolean): this {
        this.handleAddOverride(key, value, override, (key) => {
            this._instructions = this._instructions.filter(item => item.key !== key);
        });

        const index = this._instructions.findIndex(item => item.key === beforeKey);
        if (index === -1) {
            throw new Error(`Instruction with key "${beforeKey}" does not exist.`);
        }

        this._instructions.splice(index, 0, {key, value});
        return this;
    }

    public addAfter(key: string, afterKey: string, value: string, override?: boolean): this {
        this.handleAddOverride(key, value, override, (key) => {
            this._instructions = this._instructions.filter(item => item.key !== key);
        });

        const index = this._instructions.findIndex(item => item.key === afterKey);
        if (index === -1) {
            throw new Error(`Instruction with key "${afterKey}" does not exist.`);
        }

        this._instructions.splice(index + 1, 0, {key, value});
        return this;
    }

    public remove(key: string): this {
        this._instructions = this._instructions.filter(item => item.key !== key);
        return this;
    }

    public getInstructions(): InstructionItem[] {
        return this._instructions;
    }

    public getKeys(): string[] {
        return this._instructions.map(item => item.key);
    }

    public toString(): string {
        return this._instructions.map(item => item.value.trim()).join('\n\n');
    }

    public clear(): void {
        this._instructions = [];
    }

    private handleAddOverride(
        key: string,
        value: string,
        override: boolean | undefined,
        onOverride: (key: string, value: string) => void
    ): boolean {
        if (this.has(key)) {
            if (!override) {
                throw new Error(`Instruction with key "${key}" already exists. To override existing instructions, use the "override" parameter.`);
            }

            onOverride(key, value);
            return true;
        }

        return false;
    }
}
