import {createLoomFragment} from '@urdev/loom/src/fragments/types.js';

export const mysqlFragment = createLoomFragment({
    name: 'MySQL',
    description: 'Provides a container for executing MySQL code.',
    type: 'database',
    provides: () => ['mysql', 'database', 'sql']
});
