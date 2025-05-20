import {createLoomBundle} from '@urdev/loom';
import {rootFragment} from './fragments/root/rootFragment.js';
import {phpFragment} from './fragments/php/phpFragment.js';
import {mysqlFragment} from './fragments/mysql/mysqlFragment.js';

export const bundle = createLoomBundle({
    order: 0,
    fragments: {
        root: rootFragment,
        php: phpFragment,
        mysql: mysqlFragment
    }
});
