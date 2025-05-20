import type {Context} from '../Context.js';
import {createFragmentCallableOptionsWithState} from './fragmentFactories.js';

export async function registerFragmentEvents(context: Context) {
    const {events, pattern: {fragments}} = context;

    for (const fragment of fragments) {
        if (fragment.definition.events) {
            await fragment.definition.events(events, {fragment, context});
        }
    }
}

export async function registerNodeEvents(context: Context) {
    const {events, pattern: {nodes}} = context;
    for (const node of nodes) {
        if (typeof node.events === 'function') {
            await node.events?.(events, createFragmentCallableOptionsWithState(context, node));
        }
    }
}
