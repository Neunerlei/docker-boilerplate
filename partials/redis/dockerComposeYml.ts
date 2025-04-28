import type {BodyBuilder} from '@boiler/partial/types.js';
import type {DockerComposeBody} from '@boiler/filebuilder/body/DockerComposeBody.js';
import {envRedisDockerComposeEnvironmentDefinition} from './envTpl.js';

export const dockerComposeYml: BodyBuilder<DockerComposeBody> = async (body, {partial}) => {
    body.setService('redis', {
        image: 'redis:' + partial.version,
        restart: 'always',
        volumes: [
            'redis_data:/root/redis'
        ],

        environment: envRedisDockerComposeEnvironmentDefinition()
    });

    body.merge({
        volumes: {
            redis_data: {
                driver: 'local'
            }
        }
    });
};
