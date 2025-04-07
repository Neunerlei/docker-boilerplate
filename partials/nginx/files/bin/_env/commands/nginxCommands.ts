import type {CommandEntrypoint} from '@/types';
import {exec} from 'node:child_process';

const commands: CommandEntrypoint = async function (program, context) {
    program
        .command('open')
        .description('opens the current project in your browser.')
        .action(() => {
            exec(`open ${context.getConfig().docker.projectHost}`);
        });
};

export default commands;
