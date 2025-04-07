import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {dockerfileFpmDebian} from './dockerfile';
import {dockerComposeYml, dockerComposeYmlNginxShare} from './dockerComposeYml';
import {confirm} from '@inquirer/prompts';
import {nginxConf} from './nginxConf';

export default function (context: PartialContext): PartialDefinition {
    let createPublicShare = false;
    return {
        key: 'php',
        name: 'PHP',
        standalone: true,
        versions: ['8.4'],
        init: async () => {
            if (context.isSelectedPartial('nginx')) {
                createPublicShare = await confirm({
                    message: 'You are running nginx, do you want to share the public directory of your PHP application, so assets can be served by nginx?',
                    default: false
                });
            }
        },
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            await utils.loadAppSourcesRecursively('app', context);
            utils.loadRecursive('files', '/');
        },
        buildFiles: async (fs, fb) => {
            await fb('php.dev.ini')
                .setParser('string')
                .setSourceDir('/docker/php/config')
                .build();

            await fb('php.entrypoint.dev.sh')
                .setDestinationDir('/docker/php')
                .setSpecial('entrypoint')
                .build();
        },
        bodyBuilders: async (collector) => {
            collector
                .add('Dockerfile', dockerfileFpmDebian, 'before')
                .add('docker-compose.yml', dockerComposeYml, 'before')
                .add('nginx.conf', nginxConf(createPublicShare));

            if (createPublicShare) {
                collector.add('docker-compose.yml', dockerComposeYmlNginxShare);
            }
        }
    };
}
