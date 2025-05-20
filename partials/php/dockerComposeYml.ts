import {DockerComposeBody} from '@boiler/filebuilder/body/DockerComposeBody';
import type {BodyBuilder} from '@boiler/partial/types.js';
import {envRedisDockerComposeEnvironmentDefinition} from '../redis/envTpl.js';
import {envMysqlDockerComposeEnvironmentDefinition} from '../mysql/envTpl.js';
import {fbSnipDockerComposeVolumeShare} from '@boiler/filebuilder/snippets.js';

export const dockerComposeYml: BodyBuilder<DockerComposeBody> = async (body, {partial}) => {
    body.merge({
        volumes: {
            php_socket: {}
        }
    });

    const {key, outputDirectory} = partial;

    body.setService('php', {
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
            'php_socket:/var/run/php',
            '.' + outputDirectory + ':/var/www/html'
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
};

export const dockerComposeYmlNginxShare: BodyBuilder<DockerComposeBody> = async (body, {partial}) => {
    fbSnipDockerComposeVolumeShare(
        'public',
        partial.key,
        '/var/www/html/public',
        'nginx',
        '/var/www/html/' + partial.key + '_public',
        body,
        '.' + partial.outputDirectory + '/public'
    );
};

export const dockerComposeYmlRedisAddon: BodyBuilder<DockerComposeBody> = async (body) => {
    body.mergeService('php', {
        depends_on: ['redis'],
        environment: envRedisDockerComposeEnvironmentDefinition()
    });
};

export const dockerComposeYmlMysqlAddon: BodyBuilder<DockerComposeBody> = async (body) => {
    body.mergeService('php', {
        depends_on: ['mysql'],
        environment: envMysqlDockerComposeEnvironmentDefinition()
    });
};
