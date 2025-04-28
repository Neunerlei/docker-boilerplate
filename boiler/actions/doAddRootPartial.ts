import {PartialRegistry} from '../partial/PartialRegistry';

export async function doAddRootPartial(registry: PartialRegistry) {
    const root = registry.get('root');
    if (!root) {
        return;
    }

    await registry.use('root');
}
