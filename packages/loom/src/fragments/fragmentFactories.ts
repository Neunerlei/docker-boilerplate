import type {Context} from '../Context.js';
import type {
    FragmentNode,
    FragmentNodeCallableOptions,
    FragmentNodeCallableOptionsWithState,
    FragmentTypeHandlerList,
    LoadedFragmentTypeDefinition,
    LoomFragmentFactory
} from './types.js';
import {Fragment, type FragmentDefRef} from './Fragment.js';
import {FragmentList} from './FragmentList.js';
import {sortObjectsByOrder} from '../util/sortUtils.js';
import {KeyedObjectList} from '../util/KeyedObjectList.js';
import {logBootWarning} from '../util/bootLog.js';
import {FragmentWithPatternInfo} from './FragmentWithPatternInfo.js';

export async function createFragmentTypeHandlerList({bundles, events}: Context): Promise<FragmentTypeHandlerList> {
    const list: Array<LoadedFragmentTypeDefinition> = [];

    for (const bundle of bundles) {
        if (!bundle.fragmentTypes || typeof bundle.fragmentTypes !== 'object') {
            continue;
        }

        for (const [key, definition] of Object.entries(bundle.fragmentTypes)) {
            if (typeof definition !== 'object' || typeof definition.handler !== 'function') {
                logBootWarning(`Fragment type "${key}" in bundle "${bundle.key}" does not have a valid handler! Skipping...`);
                continue;
            }
            list.push({
                key,
                bundleKey: bundle.key,
                ...definition
            });
        }
    }

    return new KeyedObjectList(
        (await events.trigger('fragment:type:list:filter', {
            bundles,
            list: sortObjectsByOrder(list)
        })).list
    );
}

export async function createFragmentList(context: Context) {
    const {bundles, events} = context;
    const list: Array<Fragment> = [];

    for (const bundle of bundles) {
        if (!bundle.fragments || typeof bundle.fragments !== 'object') {
            continue;
        }

        for (const [key, factory] of Object.entries(bundle.fragments)) {
            const fragment = await createFragment(context, bundle.key, key, factory);
            if (fragment) {
                list.push(fragment);
            }
        }
    }

    return new FragmentList(
        (await events.trigger('fragment:list:filter', {
            bundles,
            list: sortObjectsByOrder(list)
        })).list
    );
}

async function createFragment(context: Context, bundleKey: string, key: string, factory: LoomFragmentFactory) {
    const defRef: FragmentDefRef = {current: undefined};
    const fragment = new Fragment(defRef, key, bundleKey);
    const {events, typeHandlers} = context;

    const definition = defRef.current = (await events.trigger(
        'fragment:definition:filter',
        {bundleKey, key, definition: await factory(context)}
    )).definition;

    if (!definition.type) {
        logBootWarning(`Fragment "${key}" in bundle "${bundleKey}" does not have a type! Skipping...`);
        return undefined;
    }

    if (!typeHandlers.keys.includes(definition.type)) {
        logBootWarning(`Fragment "${key}" in bundle "${bundleKey}" has an unknown type "${definition.type}"! Skipping...`);
        return undefined;
    }

    return fragment;
}

export function createFragmentCallableOptions(
    context: Context,
    node: FragmentNode
): FragmentNodeCallableOptions {
    const {pattern, fragments, summary} = context;

    return {
        fragment: new FragmentWithPatternInfo(fragments.get(node.fragmentKey)!, pattern),
        pattern,
        context,
        addSummaryMessage: (message: string) => summary.addFragmentMessage(node.fragmentKey, message)
    };
}

export function createFragmentCallableOptionsWithState(
    context: Context,
    node: FragmentNode
): FragmentNodeCallableOptionsWithState {
    return {
        ...createFragmentCallableOptions(context, node),
        state: context.pattern.getNodeState(node.fragmentKey, node.key) ?? {}
    };
}
