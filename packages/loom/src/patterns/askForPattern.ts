import type {Context} from '../Context.js';
import type {LoadedLoomPattern} from './types.js';

export async function askForPattern(context: Context): Promise<LoadedLoomPattern | undefined> {
    if (context.patterns.size === 0) {
        return undefined;
    }

    throw new Error('Pattern selection is not implemented yet');
}
