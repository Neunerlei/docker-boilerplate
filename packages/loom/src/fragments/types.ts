import type {Context} from '../Context.js';
import type {Fragment} from './Fragment.js';
import type {EventBus} from '../EventBus.js';
import type {KeyedObjectList} from '../util/KeyedObjectList.js';
import type {Pattern} from '../patterns/Pattern.js';
import type {typeHandlerPrompts} from '../patterns/creation/typeHandlerPrompts.js';
import {FragmentWithPatternInfo} from './FragmentWithPatternInfo.js';
import type * as prompts from '@inquirer/prompts';
import type {DockerConfig} from '@loom/docker/DockerConfig.js';

export type LoomFragmentTypeHandler = (fragments: Array<Fragment>, state: Array<Fragment>, opt: {
    context: Context,
    prompts: typeof typeHandlerPrompts,
}) => Promise<Array<Fragment>>
export type FragmentTypeDefinition = {
    order?: number;
    handler: LoomFragmentTypeHandler;
}
export type LoadedFragmentTypeDefinition = { key: string, bundleKey: string } & FragmentTypeDefinition;
export type FragmentTypeHandlerList = KeyedObjectList<LoadedFragmentTypeDefinition>;

export interface FragmentCallableOptions {
    fragment: Fragment,
    context: Context
}

export interface FragmentNodeCallableOptions {
    fragment: FragmentWithPatternInfo,
    pattern: Pattern,
    context: Context,
    addSummaryMessage: (message: string) => void,
}

export interface FragmentNodeCallableOptionsWithState<STATE = any> extends FragmentNodeCallableOptions {
    state: STATE;
}

type AskForNodeStateOptions = FragmentNodeCallableOptions & {
    prompts: typeof prompts
}

export interface FragmentNodeDefinition<STATE = any> {
    order?: number;
    if?: (opt: FragmentNodeCallableOptions) => Promise<boolean>;
    events?: (events: EventBus, opt: FragmentNodeCallableOptionsWithState<STATE>) => Promise<void>;
    state?: (state: Record<string, any>, opt: AskForNodeStateOptions) => Promise<STATE>;
    docker?: (config: DockerConfig, opt: FragmentNodeCallableOptionsWithState<STATE>) => Promise<void>;
    // files?: (collector: BodyBuilderCollector, opt: FragmentCallableOptionsWithState<STATE>) => Promise<void>;
    finalize?: (opt: FragmentNodeCallableOptionsWithState<STATE>) => Promise<void>;
}

export interface FragmentNode<STATE = any> extends FragmentNodeDefinition<STATE> {
    key: string;
    fragmentKey: string;
    bundleKey: string;
}

export type FragmentNodeList = KeyedObjectList<FragmentNode>;

export interface LoomFragment {
    type: 'always' | 'service' | 'support' | 'utility' | 'webserver';
    supports?: string[];

    order?: number;
    /**
     * A human-readable name to display to the user
     */
    name?: string;

    allowRenaming?: boolean;
    allowAsApp?: boolean;

    description?: string;
    /**
     * A list of software versions that this partial provides. The user will be asked to select one of these versions.
     * If only a single version is provided, this version will be used without asking the user.
     */
    versions?: string[];
    provides?: (version: string) => string[];
    if?: (pattern: Pattern, opt: FragmentCallableOptions) => Promise<boolean>;
    events?: (events: EventBus, opt: FragmentCallableOptions) => Promise<void>;
    nodes: Record<string, FragmentNodeDefinition>;
}

export type LoomFragmentFactory = (context: Context) => Promise<LoomFragment>

type LoomFragmentFactoryWithBuilder = LoomFragmentFactory & {
    withNode: <STATE, STATE_LATE = STATE>(key: string, definition: FragmentNodeDefinition<STATE>) => LoomFragmentFactoryWithBuilder;
};

export const createLoomFragment = (
    definition: Omit<LoomFragment, 'nodes'>
): LoomFragmentFactoryWithBuilder => {
    const fullDefinition: LoomFragment = {
        ...definition,
        nodes: {}
    };

    const factory = async () => fullDefinition;
    factory.withNode = (key: string, nodeDefinition: FragmentNodeDefinition) => {
        fullDefinition.nodes[key] = nodeDefinition;
        return factory;
    };

    return factory;
};
