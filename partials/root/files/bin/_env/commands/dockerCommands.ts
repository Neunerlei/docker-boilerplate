import type {CommandEntrypoint} from '@/types.js';
import {DockerContext} from './docker/DockerContext.js';
import {DockerConfig} from './docker/DockerConfig.js';
import type {Command} from 'commander';

const commands: CommandEntrypoint = async function (program, context) {
    context.getConfig().registerAddon('docker', new DockerConfig());
    context.registerAddon('docker', new DockerContext(context));

    // Stupid workaround to ensure context.docker.getComposeCommandHelp() works correctly.
    await context.docker.getComposeExecutable();

    program
        .command('docker:up')
        .alias('up')
        .description('Starts the docker containers (docker compose up)')
        .addHelpText('after', () => context.docker.getComposeCommandHelp('up'))
        .option('-f, --attach', 'follows the output of your app like docker compose does', false)
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((options, command) => context.docker.up({
            follow: options.attach,
            args: command.args
        }).then());

    program
        .command('docker:stop')
        .alias('stop')
        .description('Stops the docker containers (docker compose stop)')
        .addHelpText('after', () => context.docker.getComposeCommandHelp('stop'))
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((_, command) => context.docker.stop(command.args));

    program
        .command('docker:down')
        .alias('down')
        .description('Stops and removes the docker containers (docker compose down)')
        .addHelpText('after', () => context.docker.getComposeCommandHelp('down'))
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((_, command) => context.docker.down(command.args));

    program
        .command('docker:restart')
        .alias('restart')
        .description('Restarts the docker containers (docker compose restart), all arguments and flags are passed to the "up" command')
        .option('--force', 'instead of stopping the containers, a "down" and "up" is performed', false)
        .option('-f, --attach', 'follows the output of your app (after the restart) like docker compose does', false)
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((options, command) => context.docker.restart({
            follow: options.attach,
            args: command.args
        }).then());

    program
        .command('docker:clean')
        .alias('clean')
        .description('Stops the project and removes all containers, networks, volumes and images')
        .option('-y, --yes', 'skips the confirmation prompt', false)
        .action((options) => context.docker.clean(options.yes));

    program
        .command('docker:logs')
        .alias('logs')
        .description('Shows the logs of the docker containers (docker compose logs) - by default only the logs of the main container are shown, use "--all" to show all logs')
        .option('-a, --all', 'shows all logs, instead only the logs of the main container', false)
        .option('-f, --follow', 'follows the output of the logs', false)
        .addHelpText('after', () => context.docker.getComposeCommandHelp('logs'))
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action(async (options, command: Command) => {
            return context.docker.logs({all: options.all, args: [(options.follow ? '-f' : ''), ...command.args]});
        });

    program
        .command('docker:ssh')
        .alias('ssh')
        .description('Opens a shell in a docker container (docker compose exec)')
        .argument('[service]', 'the service to open the shell in')
        .option('-c, --cmd <cmd>', 'the command to execute in the container')
        .action((service, options) => context.docker.ssh(service, options.cmd));

    program
        .command('docker:ps')
        .alias('ps')
        .description('Shows the docker containers of the project (docker compose ps)')
        .addHelpText('after', () => context.docker.getComposeCommandHelp('ps'))
        .allowExcessArguments(true)
        .allowUnknownOption(true)
        .action((_, command) => context.docker.ps(command.args));
};

export default commands;
