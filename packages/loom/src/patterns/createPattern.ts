import {type Context, extendContext} from '../Context.js';
import {Pattern} from './Pattern.js';
import type {LoadedLoomPattern} from './types.js';
import {PatternWriter} from './PatternWriter.js';
import {runTypeHandlers} from './creation/runTypeHandlers.js';
import {prepareNodeList} from '../fragments/initContextFragmentNodeList.js';
import {createFragmentCallableOptions} from '../fragments/fragmentFactories.js';
import * as prompts from '@inquirer/prompts';
import {registerFragmentEvents, registerNodeEvents} from '../fragments/eventRegistration.js';
import {askForAppFragment} from './creation/askForAppFragment.js';

export async function createPattern(context: Context): Promise<Pattern> {
    console.log('To create a new pattern, please answer a few questions:');
    const patternDefinition: LoadedLoomPattern = {
        name: 'Generic Pattern',
        description: 'A completely custom pattern',
        key: '@generic',
        bundleKey: 'built-in',
        fragments: {}
    };

    const {nodeListGetter, nodeListBuilder} = prepareNodeList(context);

    const pattern = new Pattern(patternDefinition, context.fragments, nodeListGetter);

    // Prepare the context for the pattern creation
    extendContext(context, 'pattern', pattern);
    extendContext(context, 'patternWriter', new PatternWriter(patternDefinition, context.fragments, nodeListGetter));

    await runTypeHandlers(context);
    await registerFragmentEvents(context);
    await askForAppFragment(context);
    await nodeListBuilder();
    await registerNodeEvents(context);
    await initNodeStatesForCreation(context);

    await context.events.trigger('pattern:created', {pattern});

    return pattern;
}

async function initNodeStatesForCreation(context: Context) {
    const {patternWriter} = context;
    if (!patternWriter) {
        throw new Error('Pattern writer is not defined, ask for node states failed');
    }

    let registryLoaded = false;
    try {
        context.docker;
        registryLoaded = true;
    } catch (e) {
        // Silence
    }

    if (registryLoaded) {
        throw new Error('The docker registry is already loaded, ask for node states failed');
    }

    for (const node of patternWriter.nodes) {
        const {fragmentKey, key} = node;
        let state = patternWriter.getNodeState(fragmentKey, key) ?? {};
        const options = {
            ...createFragmentCallableOptions(context, node),
            prompts
        };

        if (typeof node.state === 'function') {
            const result = await node.state(state, options);
            if (result) {
                state = result;
                patternWriter.setNodeState(fragmentKey, key, result);
            }
        } else {
            patternWriter.setNodeState(fragmentKey, key, state);
        }
    }
}
