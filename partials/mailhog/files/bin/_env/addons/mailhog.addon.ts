import type {AddonEntrypoint} from '@/loadAddons.js';
import {executeCommand} from '@/executeCommand.js';
import {MailhogContext} from './mailhog/MailhogContext.js';

export const addon: AddonEntrypoint = async (context) => ({
    context: async () => ({
        mailhog: new MailhogContext(context)
    }),
    commands: async (program) => {
        program
            .command('mailhog')
            .description('starts the interface of the mailhog mailtrap in your browser')
            .action(async () => {
                const {docker, mailhog} = context;

                await docker.ensureComposeServiceIsRunning('mailhog');
                await executeCommand('open', [`http://${docker.projectDomain}:${mailhog.port}`]);
            });
    }
});
