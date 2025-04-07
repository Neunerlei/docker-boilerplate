import {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody';
import type {BodyBuilder} from '@builder/partial/types';
import {envMysqlDockerComposeEnvironmentSelfDefinition} from './envTpl.ts';

export const dockerComposeYmlBefore: BodyBuilder<DockerComposeBody> = async (body, _, context) => {
    body.setService('mysql', {
        container_name: '${PROJECT_NAME}-mysql',
        image: 'mysql:' + context.getPartialVersion('mysql'),
        command: [
            '--default-authentication-plugin=mysql_native_password',
            '--max_connections=2000'
        ],
        environment: envMysqlDockerComposeEnvironmentSelfDefinition(),
        ulimits: {
            nofile: {
                soft: 65536,
                hard: 65536
            }
        },
        restart: 'no',
        volumes: [
            'mysql_data:/var/lib/mysql'
        ],
        ports: [
            '${DOCKER_PROJECT_IP:-127.0.0.1}:${MYSQL_PORT:-3306}:3306'
        ]
    });

    body.merge({
        volumes: {
            mysql_data: {
                driver: 'local'
            }
        }
    });
};
