import type {KeyedObjectList} from '../util/KeyedObjectList.js';
import type {Context} from '../Context.js';

export interface LoomPatternFragment {
    name: string;
    definitionKey: string;
    isApp: boolean;
    version: string;
    nodes: Record<string, Record<string, any>>;
}

export interface LoomPattern {
    name?: string;
    description?: string;
    fragments: Record<string, LoomPatternFragment>;
}

export interface LoadedLoomPattern extends LoomPattern {
    key: string;
    bundleKey: string;
    name: string;
}

export type LoomPatternFactory = (context: Context) => Promise<LoomPattern> | LoomPattern;

export type PatternList = KeyedObjectList<LoadedLoomPattern>;

export function createLoomPattern(definition: LoomPattern): LoomPatternFactory {
    return async () => definition;
}
