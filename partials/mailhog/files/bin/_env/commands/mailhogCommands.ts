import type {CommandEntrypoint} from '@/types.js';
import {MailhogConfig} from './mailhog/MailhogConfig.ts';
import {exec} from 'node:child_process';

const commands: CommandEntrypoint = async function (program, context) {
    context.getConfig().registerAddon('mailhog', new MailhogConfig());

    program
        .command('mailhog')
        .description('starts the interface of the mailhog mailtrap in your browser')
        .action(() => {
            const {docker, mailhog} = context.getConfig();
            exec(`open ${docker.projectHost}:${mailhog.port}`);
        });
};

export default commands;
