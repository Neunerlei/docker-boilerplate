import type {PartialContext} from '@builder/partial/PartialContext.ts';
import type {PartialDefinition} from '@builder/partial/types.ts';
import {dockerComposeYml} from './dockerComposeYml.ts';
import {envTpl} from './envTpl.ts';

export default function (context: PartialContext): PartialDefinition {
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
