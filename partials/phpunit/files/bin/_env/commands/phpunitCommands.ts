import type {CommandEntrypoint} from '@/types';

const commands: CommandEntrypoint = async function (program, context) {
    program
        .command('test:unit')
        .description('allows you to run tests against the current codebase')
        .option('-c, --coverage', 'Generates a coverage report')
        .option('-t, --coverage-text', 'Generates a text coverage report')
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action(async (options, command) => {
            if (!context.composer.areComposerDependenciesInstalled) {
                context.composer.install();
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
};

export default commands;
