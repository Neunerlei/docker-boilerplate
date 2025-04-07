import {PartialDefinition} from '@builder/partial/types';
import {envTpl} from './envTpl';
import {dockerComposeYml} from './dockerComposeYml';

export default function (): PartialDefinition {
    return {
        key: 'mailhog',
        name: 'Mailhog Mail Trap',
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        bodyBuilders: async (collector) => {
            collector
                .add('.env.tpl', envTpl)
                .add('docker-compose.yml', dockerComposeYml, 'before')
                .add('Dockerfile', async body => {
                    body.get('php').getDev().addBefore('run.addMailhogSender', 'run.addSudo', `
# Install mhsendmail (Mailhog sendmail)
RUN curl --fail --silent --location --output /tmp/mhsendmail https://github.com/mailhog/mhsendmail/releases/download/v0.2.0/mhsendmail_linux_amd64 \\
    && chmod +x /tmp/mhsendmail \\
    && mv /tmp/mhsendmail /usr/bin/mhsendmail      
`);
                })
                .add('php.dev.ini', async body => {
                    body.append('sendmail_path = "/usr/bin/mhsendmail -t --from=test@example.org --smtp-addr=mailhog:1025"', true);
                });
        }
    };
}
