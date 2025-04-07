import {PartialContext} from '@builder/partial/PartialContext';
import {PartialDefinition} from '@builder/partial/types';
import {dockerfileFpmDebian, dockerfileRedisAddon} from './dockerfile';
import {
    dockerComposeYml,
    dockerComposeYmlMysqlAddon,
    dockerComposeYmlNginxShare,
    dockerComposeYmlRedisAddon
} from './dockerComposeYml';
import {confirm} from '@inquirer/prompts';
import {nginxConf} from './nginxConf';

export default function (context: PartialContext): PartialDefinition {
    let createPublicShare = false;
    let installRedis = false;
    let installMysql = false;

    return {
        key: 'php',
        name: 'PHP',
        standalone: true,
        versions: ['8.4'],
        init: async () => {
            if (context.isSelectedPartial('nginx')) {
                createPublicShare = await confirm({
                    message: 'You are running nginx, do you want to share the public directory of your PHP application, so assets can be served by nginx?',
                    default: true
                });
            }

            if (context.isSelectedPartial('redis')) {
                installRedis = await confirm({
                    message: 'You enabled Redis, do you want to install the Redis extension for PHP?',
                    default: true
                });
            }

            if (context.isSelectedPartial('mysql')) {
                installMysql = await confirm({
                    message: 'You enabled MySQL, do you want to set up the PHP container for it?',
                    default: true
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

            if (installRedis) {
                collector.add('Dockerfile', dockerfileRedisAddon);
                collector.add('docker-compose.yml', dockerComposeYmlRedisAddon);
            }

            if (installMysql) {
                collector.add('docker-compose.yml', dockerComposeYmlMysqlAddon);
            }
        }
    };
}
