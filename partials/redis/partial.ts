import type {PartialDefinition} from '@boiler/partial/types.js';
import {dockerComposeYml} from './dockerComposeYml.js';
import {envTpl} from './envTpl.js';

export default function (): PartialDefinition {
    return {
        key: 'redis',
        name: 'Redis',
        versions: ['7'],
        bodyBuilders: async (collector) => {
            collector
                .add('docker-compose.yml', dockerComposeYml)
                .add('.env.tpl', envTpl);
        }
    };
}
