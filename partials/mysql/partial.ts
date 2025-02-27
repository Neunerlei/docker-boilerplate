import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {bashlyYml} from './bashlyYml';
import {dockerComposeYmlBefore, dockerComposeYmlModify} from './dockerComposeYml';
import {envTpl} from './envTpl';

export default function (context: PartialContext): PartialDefinition {
    return {
        key: 'mysql',
        name: 'MySQL',
        versions: ['8.0'],
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            utils.loadRecursive('files', '/');
        },
        fileBuilder: {
            ['bashly.yml']: bashlyYml,
            ['.env.tpl']: envTpl,
            ['docker-compose.yml']: {
                before: dockerComposeYmlBefore,
                build: dockerComposeYmlModify
            }
        }
    }
}
