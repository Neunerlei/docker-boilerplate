import {FileBuilderCallback} from '@builder/partial/types';
import {DockerComposeBody} from '@builder/filebuilder/body/DockerComposeBody';

export const dockerComposeYml: FileBuilderCallback<DockerComposeBody> = async (body, _, context) => {
    body.setService('mailhog', {
        container_name: '${PROJECT_NAME}-mailhog',
        image: 'mailhog/mailhog:v1.0.1',
        restart: 'no',
        ports: [
            '${DOCKER_PROJECT_IP:-127.0.0.1}:1025:1025',
            '${DOCKER_PROJECT_IP:-127.0.0.1}:${MAILHOG_PORT:-8025}:8025'
        ]
    });
}
