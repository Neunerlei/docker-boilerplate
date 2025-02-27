import {FileBuilderCallback} from '@builder/partial/types';
import {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody';

export const dockerComposeYml: FileBuilderCallback<DockerComposeBody> = async (body, _, context) => {
    body.merge({
        volumes: {
            php_socket: {}
        }
    });

    const key = context.getRealPartialKey('php');
    const appSource = context.getPartialDir('php')

    body.setService('php', {
        container_name: '${PROJECT_NAME}-' + key,
        image: '${PROJECT_NAME}-' + key + ':dev',
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
            'php_socket:/var/run/php',
            '.' + appSource + ':/var/www/html'
        ],
        healthcheck: {
            test: 'cgi-fcgi -bind -connect 127.0.0.1:9000 || exit 1',
            interval: '10s',
            timeout: '5s',
            retries: 3,
            start_period: '30s'
        },
        ports: [
            '${DOCKER_PROJECT_IP:-127.0.0.1}:9000:9000'
        ],
        extra_hosts: [
            'host.docker.internal:host-gateway'
        ]
    });
}
