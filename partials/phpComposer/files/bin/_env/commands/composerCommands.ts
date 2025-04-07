import type {CommandEntrypoint} from '@/types';
import {ComposerContext} from './composer/ComposerContext';

const commands: CommandEntrypoint = async function (program, context) {
    context.registerAddon('composer', new ComposerContext(context));

    program
        .command('composer')
        .description('runs a certain composer command for the project')
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((_, command) => context.composer.exec(command.args));
};

export default commands;
