import type {AddonEntrypoint} from '@/loadAddons.ts';
import {EnvFileMigrator} from '@/env/EnvFileMigrator.ts';

export const addon: AddonEntrypoint = async (context) => ({
    commands: async (program) => {
        program
            .command('env:reset')
            .description('Resets your current .env file back to the default definition')
            .action(async () => {
                await ((new EnvFileMigrator(context.events, context.paths)).setForced(true).migrate(context.env));
            });

        program
            .command('env-npm')
            .description('Runs an npm command for the bin/env cli tool. This is useful for installing dependencies for custom cli commands.')
            .action(async () => {
                throw new Error('This command will never reach here, it is handled by the bin/env shell script.');
            });
    }
});
