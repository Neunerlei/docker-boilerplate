import {Partial} from '@boiler/partial/Partial.js';
import {PartialDefinition} from '@boiler/partial/types';
import {dockerfileFpmDebian, dockerfileRedisAddon} from './dockerfile';
import {
    dockerComposeYml,
    dockerComposeYmlMysqlAddon,
    dockerComposeYmlNginxShare,
    dockerComposeYmlRedisAddon
} from './dockerComposeYml';
import {confirm} from '@inquirer/prompts';
import {nginxConf} from './nginxConf';
import {uiTextNsGetter} from '@boiler/util/uiUtils.js';

export default function (partial: Partial): PartialDefinition {
    let createPublicShare = false;
    let installRedis = false;
    let installMysql = false;

    const phpNs = uiTextNsGetter('PHP');
    const {summary} = partial;

    return {
        key: 'php',
        name: 'PHP',
        standalone: true,
        versions: ['8.4'],
        init: async () => {
            if (partial.getOtherPartial('nginx')?.isUsed) {
                createPublicShare = await confirm({
                    message: phpNs('You are running nginx, do you want to share the public directory of your PHP application, so assets can be served by nginx?'),
                    default: true
                });
                if (createPublicShare) {
                    summary.addMessage('The public directory of your PHP application will be shared with nginx.');
                }
            }

            if (partial.getOtherPartial('redis')?.isUsed) {
                installRedis = await confirm({
                    message: phpNs('You enabled Redis, do you want to install the Redis extension for PHP?'),
                    default: true
                });

                if (installRedis) {
                    summary.addMessage('The Redis extension will be installed.');
                }
            }

            if (partial.getOtherPartial('mysql')?.isUsed) {
                installMysql = await confirm({
                    message: phpNs('You enabled MySQL, do you want to set up the PHP container for it?'),
                    default: true
                });

                if (installMysql) {
                    summary.addMessage('The MySQL extension be installed.');
                }
            }
        },
        loadFiles: async (fs, utils) => {
            utils.setBasePath(import.meta.dirname);
            await utils.loadAppSourcesRecursively('app', partial);
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
