import {indentText} from '@builder/util/textUtils.js';
import type {PartialRegistry} from '@builder/partial/PartialRegistry.js';

export class Summary {
    private readonly _globalMessages: Set<string> = new Set();

    public addGlobalMessage(message: string): this {
        this._globalMessages.add(message);
        return this;
    }

    public async render(partials: PartialRegistry): Promise<{
        global: string,
        standalonePartials: string,
        partials: string
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
}

export class PartialSummary {
    private readonly _globalMessages: Set<string> = new Set();
    private readonly _localMessages: Set<string> = new Set();

    public addGlobalMessage(message: string): this {
        this._globalMessages.add(message);
        return this;
    }

    public addMessage(message: string): this {
        this._localMessages.add(message);
        return this;
    }

    public getMessages(): {
        global: Set<string>,
        local: Set<string>
    } {
        return {
            global: this._globalMessages,
            local: this._localMessages
        };
    }
}
