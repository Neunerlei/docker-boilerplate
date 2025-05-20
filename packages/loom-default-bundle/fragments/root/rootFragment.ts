import {createLoomFragment} from '@urdev/loom/src/fragments/types.js';

export const rootFragment = createLoomFragment({
    type: 'always',
    provides: () => ['urdev', 'root', 'dockerfile', 'docker-compose']
});
