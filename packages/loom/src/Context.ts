import type {CommonUi} from '@loom/CommonUi.js';
import type {EventBus} from '@loom/EventBus.js';
import type {IFs} from 'memfs';
import type {Summary} from '@loom/summary/Summary.js';
import type {Paths} from '@loom/Paths.js';
import type {FragmentList} from '@loom/fragments/FragmentList.js';
import type {FragmentTypeHandlerList} from '@loom/fragments/types.js';
import type {BundleList} from '@loom/bundles/types.js';
import type {PatternList} from '@loom/patterns/types.js';
import type {Pattern} from '@loom/patterns/Pattern.js';
import {Command} from 'commander';
import type {PatternWriter} from '@loom/patterns/PatternWriter.js';
import type {DockerConfig} from './docker/DockerConfig.js';

export interface Context {
    readonly paths: Paths;
    readonly events: EventBus;
    readonly ui: CommonUi;
    readonly fs: IFs;
    readonly summary: Summary;
    readonly program: Command;
    readonly bundles: BundleList;
    readonly typeHandlers: FragmentTypeHandlerList;
    readonly fragments: FragmentList;
    readonly patterns: PatternList;
    readonly pattern: Pattern;
    readonly patternWriter: PatternWriter | undefined;
    readonly docker: DockerConfig;
}

const targetProp = Symbol('targetProp');

export function createContext(
    paths: Paths,
    events: EventBus,
    ui: CommonUi,
    fs: IFs,
    summary: Summary
): Context {
    return new Proxy({
        paths,
        events,
        ui,
        fs,
        summary,
        program: new Command()
    } as Context, {
        get(target, prop) {
            if (prop === targetProp) {
                return target;
            }
            if (prop in target) {
                return target[prop as unknown as keyof Context];
            }
            if (prop === 'patternWriter') {
                return undefined;
            }
            throw new Error(`Property ${String(prop)} is not available in the context. Maybe you are to early?`);
        }
    });
}

export function extendContext(context: Context, key: keyof Context, value: object | (() => object)): Context {
    const target = (context as any)[targetProp];
    if (typeof value === 'function') {
        let _value: any;
        Object.defineProperty(target, key, {
            get() {
                return _value ??= value();
            },
            enumerable: true,
            configurable: true
        });
    } else {
        target[key] = value;
    }
    return context;
}
