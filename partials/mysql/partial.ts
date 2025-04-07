import {PartialDefinition} from '@builder/partial/types';
import {dockerComposeYmlBefore, dockerComposeYmlModify} from './dockerComposeYml';
import {envTpl} from './envTpl';

export default function (): PartialDefinition {
    return {
        key: 'mysql',
        name: 'MySQL',
        versions: ['8.0'],
        bodyBuilders: async (collector) => {
            collector
                .add('docker-compose.yml', dockerComposeYmlBefore, 'before')
                .add('docker-compose.yml', dockerComposeYmlModify)
                .add('.env.tpl', envTpl);
        }
    };
}
