import type {AddonEntrypoint} from '@/loadAddons.js';

export const addon: AddonEntrypoint = async (context) => ({
    commands: async (program) => {
        program
            .command('npm')
            .description('runs a certain npm command for the project')
            .allowExcessArguments(true)
            .allowUnknownOption(true)
            .helpOption(false)
            .action(async (options, command) => {
                await context.docker.executeCommandInService('%NODE_SERVICE%', ['npm', ...command.args], {interactive: true});
            });
    }
});
