import {PartialDefinition} from '@builder/partial/types';
import {dockerComposeYmlBefore} from './dockerComposeYml';
import {envTpl} from './envTpl';

export default function (): PartialDefinition {
    return {
        key: 'mysql',
        name: 'MySQL',
        versions: ['8.0'],
        bodyBuilders: async (collector) => {
            collector
                .add('docker-compose.yml', dockerComposeYmlBefore, 'before')
                .add('.env.tpl', envTpl);
        }
    };
}
