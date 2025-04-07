import type {CommandEntrypoint} from '@/types.js';
import {dumpConfigToFile} from '@/Config.js';

const commands: CommandEntrypoint = async (program, context) => {
    program
        .command('config:dump')
        .description('Dumps the current config into the env.config.json')
        .action(() => {
            dumpConfigToFile(context.getPaths());
        });
};

export default commands;
