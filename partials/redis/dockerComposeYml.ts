import type {BodyBuilder} from '@builder/partial/types.ts';
import type {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody.ts';
import {envRedisDockerComposeEnvironmentDefinition} from './envTpl.ts';

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
