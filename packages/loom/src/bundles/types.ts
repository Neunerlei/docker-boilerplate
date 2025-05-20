import type {LoomPatternFactory} from '../patterns/types.js';
import type {FragmentTypeDefinition, LoomFragmentFactory} from '../fragments/types.js';
import type {EventBus} from '../EventBus.js';
import type {KeyedObjectList} from '../util/KeyedObjectList.js';
import type {Context} from '../Context.js';

export interface LoomBundle {
    order?: number;
    events?: (events: EventBus) => Promise<void>;
    patterns?: Record<string, LoomPatternFactory>;
    fragmentTypes?: Record<string, FragmentTypeDefinition>;
    fragments?: Record<string, LoomFragmentFactory>;
}

export interface LoadedLoomBundle extends LoomBundle {
    key: string;
    order: number;
}

export type LoomBundleFactory = (context: Context) => Promise<LoomBundle>;

export type BundleList = KeyedObjectList<LoadedLoomBundle>;

export function createLoomBundle(definition: LoomBundle): LoomBundleFactory {
    return async () => definition;
}
