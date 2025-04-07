import type {CommandEntrypoint} from '@/types.js';

const commands: CommandEntrypoint = async function (program, context) {
    program
        .command('npm')
        .description('runs a certain npm command for the project')
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action(async (options, command) => {
            try {
                await context.docker.executeCommandInService(
                    '%NODE_SERVICE%',
                    ['npm', ...command.args]
                );
            } catch (e) {
            }
        });
};

export default commands;
