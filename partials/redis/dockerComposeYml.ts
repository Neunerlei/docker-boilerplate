import type {BodyBuilder} from '@builder/partial/types.ts';
import type {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody.ts';
import {envRedisDockerComposeEnvironmentDefinition} from './envTpl.ts';

export const dockerComposeYml: BodyBuilder<DockerComposeBody> = async (body, _, context) => {
    body.setService('redis', {
        container_name: '${PROJECT_NAME}-redis',
        image: 'redis:' + context.getPartialVersion('redis'),
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
