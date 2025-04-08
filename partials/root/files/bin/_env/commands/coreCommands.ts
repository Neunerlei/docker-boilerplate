import type {CommandEntrypoint} from '@/types.js';
import {dumpConfigToFile} from '@/Config.js';

const commands: CommandEntrypoint = async (program, context) => {
    program
        .command('config:dump')
        .description('Dumps the current config into the env.config.json')
        .action(() => {
            dumpConfigToFile(context.getPaths());
        });

    program
        .command('install')
        .description('Installs the project on your device; sets up a unique url, ip address, hosts entry and ssl certificate')
        .action(() => context.getInstaller().install());

    // Create hook to ensure loopback IP is registered before docker:up
    context.getEvents().on('docker:up:before', async () => {
        if (context.getEnv().has('DOCKER_PROJECT_INSTALLED')) {
            await context.getInstaller().ensureLoopbackIp();
        }
    });
};

export default commands;
