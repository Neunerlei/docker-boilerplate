import type {AddonEntrypoint} from '@/loadAddons.js';

export const addon: AddonEntrypoint = async (context) => ({
    commands: async (program) => {
        program
            .command('test:unit')
            .description('allows you to run tests against the current codebase')
            .option('-c, --coverage', 'Generates a coverage report')
            .option('-t, --coverage-text', 'Generates a text coverage report')
            .allowExcessArguments(true)
            .allowUnknownOption(true)
            .action(async (options, command) => {
                if (!context.composer.areComposerDependenciesInstalled) {
                    await context.composer.install();
                }

                if (options.coverage) {
                    await context.composer.exec(['run', 'test:unit:coverage', ...command.args]);
                    return;
                }

                if (options.coverageText) {
                    await context.composer.exec(['run', 'test:unit:coverage:text', ...command.args]);
                    return;
                }

                await context.composer.exec(['run', 'test:unit', ...command.args]);
            });
    }
});
