import {typeHandlerPrompts} from './typeHandlerPrompts.js';
import type {Context} from '../../Context.js';
import type {Fragment} from '../../fragments/Fragment.js';

export async function runTypeHandlers(context: Context) {
    const {events, typeHandlers, patternWriter} = context;
    if (!patternWriter) {
        throw new Error('Pattern writer is not defined, cannot run type handlers');
    }

    for (const {key, handler} of typeHandlers) {
        const fragmentsForType = context.fragments.getAllOfType(key);
        if (fragmentsForType.length === 0) {
            continue;
        }

        const filteredFragmentsForType = await filterFragmentsByIf(fragmentsForType, context);
        if (filteredFragmentsForType.length === 0) {
            continue;
        }

        const oldFragments = filteredFragmentsForType
            .filter(f => patternWriter.fragmentKeys.includes(f.fullKey));
        const newFragments = await handler(
            filteredFragmentsForType, oldFragments, {context, prompts: typeHandlerPrompts});
        await patternWriter.updateFragments(newFragments, oldFragments);
    }

    await events.trigger('fragment:list:selected', {pattern: patternWriter});
}

async function filterFragmentsByIf(
    fragments: Fragment[],
    context: Context
): Promise<Array<Fragment>> {
    return (await Promise.all(
        fragments.map(async fragment => {
            if (typeof fragment.definition.if === 'function') {
                const result = await fragment.definition.if(context.pattern, {fragment, context});
                return result ? fragment : null;
            }
            return fragment;
        })
    )).filter((fragment): fragment is Fragment => fragment !== null);
}
