import type {Context} from '../Context.js';
import type {LoadedLoomPattern, PatternList} from './types.js';
import {KeyedObjectList} from '../util/KeyedObjectList.js';
import {sortObjectsByName} from '../util/sortUtils.js';

export async function createPatternList(context: Context): Promise<PatternList> {
    const {events, bundles} = context;
    const list: Array<LoadedLoomPattern> = [];

    for (const bundle of bundles) {
        if (!bundle.patterns || typeof bundle.patterns !== 'object') {
            continue;
        }

        for (const [key, patternFactory] of Object.entries(bundle.patterns)) {
            const pattern = await patternFactory(context);
            list.push({
                ...pattern,
                key,
                bundleKey: bundle.key,
                name: pattern.name ?? key
            });
        }
    }

    return new KeyedObjectList(
        (await events.trigger('pattern:list:filter', {
            bundles,
            list: sortObjectsByName(list)
        })).list
    );
}
