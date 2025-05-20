import {type Context} from '../Context.js';
import type {FragmentNode, FragmentNodeList} from './types.js';
import {KeyedObjectList} from '../util/KeyedObjectList.js';
import {sortObjectsByOrder} from '../util/sortUtils.js';
import {createFragmentCallableOptions} from './fragmentFactories.js';


export function prepareNodeList(context: Context): {
    nodeListGetter: () => FragmentNodeList,
    nodeListBuilder: () => Promise<void>
} {
    let nodeList: FragmentNodeList | undefined;
    const getter = () => {
        if (!nodeList) {
            throw new Error('Node list is not initialized');
        }
        return nodeList;
    };
    const build = async () => {
        nodeList = await createFragmentNodeList(context);
        await context.events.trigger('fragment:nodes:ready', {nodes: nodeList});
    };
    return {nodeListGetter: getter, nodeListBuilder: build};
}

async function createFragmentNodeList(context: Context): Promise<FragmentNodeList> {
    const {pattern, events, fragments} = context;

    const list: Array<FragmentNode> = [];
    for (const requestedFragmentKey of pattern.fragmentKeys) {
        const fragment = fragments.get(requestedFragmentKey);
        if (!fragment) {
            throw new Error(`Fragment "${requestedFragmentKey}" not found!`);
        }

        for (const [key, node] of Object.entries(fragment.definition.nodes)) {
            list.push({
                key,
                fragmentKey: requestedFragmentKey,
                bundleKey: fragment.bundleKey,
                ...node
            });
        }
    }

    return new KeyedObjectList(
        (await events.trigger('fragment:nodes:list:filter', {
            pattern,
            list: sortObjectsByOrder(await filterNodesByIf(list, context))
        })).list
    );
}

async function filterNodesByIf(
    nodes: Array<FragmentNode>,
    context: Context
): Promise<Array<FragmentNode>> {
    return (await Promise.all(
        nodes.map(async node => {
            if (typeof node.if === 'function') {
                const result = await node.if(createFragmentCallableOptions(context, node));
                return result ? node : null;
            }
            return node;
        })
    )).filter((node): node is FragmentNode => node !== null);
}
