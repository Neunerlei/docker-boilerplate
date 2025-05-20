import {type Context, extendContext} from '../Context.js';
import {createFragmentCallableOptionsWithState} from '../fragments/fragmentFactories.js';
import {showSummary} from '../summary/showSummary.js';
import {askForPattern} from '../patterns/askForPattern.js';
import {prepareNodeList} from '../fragments/initContextFragmentNodeList.js';
import {Pattern} from '../patterns/Pattern.js';
import {createPattern} from '../patterns/createPattern.js';
import {registerFragmentEvents, registerNodeEvents} from '../fragments/eventRegistration.js';

export async function defaultCommand(args: any[], context: Context) {
    await initializePattern(context);

    console.log(context.pattern, context.pattern.provides);
    process.exit();

    // files

    await finalizeNodes(context);

    showSummary(context);
}

async function initializePattern(context: Context) {
    let pattern: Pattern | undefined;
    const selectedPattern = await askForPattern(context);
    if (selectedPattern) {
        const {nodeListGetter, nodeListBuilder} = prepareNodeList(context);
        const pattern = new Pattern(selectedPattern, context.fragments, nodeListGetter);

        // These steps are needed to initialize the pattern nodes correctly,
        // in case of pattern creation, the steps are done in the createPattern function
        extendContext(context, 'pattern', pattern);
        await registerFragmentEvents(context);
        await nodeListBuilder();
        await registerNodeEvents(context);
    }
    if (!pattern) {
        pattern = await createPattern(context);
    }

    await context.events.trigger('pattern:ready', {pattern});
}

async function finalizeNodes(context: Context) {
    for (const node of context.pattern.nodes) {
        if (typeof node.finalize === 'function') {
            await node.finalize(createFragmentCallableOptionsWithState(context, node));
        }
    }
}
