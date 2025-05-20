import {Fragment} from './Fragment.js';
import type {LoomFragment} from './types.js';
import {KeyedObjectList} from '../util/KeyedObjectList.js';

export class FragmentList extends KeyedObjectList<Fragment, 'fullKey'> {
    public constructor(items: Fragment[]) {
        super(items, 'fullKey');
    }

    public getAllOfType(type: LoomFragment['type']): Fragment[] {
        return this.items.filter(fragment => fragment.definition.type === type);
    }
}
