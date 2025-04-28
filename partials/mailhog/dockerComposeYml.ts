import {DockerComposeBody} from '@boiler/filebuilder/body/DockerComposeBody';
import type {BodyBuilder} from '@boiler/partial/types.js';

export const dockerComposeYml: BodyBuilder<DockerComposeBody> = async (body) => {
    body.setService('mailhog', {
        image: 'mailhog/mailhog:v1.0.1',
        restart: 'no',
        ports: [
            '${DOCKER_PROJECT_IP:-127.0.0.1}:1025:1025',
            '${DOCKER_PROJECT_IP:-127.0.0.1}:${MAILHOG_PORT:-8025}:8025'
        ]
    });
}
