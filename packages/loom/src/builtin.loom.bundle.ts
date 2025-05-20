import type {LoomBundle, LoomBundleFactory} from './bundles/types.js';
import {defaultCommand} from './commands/defaultCommand.js';
import {
    alwaysTypeHandler,
    cacheTypeHandler,
    databaseTypeHandler,
    languageTypeHandler,
    utilityTypeHandler,
    webserverTypeHandler
} from './fragments/defaultTypeHandlers.js';

export const bundle: LoomBundleFactory = async (context): Promise<LoomBundle> => ({
    order: 0,
    events: async events => {
        events.on('commands:define', async ({program}) => {
            program.action((...args: any[]) => defaultCommand(args, context));
        });
    },
    fragmentTypes: {
        always: {
            order: 0,
            handler: alwaysTypeHandler
        },
        language: {
            order: 100,
            handler: languageTypeHandler
        },
        database: {
            order: 200,
            handler: databaseTypeHandler
        },
        cache: {
            order: 300,
            handler: cacheTypeHandler
        },
        webserver: {
            order: 400,
            handler: webserverTypeHandler
        },
        utility: {
            order: 500,
            handler: utilityTypeHandler
        }
    }
});
