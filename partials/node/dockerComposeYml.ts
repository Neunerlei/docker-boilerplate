import {type BodyBuilder} from '@boiler/partial/types';
import {DockerComposeBody} from '@boiler/filebuilder/body/DockerComposeBody';
import type {NodeUsage} from './askForUsage.js';

export function dockerComposeYml(usage: NodeUsage): BodyBuilder<DockerComposeBody> {
    return async (body, {partial}) => {
        const {key, outputDirectory} = partial;

        const service: Record<any, any> = {
            image: '${COMPOSE_PROJECT_NAME}-' + key + ':dev',
            build: {
                context: '.',
                target: key + '_dev',
                args: [
                    'DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}',
                    'DOCKER_GID=${DOCKER_GID:-1000}',
                    'DOCKER_UID=${DOCKER_UID:-1000}'
                ]
            },
            restart: 'no',
            volumes: [
                '.' + outputDirectory + ':/var/www/html',
                './docker/node/node.entrypoint.dev.sh:/usr/bin/app/entrypoint.sh'
            ],
            environment: [
                'DOCKER_PROJECT_INSTALLED=${DOCKER_PROJECT_INSTALLED:-"false"}',
                'DOCKER_PROJECT_DOMAIN=${DOCKER_PROJECT_DOMAIN:-localhost}'
            ],
            extra_hosts: [
                'host.docker.internal:host-gateway'
            ]
        };

        if (usage.handlesWebTraffic) {
            service.healthcheck = {
                test: `curl --fail http://localhost:${usage.port} || exit 1`,
                interval: '10s',
                timeout: '5s',
                retries: 3,
                start_period: '10s'
            };
            service.ports = [
                `\${DOCKER_PROJECT_IP:-127.0.0.1}:${usage.port}:${usage.port}`
            ];
        }

        body.setService('node', service);
    };
}
