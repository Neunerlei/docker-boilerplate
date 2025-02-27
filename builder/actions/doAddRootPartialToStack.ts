import {PartialStack} from '../partial/PartialStack';
import {PartialRegistry} from '../partial/PartialRegistry';

export async function doAddRootPartialToStack(stack: PartialStack, registry: PartialRegistry) {
    const root = registry.get('root');
    if (!root) {
        return;
    }

    await stack.add(root);
}
