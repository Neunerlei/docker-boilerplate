import {createLoomBundle} from '@urdev/loom';
import {whoamiFragment} from './fragments/whoamiFragment.js';
import {exampleTypeHandler} from './typeHandlers/exampleTypeHandler.js';

export const bundle = createLoomBundle({
    order: 0,
    fragmentTypes: {
        example: {
            order: 450,
            handler: exampleTypeHandler
        }
    },
    fragments: {
        whoami: whoamiFragment
    }
});
