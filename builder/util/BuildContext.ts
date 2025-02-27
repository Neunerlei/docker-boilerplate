import {Paths} from "./Paths";
import {IFs} from "memfs";
import {PartialRegistry} from '../partial/PartialRegistry';
import {PartialStack} from '../partial/PartialStack';

export class BuildContext {
    private readonly _paths: Paths;
    private readonly _fs: IFs;
    private readonly _partialVersions: Map<string, string>;
    private readonly _partialDirs: Map<string, string>;
    private readonly _registryResolver: () => PartialRegistry;
    private readonly _stackResolver: () => PartialStack;
    private _registry: PartialRegistry | undefined;
    private _stack: PartialStack | undefined
    private _appPartialKey: string;

    public constructor(
        paths: Paths,
        fs: IFs,
        registryResolver: () => PartialRegistry,
        stackResolver: () => PartialStack
    ) {
        this._paths = paths;
        this._fs = fs;
        this._partialVersions = new Map();
        this._partialDirs = new Map();
        this._registryResolver = registryResolver;
        this._stackResolver = stackResolver;
    }

    public getPaths(): Paths {
        return this._paths;
    }

    public getFs(): IFs {
        return this._fs;
    }

    public getAppPartialKey(): string {
        if (!this._appPartialKey) {
            throw new Error('Main partial is not set');
        }

        return this._appPartialKey;
    }

    public setAppPartialKey(value: string) {
        this._appPartialKey = value!;
    }

    public getRealPartialKey(key: string): string {
        if (key === this._appPartialKey) {
            return 'app';
        }
        return key;
    }

    public getPartialVersion(partial: string): string {
        return this._partialVersions.get(partial) ?? this.getPartialRegistry().get(partial)?.versions?.[0] ?? 'latest';
    }

    public setPartialVersion(partial: string, version: string): void {
        this._partialVersions.set(partial, version);
    }

    public getPartialDir(partial: string, defaultValue?: string): string {
        return this._partialDirs.get(partial) ?? defaultValue ?? '/app';
    }

    public setPartialDir(partial: string, directory: string): void {
        this._partialDirs.set(partial, directory);
    }

    public getPartialRegistry(): PartialRegistry {
        if (!this._registry) {
            this._registry = this._registryResolver();
        }

        return this._registry;
    }

    public getPartialStack(): PartialStack {
        if (!this._stack) {
            this._stack = this._stackResolver();
        }

        return this._stack;
    }
}
