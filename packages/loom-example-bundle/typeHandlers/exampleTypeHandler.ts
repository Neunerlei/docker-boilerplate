import type {LoomFragmentTypeHandler} from '@urdev/loom/src/fragments/types.js';

export const exampleTypeHandler: LoomFragmentTypeHandler = async (
    fragments,
    state,
    {prompts}
) =>
    prompts.confirmGate({
        message: `Do you want to select "example" fragments?`,
        descriptionTitle: 'Examples, demos, and stuff',
        description: 'These fragments act as a demo to teach you how to extend the loom.',
        state,
        gated: () => prompts.selectMultipleFragments({
            message: 'Select a fragment',
            description: 'Select the fragments you want to include in your project.',
            fragments,
            state
        })
    });
