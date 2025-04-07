import {type Command} from 'commander';
import type {Paths} from './Paths.ts';
import type {EnvPackageInfo} from './types.ts';
import type {Config} from './Config.js';

export class Context {
    private readonly _pkg: EnvPackageInfo;
    private readonly _paths: Paths;
    private readonly _program: Command;
    private readonly _flags: WritableFlags;
    private _config: Config;

    public constructor(
        pkg: EnvPackageInfo,
        paths: Paths,
        program: Command,
        flags: WritableFlags,
        config: Config
    ) {
        this._pkg = pkg;
        this._paths = paths;
        this._program = program;
        this._flags = flags;
        this._config = config;
    }

    public get flags(): ReadOnlyFlags {
        return this._flags.getReadOnly();
    }

    public getPkg(): EnvPackageInfo {
        return this._pkg;
    }

    public getPaths(): Paths {
        return this._paths;
    }

    public getProgram(): Command {
        return this._program;
    }

    public getConfig(): Config {
        return this._config;
    }

    public registerAddon(key: string, addon: object) {
        Object.defineProperty(this, key, {
            get: () => addon
        });
    }
}

export class ReadOnlyFlags {
    protected _quiet: boolean;

    public constructor(
        quiet: boolean
    ) {
        this._quiet = quiet;
    }

    public get quiet() {
        return this._quiet;
    }
}

export class WritableFlags extends ReadOnlyFlags {
    public constructor() {
        super(
            false
        );
    }

    public set(key: string, value: any) {
        (this as any)['_' + key] = value;
    }

    public getReadOnly(): ReadOnlyFlags {
        return new ReadOnlyFlags(this._quiet);
    }
}
