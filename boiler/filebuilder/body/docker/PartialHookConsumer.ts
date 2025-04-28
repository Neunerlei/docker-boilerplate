import {joinLines} from '@boiler/filebuilder/body/docker/joinLines.js';

export type WellKnownHooks =
// This hook should be executed in the "root" section of your partial.
// It should be used to install additional dependencies in that container.
    'root:dependencies'
    // This hook should be executed in the "prod" section of your partial.
    // It should be used to inject "copy" commands from builders like node.js or similar.
    | 'prod:copy'
    // Highly specialized hook for the "composer" partial to inject itself into the php prod container.
    // Consider this internal-ish.
    | 'php:composer-autoload'
    ;
type HookGetter = (partialName: string, hookName: string) => Hook;

export class Hooks {
    private readonly _hookGetter: HookGetter;

    constructor() {
        const hooks = new Map<string, Map<string, Hook>>();
        this._hookGetter = (partialName: string, hookName: string) => {
            if (!hooks.has(partialName)) {
                hooks.set(partialName, new Map());
            }
            const partialHooks = hooks.get(partialName)!;
            if (!partialHooks.has(hookName)) {
                partialHooks.set(hookName, new Hook(hookName));
            }
            return partialHooks.get(hookName)!;
        };
    }

    public addToHook(partialKey: string, hookName: WellKnownHooks | string, command: string): this {
        (this._hookGetter(partialKey, hookName)).addContent(command);
        return this;
    }

    public getProvider(partialKey: string): ServiceSectionHookProvider {
        return new ServiceSectionHookProvider(this._hookGetter, partialKey);
    }
}

export class Hook {
    private readonly _name: WellKnownHooks | string;
    private readonly _contents: Array<string> = [];

    constructor(name: WellKnownHooks | string) {
        this._name = name;
    }

    public get name(): WellKnownHooks | string {
        return this._name;
    }

    public addContent(content: string): this {
        this._contents.push(content);
        return this;
    }

    public toString(): string {
        return joinLines(this._contents);
    }
}

export class ServiceSectionHookProvider {
    private readonly _hookGetter: HookGetter;
    private readonly _partialKey: string;

    constructor(hookGetter: HookGetter, partialKey: string) {
        this._hookGetter = hookGetter;
        this._partialKey = partialKey;
    }

    public getHook(hookName: WellKnownHooks | string): Hook {
        return this._hookGetter(this._partialKey, hookName);
    }
}
