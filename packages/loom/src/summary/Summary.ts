export class Summary {
    private readonly _globalMessages: Set<string> = new Set();
    private readonly _fragmentMessages: Map<string, Set<string>> = new Map();

    public addGlobalMessage(message: string): this {
        this._globalMessages.add(message);
        return this;
    }

    public addFragmentMessage(fragmentKey: string, message: string): this {
        if (!this._fragmentMessages.has(fragmentKey)) {
            this._fragmentMessages.set(fragmentKey, new Set());
        }
        this._fragmentMessages.get(fragmentKey)!.add(message);
        return this;
    }

    public get globalMessages(): string[] {
        return Array.from(this._globalMessages);
    }

    public get fragmentMessages(): Map<string, string[]> {
        const result = new Map<string, string[]>();
        for (const [key, messages] of this._fragmentMessages) {
            result.set(key, Array.from(messages));
        }
        return result;
    }

}
