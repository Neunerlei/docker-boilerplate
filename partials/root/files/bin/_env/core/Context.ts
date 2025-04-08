import {type Command} from 'commander';
import type {Paths} from './Paths.ts';
import type {EnvPackageInfo} from './types.ts';
import type {Config} from './Config.js';
import type {Platform} from './Platform.ts';
import type {EnvFile} from './EnvFile.ts';
import {Installer} from './installer/Installer.ts';
import type {EventBus} from './EventBus.ts';

export class Context {
    private readonly _pkg: EnvPackageInfo;
    private readonly _env: EnvFile;
    private readonly _paths: Paths;
    private readonly _program: Command;
    private readonly _flags: WritableFlags;
    private readonly _config: Config;
    private readonly _platform: Platform;
    private readonly _events: EventBus;
    private _installer?: Installer;

    public constructor(
        pkg: EnvPackageInfo,
        env: EnvFile,
        paths: Paths,
        program: Command,
        flags: WritableFlags,
        config: Config,
        platform: Platform,
        events: EventBus
    ) {
        this._pkg = pkg;
        this._env = env;
        this._paths = paths;
        this._program = program;
        this._flags = flags;
        this._config = config;
        this._platform = platform;
        this._events = events;
    }

    public get flags(): ReadOnlyFlags {
        return this._flags.getReadOnly();
    }

    public getPkg(): EnvPackageInfo {
        return this._pkg;
    }

    public getEnv(): EnvFile {
        return this._env;
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

    public getPlatform(): Platform {
        return this._platform;
    }

    public getInstaller(): Installer {
        if (!this._installer) {
            this._installer = new Installer(this);
        }
        return this._installer;
    }

    public getEvents(): EventBus {
        return this._events;
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
