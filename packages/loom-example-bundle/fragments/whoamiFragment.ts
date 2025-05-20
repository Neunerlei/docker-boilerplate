import {createLoomFragment} from '@urdev/loom';

export const whoamiFragment = createLoomFragment({
    name: 'Whoami',
    description: 'A fragment that adds the whoami container to the docker-compose file.',
    versions: ['1.0.0', '1.0.1', '2.0.0'],
    type: 'example',
    provides: () => ['whoami'],
    if: async (pattern) => {
        return pattern.provides.includes('php');
    }
})
    .withNode('default', {
        if: async ({fragment}) => fragment.version !== '2.0.0',
        state: async (state, {prompts}) => ({
            name: await prompts.input({
                message: 'What is your name?',
                default: state.name,
                validate: value => value.length > 0
            })
        }),
        finalize: async ({state, addSummaryMessage, context: {patternWriter}}) => {
            console.log('Name after docker', patternWriter?.json);
            addSummaryMessage(`Finalized whoami fragment with name: ${state.name}`);
        }
    })
    .withNode('next-gen', {
        if: async ({fragment}) => fragment.version === '2.0.0',
        state: async (state, {prompts}) => ({
            age: await prompts.input({
                message: 'How old are you?',
                default: state.age,
                validate: value => value.length > 0
            })
        }),
        finalize: async ({state, addSummaryMessage}) => {
            addSummaryMessage(`Finalized whoami fragment with age: ${state.age}`);
        }
    });
