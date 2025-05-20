import type {Context} from '../Context.js';

export function showSummary({summary, pattern}: Context) {
    console.log('GLOBAL', summary.globalMessages);
    console.log('PER FRAGMENT', summary.fragmentMessages);

}

/*

    public getMessages(): Promise<{
        global: string,
        fragments: string
    }> {
        const global = new Set<string>(this._globalMessages);
        const standalonePartialMessages = new Set<string>();
        const partialMessages = new Set<string>();

        for (const partial of await partials.sortedUsed) {
            const {summary, definition} = partial;

            const {global: _global, local: _local} = summary.getMessages();
            for (const message of _global) {
                global.add(message);
            }

            const setPartialMessage = (_message: string) => {
                if (definition.standalone) {
                    standalonePartialMessages.add(_message);
                } else {
                    partialMessages.add(_message);
                }
            };

            if (partial.key !== 'root') {
                setPartialMessage(indentText('✔ ' + partial.name + ' (' + partial.version + ')', 1));
            }

            for (const message of _local) {
                setPartialMessage(indentText(' - ' + message, 2));
            }
        }

        return {
            global: Array.from(global).join('\n'),
            standalonePartials: Array.from(standalonePartialMessages).join('\n'),
            partials: Array.from(partialMessages).join('\n')
        };
    }
 */
