import {PartialDefinition} from "./types";
import {BuildContext} from "../util/BuildContext";

export class PartialContext {
    private readonly _id: Symbol;
    private readonly _buildContext: BuildContext;
    private _definition?: PartialDefinition;

    public constructor(
        id: Symbol,
        buildContext: BuildContext
    ) {
        this._id = id;
        this._buildContext = buildContext;
    }

    public getKey(): string {
        this.loadDefinition();
        return this._definition!.key;
    }

    public getVersion(): string | undefined {
        return this._buildContext.getPartialVersion(this.getKey());
    }

    public getDefinition(): PartialDefinition {
        this.loadDefinition();
        return this._definition!;
    }

    public getAppSourcesDirectory(): string {
        return this._buildContext.getPartialDir(this.getKey());
    }

    public getBuildContext(): BuildContext {
        return this._buildContext;
    }

    public isMainPartial(): boolean {
        return this._buildContext.getAppPartialKey() === this.getKey();
    }

    public isLoadedPartial(key: string): boolean {
        return this._buildContext.getPartialRegistry().has(key);
    }

    public getLoadedPartials(): string[] {
        return this._buildContext.getPartialRegistry().getKeys();
    }

    public isSelectedPartial(key: string): boolean {
        return this._buildContext.getPartialRegistry().has(key);
    }

    public getSelectedPartials(): string[] {
        return this._buildContext.getPartialStack().getKeys();
    }

    private loadDefinition(): void {
        if (!this._definition) {
            this._definition = this._buildContext.getPartialRegistry().getById(this._id);
            if (!this._definition) {
                throw new Error('Failed to load the definition');
            }
        }
    }
}
