import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {envTpl} from './envTpl';
import {dockerComposeYml} from './dockerComposeYml';
import {bashlyYml} from './bashlyYml';

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'mailhog',
        name: 'Mailhog Mail Trap',
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        fileBuilder: {
            '.env.tpl': envTpl,
            'bashly.yml': bashlyYml,
            'docker-compose.yml': {
                before: dockerComposeYml
            },
            'php.dev.ini': async body => {
                body.append('sendmail_path = /usr/local/bin/mailhog sendmail test@example.org --smtp-addr mailhog:1025 -t', true)
            }
        }
    }
}
